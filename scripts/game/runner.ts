import { advance } from './engine.js';
import type { Decision, Game, HistoryEntry } from './types.js';

export interface GamePublisher {
  ensureRound: (game: Game, now: Date) => Promise<Game>;
  decision: (game: Game) => Promise<Decision>;
  finalize: (entry: HistoryEntry) => Promise<void>;
}

export async function synchronize(
  input: Game,
  publisher: GamePublisher,
  now: Date,
  narrator: (game: Game) => Promise<string>
): Promise<Game> {
  let game = await publisher.ensureRound(structuredClone(input), now);
  if (game.round.closesAt && Date.parse(game.round.closesAt) <= now.getTime()) {
    game = advance(game, await publisher.decision(game), now);
    game.round.quip = await narrator(game);
    game = await publisher.ensureRound(game, now);
  } else if (!input.round.openedAt) {
    game.round.quip = await narrator(game);
  }
  const latest = game.history.at(-1);
  if (latest) await publisher.finalize(latest);
  return game;
}
