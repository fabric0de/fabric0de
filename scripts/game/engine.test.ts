import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advance,
  affordable,
  autopilot,
  choicesFor,
  chooseIncident,
  createGame,
  metrics,
  nextCutoff,
  tally,
  validateGame,
} from './engine.js';
import { getIncident } from './events.js';
import {
  END,
  renderLog,
  renderSection,
  replaceSection,
  START,
  utc,
} from './render.js';
import { deriveCreature } from './creature.js';
import { narrate, parseQuip } from './narrator.js';
import type { ChoiceId, Game, VoteComment } from './types.js';

function votingGame(): Game {
  const game = createGame();
  game.round.openedAt = '2026-09-13T08:00:01Z';
  game.round.closesAt = '2026-09-14T08:00:00Z';
  return game;
}

function comment(
  id: number,
  user: number,
  body: string,
  time = '2026-09-13T10:00:00Z'
): VoteComment {
  return {
    id,
    body,
    user: { id: user, type: 'User' },
    created_at: time,
    updated_at: time,
  };
}

test('counts the latest valid vote per human account within the fixed window', () => {
  const comments = [
    comment(1, 1, 'A'),
    comment(2, 1, ' b ', '2026-09-13T11:00:00Z'),
    comment(3, 2, 'B'),
    comment(4, 3, 'I choose A'),
    comment(5, 4, 'C', '2026-09-14T08:00:00Z'),
    comment(6, 5, 'A', '2026-09-12T23:00:00Z'),
    { ...comment(7, 6, 'A'), user: { id: 6, type: 'Bot' } },
    { ...comment(8, 7, 'C'), updated_at: '2026-09-14T09:00:00Z' },
  ];
  assert.deepEqual(tally(votingGame(), comments), {
    choice: 'B',
    reason: 'vote',
    counts: { A: 0, B: 2, C: 0 },
    voters: 2,
  });
});

test('tie resolution and no-vote autopilot are deterministic', () => {
  assert.equal(
    tally(votingGame(), [comment(1, 1, 'C'), comment(2, 2, 'A')]).choice,
    'A'
  );
  assert.equal(
    tally(votingGame(), [comment(1, 1, 'C'), comment(2, 2, 'A')]).reason,
    'tie'
  );
  assert.equal(tally(votingGame(), []).choice, autopilot(votingGame()));
});

test('edits are ordered by time; a later invalid comment does not erase a valid vote', () => {
  const result = tally(votingGame(), [
    { ...comment(1, 1, 'A'), updated_at: '2026-09-13T12:00:00Z' },
    comment(2, 1, 'B', '2026-09-13T11:00:00Z'),
    comment(3, 1, 'hello', '2026-09-13T13:00:00Z'),
  ]);
  assert.deepEqual(result.counts, { A: 1, B: 0, C: 0 });
});

test('different first choices build different memories without fixing a species', () => {
  const original = votingGame();
  const outcomes = (['A', 'B', 'C'] as const).map((choice) =>
    advance(
      original,
      { choice, reason: 'autopilot', counts: { A: 0, B: 0, C: 0 }, voters: 0 },
      new Date(original.round.closesAt!)
    )
  );
  assert.equal(deriveCreature(outcomes[0]).affinities.exploration, 2);
  assert.equal(deriveCreature(outcomes[1]).affinities.resolve, 2);
  assert.equal(deriveCreature(outcomes[2]).affinities.resonance, 2);
  assert.ok(outcomes.every((game) => deriveCreature(game).experience === 3));
  assert.deepEqual(original, votingGame());
  for (const game of outcomes) validateGame(game);
});

test('learned abilities persist and unlock distinct encounters', () => {
  const game = votingGame();
  game.round.incidentId = 'fragment-forge';
  game.world.fragments = 12;
  const learned = advance(
    game,
    {
      choice: 'B',
      reason: 'autopilot',
      counts: { A: 0, B: 0, C: 0 },
      voters: 0,
    },
    new Date(game.round.closesAt!)
  );
  assert.deepEqual(learned.world.abilities, ['phase-step']);
  assert.equal(learned.history[0].experience, 5);
  assert.ok(getIncident('sky-gap').eligible(learned.world));
  assert.ok(!getIncident('sky-gap').eligible(game.world));
  assert.deepEqual(game.world.abilities, []);
  learned.round.incidentId = 'fragment-forge';
  learned.world.fragments = 100;
  assert.equal(
    affordable(learned, choicesFor(learned)[1]),
    false,
    'cannot buy an ability twice'
  );
});

test('exhausted creatures can recover without spending fragments or forgetting abilities', () => {
  const game = votingGame();
  game.world.energy = 0;
  game.world.stability = 0;
  game.world.fragments = 0;
  game.world.abilities = ['aegis'];
  game.round.incidentId = chooseIncident(game.world, 5, []);
  assert.equal(game.round.incidentId, 'safe-haven');
  assert.ok(choicesFor(game).every((choice) => affordable(game, choice)));
  const recovered = advance(
    game,
    tally(game, []),
    new Date(game.round.closesAt!)
  );
  assert.ok(recovered.world.energy > 0 && recovered.world.stability > 0);
  assert.deepEqual(recovered.world.abilities, ['aegis']);
  assert.equal(deriveCreature(recovered).experience, 3);
});

