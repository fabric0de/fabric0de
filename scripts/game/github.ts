import { createHash } from 'node:crypto';
import { affordable, choicesFor, ids, nextCutoff, tally } from './engine.js';
import { renderIssue, resultMarkdown, withWindow } from './render.js';
import type { IssueMeta } from './render.js';
import type { Decision, Game, HistoryEntry, VoteComment } from './types.js';

interface Issue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: { login: string };
  pull_request?: unknown;
}

export function roundKey(game: Pick<Game, 'world' | 'round'>): string {
  const digest = createHash('sha256')
    .update(
      JSON.stringify({
        world: game.world,
        day: game.round.day,
        incidentId: game.round.incidentId,
      })
    )
    .digest('hex')
    .slice(0, 16);
  return `v2-day-${game.round.day}-${digest}`;
}

export function parseMeta(body: string | null): IssueMeta | null {
  const match = /<!-- bit-round:(\{[^\n]+\}) -->/.exec(body ?? '');
  if (!match) return null;
  try {
    const meta = JSON.parse(match[1]) as IssueMeta;
    if (
      typeof meta.key !== 'string' ||
      typeof meta.openedAt !== 'string' ||
      typeof meta.closesAt !== 'string' ||
      !Number.isFinite(Date.parse(meta.openedAt)) ||
      !Number.isFinite(Date.parse(meta.closesAt)) ||
      Date.parse(meta.openedAt) >= Date.parse(meta.closesAt)
    )
      return null;
    return meta;
  } catch {
    return null;
  }
}

export class GitHub {
  constructor(
    private readonly repo: string,
    private readonly token: string,
    private readonly bot = 'github-actions[bot]',
    private readonly fetcher: typeof fetch = fetch
  ) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
      throw new Error('Invalid GitHub repository');
    if (!token) throw new Error('GITHUB_TOKEN is required for publishing');
  }

  private async request<T>(
    path: string,
    method = 'GET',
    body?: unknown
  ): Promise<T> {
    const response = await this.fetcher(
      `https://api.github.com/repos/${this.repo}${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'bit-digital-life',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!response.ok)
      throw new Error(
        `GitHub ${method} ${path.split('?')[0]} failed (${response.status})`
      );
    return (await response.json()) as T;
  }

  async ensureRound(game: Game, now: Date): Promise<Game> {
    const key = roundKey(game);
    let found: Issue | undefined;
    if (game.round.issueNumber) {
      found = await this.request<Issue>(`/issues/${game.round.issueNumber}`);
      if (found.user.login !== this.bot || parseMeta(found.body)?.key !== key)
        throw new Error('Stored voting issue does not match this round');
    } else {
      for (let page = 1; ; page++) {
        const batch = await this.request<Issue[]>(
          `/issues?state=all&creator=${encodeURIComponent(this.bot)}&per_page=100&page=${page}`
        );
        found = batch.find(
          (issue) =>
            !issue.pull_request &&
            issue.user.login === this.bot &&
            parseMeta(issue.body)?.key === key
        );
        if (found || batch.length < 100) break;
      }
    }
    if (!found) {
      const meta = {
        key,
        openedAt: now.toISOString(),
        closesAt: nextCutoff(now),
      };
      found = await this.request<Issue>('/issues', 'POST', {
        title: `[digital-life] Day ${game.round.day}: ${game.round.incidentId}`,
        body: renderIssue(game, meta, this.repo),
      });
    }
    const meta = parseMeta(found.body);
    if (!meta || meta.key !== key)
      throw new Error('Invalid voting issue metadata');
    if (found.state !== 'open' && now.getTime() < Date.parse(meta.closesAt))
      await this.request(`/issues/${found.number}`, 'PATCH', { state: 'open' });
    return { ...game, round: withWindow(game.round, meta, found.number) };
  }

  async comments(issueNumber: number): Promise<VoteComment[]> {
    const all: VoteComment[] = [];
    for (let page = 1; ; page++) {
      const batch = await this.request<VoteComment[]>(
        `/issues/${issueNumber}/comments?per_page=100&page=${page}`
      );
      all.push(...batch);
      if (batch.length < 100) return all;
    }
  }

  async decision(game: Game): Promise<Decision> {
    if (!game.round.issueNumber) throw new Error('No voting issue');
    const issue = await this.request<Issue>(
      `/issues/${game.round.issueNumber}`
    );
    if (
      issue.user.login !== this.bot ||
      parseMeta(issue.body)?.key !== roundKey(game)
    )
      throw new Error('Untrusted voting issue');
    const match = /<!-- bit-decision:(\{[^\n]+\}) -->/.exec(issue.body ?? '');
    if (match) {
      const saved = JSON.parse(match[1]) as Decision;
      if (
        !ids.includes(saved.choice) ||
        !['vote', 'tie', 'autopilot'].includes(saved.reason) ||
        !saved.counts ||
        !ids.every(
          (id) => Number.isInteger(saved.counts[id]) && saved.counts[id] >= 0
        ) ||
        saved.voters !==
          Object.values(saved.counts).reduce((a, b) => a + b, 0) ||
        !choicesFor(game).some(
          (choice) => choice.id === saved.choice && affordable(game, choice)
        )
      )
        throw new Error('Invalid frozen decision');
      return saved;
    }
    const decision = tally(game, await this.comments(issue.number));
    // Freeze before creating the next issue. A failed commit can safely retry
    // even if an old comment is subsequently edited or deleted.
    await this.request(`/issues/${issue.number}`, 'PATCH', {
      body: `${issue.body ?? ''}\n\n<!-- bit-decision:${JSON.stringify(decision)} -->\n`,
    });
    return decision;
  }

  async finalize(entry: HistoryEntry): Promise<void> {
    if (!entry.issueNumber) return;
    const issue = await this.request<Issue>(`/issues/${entry.issueNumber}`);
    const expected = roundKey({
      world: entry.before,
      round: {
        day: entry.day,
        incidentId: entry.incidentId,
        openedAt: null,
        closesAt: null,
        issueNumber: entry.issueNumber,
        quip: '',
      },
    });
    if (
      issue.user.login !== this.bot ||
      parseMeta(issue.body)?.key !== expected
    )
      throw new Error('Refusing to edit an unrelated issue');
    const start = '<!-- bit-result:start -->';
    const end = '<!-- bit-result:end -->';
    const original = (issue.body ?? '').split(start)[0].trimEnd();
    const body = `${original}\n\n${start}\n\n## Resolved\n\n${resultMarkdown(entry)}\n\n${end}\n`;
    if (issue.body !== body || issue.state !== 'closed')
      await this.request(`/issues/${issue.number}`, 'PATCH', {
        body,
        state: 'closed',
        state_reason: 'completed',
      });
  }
}
