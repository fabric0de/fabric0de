import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from './engine.js';
import { getIncident } from './events.js';
import { GitHub, parseMeta } from './github.js';
import { synchronize } from './runner.js';
import type { Game, VoteComment } from './types.js';

function remote() {
  const issues: {
    number: number;
    title: string;
    body: string;
    state: string;
    user: { login: string };
  }[] = [];
  let comments: VoteComment[] = [];
  let failNextCreate = false;
  let pages = 0;
  const fetcher: typeof fetch = async (url, init) => {
    const parsed = new URL(String(url));
    const route = parsed.pathname.replace('/repos/fabric0de/fabric0de', '');
    const method = init?.method ?? 'GET';
    const input = init?.body ? JSON.parse(String(init.body)) : undefined;
    let output: unknown;
    if (route.endsWith('/comments')) {
      pages++;
      const page = Number(parsed.searchParams.get('page'));
      output = comments.slice((page - 1) * 100, page * 100);
    } else if (route === '/issues' && method === 'GET') {
      const page = Number(parsed.searchParams.get('page'));
      output = [...issues].reverse().slice((page - 1) * 100, page * 100);
    } else if (route === '/issues' && method === 'POST') {
      if (failNextCreate) {
        failNextCreate = false;
        return new Response('{}', { status: 503 });
      }
      const issue = {
        number: issues.length + 1,
        title: input.title,
        body: input.body,
        state: 'open',
        user: { login: 'github-actions[bot]' },
      };
      issues.push(issue);
      output = issue;
    } else {
      const number = Number(route.split('/').at(-1));
      const issue = issues.find((entry) => entry.number === number);
      if (!issue) return new Response('{}', { status: 404 });
      if (method === 'PATCH') Object.assign(issue, input);
      output = issue;
    }
    return new Response(JSON.stringify(output), { status: 200 });
  };
  return {
    api: new GitHub(
      'fabric0de/fabric0de',
      'fake',
      'github-actions[bot]',
      fetcher
    ),
    issues,
    setComments: (next: VoteComment[]) => {
      comments = next;
    },
    failCreate: () => {
      failNextCreate = true;
    },
    pages: () => pages,
  };
}

const narrator = async (game: Game): Promise<string> =>
  getIncident(game.round.incidentId).quip;

test('first publication opens one issue and retries recover its original deadline', async () => {
  const service = remote();
  const now = new Date('2026-09-13T09:00:00Z');
  const opened = await synchronize(createGame(), service.api, now, narrator);
  assert.equal(opened.round.day, 1);
  assert.equal(opened.round.issueNumber, 1);
  const retry = await synchronize(
    createGame(),
    service.api,
    new Date('2026-09-13T10:00:00Z'),
    narrator
  );
  assert.equal(service.issues.length, 1);
  assert.equal(retry.round.closesAt, opened.round.closesAt);
  assert.equal(retry.round.openedAt, opened.round.openedAt);
});

test('a daily resolution closes the old issue and same-day retries do not advance twice', async () => {
  const service = remote();
  const game = await synchronize(
    createGame(),
    service.api,
    new Date('2026-09-13T09:00:00Z'),
    narrator
  );
  const now = new Date('2026-09-14T08:20:00Z');
  const next = await synchronize(game, service.api, now, narrator);
  assert.equal(next.round.day, 2);
  assert.equal(next.history.length, 1);
  assert.equal(service.issues[0].state, 'closed');
  assert.match(service.issues[0].body, /## Resolved/);
  assert.equal(service.issues[1].state, 'open');
  const again = await synchronize(next, service.api, now, narrator);
  assert.deepEqual(again, next);
  assert.equal(service.issues.length, 2);
  assert.equal(service.issues[0].body.split('## Resolved').length, 2);
});

test('a failed next-issue creation freezes the decision before retry', async () => {
  const service = remote();
  const game = await synchronize(
    createGame(),
    service.api,
    new Date('2026-09-13T09:00:00Z'),
    narrator
  );
  service.setComments([
    {
      id: 1,
      body: 'B',
      user: { id: 1, type: 'User' },
      created_at: '2026-09-13T10:00:00Z',
      updated_at: '2026-09-13T10:00:00Z',
    },
  ]);
  service.failCreate();
  const now = new Date('2026-09-14T08:20:00Z');
  await assert.rejects(synchronize(game, service.api, now, narrator), /503/);
  assert.match(service.issues[0].body, /bit-decision:/);
  service.setComments([]);
  const next = await synchronize(game, service.api, now, narrator);
  assert.equal(next.history[0].decision.choice, 'B');
  assert.equal(next.world.stability, 82);
  assert.deepEqual(next.history[0].learning, { resolve: 2 });
  assert.equal(service.issues.length, 2);
  const retriedCommit = await synchronize(game, service.api, now, narrator);
  assert.deepEqual(retriedCommit, next);
  assert.equal(service.issues.length, 2);
});

test('comments are paginated, and all votes can be collected', async () => {
  const service = remote();
  service.setComments(
    Array.from({ length: 101 }, (_, i) => ({
      id: i + 1,
      body: 'A',
      user: { id: i + 1, type: 'User' },
      created_at: '2026-09-13T10:00:00Z',
      updated_at: '2026-09-13T10:00:00Z',
    }))
  );
  assert.equal((await service.api.comments(1)).length, 101);
  assert.equal(service.pages(), 2);
});

test('issue metadata cannot be adopted from another author', async () => {
  const service = remote();
  const game = await synchronize(
    createGame(),
    service.api,
    new Date('2026-09-13T09:00:00Z'),
    narrator
  );
  service.issues[0].user.login = 'someone-else';
  await assert.rejects(
    synchronize(game, service.api, new Date('2026-09-13T10:00:00Z'), narrator),
    /does not match/
  );
  assert.equal(
    parseMeta(
      '<!-- bit-round:{"key":"x","openedAt":"bad","closesAt":"bad"} -->'
    ),
    null
  );
});

test('a delayed schedule resolves only the published round, preserving history', async () => {
  const service = remote();
  const game = await synchronize(
    createGame(),
    service.api,
    new Date('2026-09-13T09:00:00Z'),
    narrator
  );
  const next = await synchronize(
    game,
    service.api,
    new Date('2026-09-20T09:00:00Z'),
    narrator
  );
  assert.equal(next.round.day, 2);
  assert.equal(next.history.length, 1);
  assert.equal(next.round.closesAt, '2026-09-21T08:00:00.000Z');
});
