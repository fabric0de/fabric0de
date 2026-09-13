import {
  advance,
  affordable,
  autopilot,
  choicesFor,
  createGame,
  metrics,
  nextCutoff,
} from './engine.js';
import { getIncident } from './events.js';
import type { Decision } from './types.js';

const days = Number(process.argv[2] ?? 365);
if (!Number.isInteger(days) || days < 1 || days > 10000)
  throw new Error('Choose 1–10000 days');
for (const policy of ['autopilot', 'rotating', 'collector'] as const) {
  let game = createGame();
  let now = new Date('2026-01-01T01:00:00Z');
  const seen = new Set<string>();
  let degraded = 0;
  for (let day = 0; day < days; day++) {
    game.round.openedAt = now.toISOString();
    game.round.closesAt = nextCutoff(now);
    now = new Date(game.round.closesAt);
    seen.add(getIncident(game.round.incidentId).id);
    const choices = choicesFor(game).filter((choice) =>
      affordable(game, choice)
    );
    const choice =
      policy === 'autopilot'
        ? autopilot(game)
        : policy === 'rotating'
          ? choices[day % choices.length].id
          : [...choices].sort(
              (a, b) => (b.effect.fragments ?? 0) - (a.effect.fragments ?? 0)
            )[0].id;
    const decision: Decision = {
      choice,
      reason: 'autopilot',
      counts: { A: 0, B: 0, C: 0 },
      voters: 0,
    };
    game = advance(game, decision, now);
    if (metrics(game.world).status !== 'curious') degraded++;
  }
  console.log(
    JSON.stringify(
      {
        policy,
        days,
        uniqueIncidents: seen.size,
        recoveryOrTiredDays: degraded,
        world: game.world,
        metrics: metrics(game.world),
      },
      null,
      2
    )
  );
}