test('unaffordable choices cannot win a vote or be executed', () => {
  const game = votingGame();
  game.world.fragments = 0;
  assert.equal(affordable(game, choicesFor(game)[1]), false);
  assert.equal(tally(game, [comment(1, 1, 'B')]).voters, 0);
  game.world.energy = 0;
  assert.equal(affordable(game, choicesFor(game)[0]), false);
  assert.throws(
    () =>
      advance(
        game,
        {
          choice: 'A',
          reason: 'autopilot',
          counts: { A: 0, B: 0, C: 0 },
          voters: 0,
        },
        new Date(game.round.closesAt!)
      ),
    /Unavailable/
  );
});

test('deadline uses 08:00 UTC across cutoffs, time zones, and year boundaries', () => {
  assert.equal(
    nextCutoff(new Date('2026-12-31T23:59:00Z')),
    '2027-01-01T08:00:00.000Z'
  );
  assert.equal(
    nextCutoff(new Date('2026-09-13T08:00:00Z')),
    '2026-09-14T08:00:00.000Z'
  );
  assert.equal(
    nextCutoff(new Date('2026-09-13T07:59:59Z')),
    '2026-09-13T08:00:00.000Z'
  );
  assert.equal(
    nextCutoff(new Date('2026-09-13T08:00:01Z')),
    '2026-09-14T08:00:00.000Z'
  );
  assert.equal(
    nextCutoff(new Date('2026-09-13T17:00:00+09:00')),
    '2026-09-14T08:00:00.000Z'
  );
  assert.throws(
    () =>
      advance(
        votingGame(),
        tally(votingGame(), []),
        new Date('2026-09-13T12:00:00Z')
      ),
    /not closed/
  );
});

test('three different policies survive a year of turns with valid state and lasting history', () => {
  const endings: string[] = [];
  for (let policy = 0; policy < 3; policy++) {
    let game = createGame();
    let now = new Date('2026-01-01T01:00:00Z');
    const seen = new Set<string>();
    for (let i = 0; i < 365; i++) {
      game.round.openedAt = now.toISOString();
      game.round.closesAt = nextCutoff(now);
      now = new Date(game.round.closesAt);
      seen.add(game.round.incidentId);
      const available = choicesFor(game).filter((choice) =>
        affordable(game, choice)
      );
      assert.ok(available.length > 0);
      const choice: ChoiceId =
        policy === 0
          ? autopilot(game)
          : available[(i + policy) % available.length].id;
      game = advance(
        game,
        {
          choice,
          reason: 'autopilot',
          counts: { A: 0, B: 0, C: 0 },
          voters: 0,
        },
        now
      );
      validateGame(game);
      assert.ok(game.world.energy >= 0 && game.world.energy <= 100);
      assert.ok(game.world.stability >= 0 && game.world.stability <= 100);
      assert.equal(
        new Set(game.world.abilities).size,
        game.world.abilities.length
      );
    }
    assert.equal(game.round.day, 366);
    assert.equal(game.history.length, 365);
    assert.ok(seen.size >= 6, `not enough variety for policy ${policy}`);
    endings.push(JSON.stringify(game.world));
  }
  assert.equal(new Set(endings).size, 3);
});

test('recovery takes priority over recent encounters when the core is unstable', () => {
  const game = createGame();
  game.world.stability = 20;
  game.world.abilities = ['echo-map'];
  assert.equal(chooseIncident(game.world, 100, ['safe-haven']), 'safe-haven');
});

test('rendering preserves the profile and never invents a voting link', () => {
  const game = createGame();
  const before = '# My profile\nMy links\n';
  const after = '\nMy footer\n';
  const input = `${before}${START}\nold\n${END}${after}`;
  const output = replaceSection(input, game, 'fabric0de/fabric0de');
  assert.ok(output.startsWith(before));
  assert.ok(output.endsWith(after));
  assert.match(output, /first vote opens when the story begins/);
  assert.match(output, /08:00 UTC/);
  assert.equal(utc('2026-09-13T17:00:00+09:00'), '2026-09-13 08:00 UTC');
  assert.ok(!output.includes('/issues/'));
  assert.equal(output, replaceSection(output, game, 'fabric0de/fabric0de'));
  assert.throws(() => replaceSection('# missing', game, 'a/b'));
  assert.throws(() => replaceSection(input + START, game, 'a/b'));
  game.round.quip = '<script>[click](https://example.test)</script>';
  assert.ok(!renderSection(game, 'a/b').includes('<script>'));
  assert.match(renderLog(game, 'a/b'), /No decisions yet/);
});

test('narration can be disabled and invalid content is rejected', async () => {
  const game = createGame();
  let called = false;
  const disabled: typeof fetch = async () => {
    called = true;
    throw new Error('must not call');
  };
  assert.equal(
    await narrate(game, {}, disabled),
    getIncident(game.round.incidentId).quip
  );
  assert.equal(
    await narrate(
      game,
      {
        GAME_NARRATION: 'off',
        CF_ACCOUNT_ID: 'a'.repeat(32),
        CF_API_TOKEN: 'fake',
      },
      disabled
    ),
    getIncident(game.round.incidentId).quip
  );
  assert.equal(called, false);
  assert.throws(() => parseQuip({ quip: 'Visit https://example.test' }));
  assert.throws(() => parseQuip({ quip: 'Latency is 50ms.' }));
});

test('corrupt or mismatched state fails before publication', () => {
  assert.throws(() => validateGame({ version: 99 }));
  assert.throws(() => validateGame({ ...createGame(), version: 1 }));
  const completed = advance(
    votingGame(),
    tally(votingGame(), []),
    new Date(votingGame().round.closesAt!)
  );
  completed.history[0].experience = 999;
  assert.throws(() => validateGame(completed), /experience/);
  const game = createGame();
  game.round.day = 10;
  assert.throws(() => validateGame(game), /sequence/);
});
