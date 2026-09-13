import { getIncident, incidents } from './events.js';
import { abilities, affinities } from './types.js';
import type {
  Choice,
  ChoiceId,
  Decision,
  Game,
  Metrics,
  VoteComment,
  World,
} from './types.js';

export const ids: ChoiceId[] = ['A', 'B', 'C'];
const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

export function createGame(): Game {
  return {
    version: 2,
    world: { energy: 70, stability: 70, bond: 10, fragments: 8, abilities: [] },
    round: {
      day: 1,
      incidentId: 'first-signal',
      openedAt: null,
      closesAt: null,
      issueNumber: null,
      quip: getIncident('first-signal').quip,
    },
    history: [],
  };
}
export function metrics(world: World): Metrics {
  return {
    status:
      world.stability < 35
        ? 'recovering'
        : world.energy < 25
          ? 'tired'
          : 'curious',
  };
}
export function choicesFor(game: Game): Choice[] {
  return structuredClone(getIncident(game.round.incidentId).choices);
}
export function affordable(game: Game, choice: Choice): boolean {
  if (choice.effect.learn && game.world.abilities.includes(choice.effect.learn))
    return false;
  return (
    game.world.fragments + (choice.effect.fragments ?? 0) >= 0 &&
    game.world.energy + (choice.effect.energy ?? 0) >= 0
  );
}
export function applyChoice(world: World, choice: Choice): World {
  const next = structuredClone(world);
  for (const key of ['energy', 'stability', 'bond', 'fragments'] as const)
    next[key] = clamp(
      next[key] + (choice.effect[key] ?? 0),
      0,
      key === 'fragments' ? 999 : 100
    );
  // A little passive recovery happens once per completed decision, never per visit.
  next.energy = clamp(next.energy + 6, 0, 100);
  if (choice.effect.learn && !next.abilities.includes(choice.effect.learn))
    next.abilities.push(choice.effect.learn);
  return next;
}
// Care first, with an incentive to learn a new ability. Saturation prevents
// endless optimization of already-full meters. A/B/C breaks ties publicly.
export function autopilot(game: Game): ChoiceId {
  return choicesFor(game)
    .filter((choice) => affordable(game, choice))
    .map((choice) => {
      const after = applyChoice(game.world, choice);
      return {
        id: choice.id,
        score:
          Math.min(after.energy, 75) +
          Math.min(after.stability, 75) +
          Math.min(after.bond, 60) / 4 +
          Math.min(after.fragments, 24) / 2 +
          (choice.effect.learn ? 20 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))[0].id;
}

export function tally(game: Game, comments: VoteComment[]): Decision {
  if (!game.round.openedAt || !game.round.closesAt)
    throw new Error('Round has no voting window');
  const start = Date.parse(game.round.openedAt);
  const end = Date.parse(game.round.closesAt);
  const available = new Set(
    choicesFor(game)
      .filter((choice) => affordable(game, choice))
      .map((choice) => choice.id)
  );
  const last = new Map<
    number,
    { id: number; time: number; choice: ChoiceId }
  >();
  for (const comment of comments) {
    if (!comment.user || comment.user.type !== 'User') continue;
    const match = /^\s*([ABC])\s*$/i.exec(comment.body);
    if (!match) continue;
    const choice = match[1].toUpperCase() as ChoiceId;
    const created = Date.parse(comment.created_at);
    const time = Date.parse(comment.updated_at);
    if (
      !Number.isFinite(created) ||
      !Number.isFinite(time) ||
      created < start ||
      created >= end ||
      time < created ||
      time >= end ||
      !available.has(choice)
    )
      continue;
    const previous = last.get(comment.user.id);
    if (
      !previous ||
      previous.time < time ||
      (previous.time === time && previous.id < comment.id)
    )
      last.set(comment.user.id, { id: comment.id, time, choice });
  }
  const counts = { A: 0, B: 0, C: 0 };
  for (const vote of last.values()) counts[vote.choice]++;
  const highest = Math.max(...Object.values(counts));
  if (highest === 0)
    return { choice: autopilot(game), reason: 'autopilot', counts, voters: 0 };
  const winners = ids.filter((id) => counts[id] === highest);
  return {
    choice: winners[0],
    reason: winners.length > 1 ? 'tie' : 'vote',
    counts,
    voters: last.size,
  };
}

export function nextCutoff(now: Date): string {
  const cutoff = new Date(now);
  cutoff.setUTCHours(8, 0, 0, 0); // 08:00 UTC / 17:00 Asia/Seoul
  if (cutoff.getTime() <= now.getTime())
    cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  return cutoff.toISOString();
}

export function chooseIncident(
  world: World,
  day: number,
  recent: string[]
): string {
  if (getIncident('safe-haven').eligible(world)) return 'safe-haven';
  const candidates = incidents.filter(
    (incident) =>
      !['first-signal', 'safe-haven'].includes(incident.id) &&
      incident.eligible(world)
  );
  const fresh = candidates.filter(
    (incident) => !recent.slice(-3).includes(incident.id)
  );
  const pool = fresh.length ? fresh : candidates;
  const seed =
    (day * 31 + world.energy * 7 + world.bond * 3 + world.fragments) >>> 0;
  return pool[seed % pool.length].id;
}

export function advance(game: Game, decision: Decision, now: Date): Game {
  if (!game.round.closesAt || now.getTime() < Date.parse(game.round.closesAt))
    throw new Error('Voting has not closed');
  const choice = choicesFor(game).find((entry) => entry.id === decision.choice);
  if (!choice || !affordable(game, choice))
    throw new Error('Unavailable choice');
  const world = applyChoice(game.world, choice);
  const history = [
    ...game.history,
    {
      day: game.round.day,
      incidentId: game.round.incidentId,
      title: getIncident(game.round.incidentId).title,
      resolvedAt: game.round.closesAt,
      issueNumber: game.round.issueNumber,
      decision: structuredClone(decision),
      choiceTitle: choice.title,
      explanation: choice.explanation,
      learning: { ...choice.learning },
      experience:
        3 + (world.abilities.length > game.world.abilities.length ? 2 : 0),
      before: structuredClone(game.world),
      after: structuredClone(world),
      metrics: metrics(world),
    },
  ];
  const day = game.round.day + 1;
  const incidentId = chooseIncident(
    world,
    day,
    history.map((entry) => entry.incidentId)
  );
  return {
    version: 2,
    world,
    history,
    round: {
      day,
      incidentId,
      openedAt: null,
      closesAt: null,
      issueNumber: null,
      quip: getIncident(incidentId).quip,
    },
  };
}

function validateWorld(world: World): void {
  if (!world || typeof world !== 'object') throw new Error('Invalid world');
  for (const key of ['energy', 'stability', 'bond', 'fragments'] as const)
    if (
      !Number.isInteger(world[key]) ||
      world[key] < 0 ||
      world[key] > (key === 'fragments' ? 999 : 100)
    )
      throw new Error(`World field out of range: ${key}`);
  if (
    !Array.isArray(world.abilities) ||
    new Set(world.abilities).size !== world.abilities.length ||
    !world.abilities.every((ability) => abilities.includes(ability))
  )
    throw new Error('Invalid abilities');
}

export function validateGame(input: unknown): asserts input is Game {
  if (!input || typeof input !== 'object')
    throw new Error('Invalid game state');
  const game = input as Game;
  if (
    game.version !== 2 ||
    !game.world ||
    !game.round ||
    !Array.isArray(game.history)
  )
    throw new Error('Unsupported game state');
  validateWorld(game.world);
  if (
    !Number.isInteger(game.round.day) ||
    game.round.day < 1 ||
    game.round.day !== game.history.length + 1
  )
    throw new Error('Invalid day/history sequence');
  getIncident(game.round.incidentId);
  if (typeof game.round.quip !== 'string') throw new Error('Invalid narration');
  const { openedAt, closesAt, issueNumber } = game.round;
  if ((openedAt === null) !== (closesAt === null))
    throw new Error('Incomplete voting window');
  if (
    openedAt !== null &&
    (!Number.isFinite(Date.parse(openedAt)) ||
      !Number.isFinite(Date.parse(closesAt!)) ||
      Date.parse(openedAt) >= Date.parse(closesAt!))
  )
    throw new Error('Invalid voting window');
  if (
    issueNumber !== null &&
    (!Number.isInteger(issueNumber) || issueNumber < 1 || openedAt === null)
  )
    throw new Error('Invalid issue number');
  let previous: World | undefined;
  for (const [index, entry] of game.history.entries()) {
    validateWorld(entry.before);
    validateWorld(entry.after);
    getIncident(entry.incidentId);
    if (
      entry.day !== index + 1 ||
      !Number.isFinite(Date.parse(entry.resolvedAt)) ||
      typeof entry.title !== 'string' ||
      typeof entry.choiceTitle !== 'string' ||
      typeof entry.explanation !== 'string'
    )
      throw new Error('Invalid history entry');
    const d = entry.decision;
    if (
      !d ||
      !ids.includes(d.choice) ||
      !['vote', 'tie', 'autopilot'].includes(d.reason) ||
      !d.counts ||
      !ids.every((id) => Number.isInteger(d.counts[id]) && d.counts[id] >= 0) ||
      d.voters !== ids.reduce((n, id) => n + d.counts[id], 0)
    )
      throw new Error('Invalid historical decision');
    if (
      !entry.learning ||
      Object.keys(entry.learning).some(
        (key) => !affinities.includes(key as (typeof affinities)[number])
      ) ||
      !Object.values(entry.learning).every(
        (n) => Number.isInteger(n) && n >= 0 && n <= 2
      ) ||
      Object.values(entry.learning).reduce((a, b) => a + b, 0) !== 2
    )
      throw new Error('Invalid historical learning');
    if (
      entry.experience !==
      3 + (entry.after.abilities.length > entry.before.abilities.length ? 2 : 0)
    )
      throw new Error('Invalid historical experience');
    if (previous && JSON.stringify(previous) !== JSON.stringify(entry.before))
      throw new Error('Broken history continuity');
    if (
      entry.before.abilities.some(
        (ability) => !entry.after.abilities.includes(ability)
      )
    )
      throw new Error('Learned abilities cannot be erased');
    previous = entry.after;
  }
  if (previous && JSON.stringify(previous) !== JSON.stringify(game.world))
    throw new Error('World does not match history');
}
