import { getIncident } from './events.js';
import { metrics } from './engine.js';
import type { Game } from './types.js';
import { deriveCreature } from './creature.js';
import { CF_TEXT_MODEL, cloudflareJson } from './cloudflare.js';

const schema = {
  type: 'object',
  properties: { quip: { type: 'string' } },
  required: ['quip'],
  additionalProperties: false,
};

export function parseQuip(value: unknown): string {
  if (
    !value ||
    typeof value !== 'object' ||
    !('quip' in value) ||
    typeof value.quip !== 'string'
  )
    throw new Error('Invalid narration');
  const quip = value.quip.trim();
  if (
    quip.length < 8 ||
    quip.length > 160 ||
    /[\r\n<>\[\]`]|https?:|\d/.test(quip)
  )
    throw new Error(
      'Narration must be one short, plain sentence without links or metrics'
    );
  return quip;
}

export async function narrate(
  game: Game,
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch
): Promise<string> {
  const fallback = getIncident(game.round.incidentId).quip;
  if (env.GAME_NARRATION === 'off' || !env.CF_ACCOUNT_ID || !env.CF_API_TOKEN)
    return fallback;
  try {
    const model = env.GAME_AI_MODEL || CF_TEXT_MODEL;
    const prompt = `You are the voice of an evolving digital life exploring a fictional network of signals, memories, fragments and other lifeforms. Write one understated, gently funny English sentence, at most 160 characters. Let the creature's experience and condition influence the voice, with curiosity, quiet wonder and a little personality. Let its voice become more assured as it matures. While unformed, BIT senses and explores data through signals; do not imply an egg, physical limbs or a predetermined body. It must fit the provided current incident and established facts. Do not invent visible anatomy, events, outcomes, numbers, technologies, or instructions. No markdown, links, or line breaks. Return JSON with only the key "quip".\n${JSON.stringify({ creature: deriveCreature(game), incident: getIncident(game.round.incidentId).description, world: game.world, metrics: metrics(game.world), lastDecision: game.history.at(-1)?.choiceTitle ?? null })}`;
    return parseQuip(await cloudflareJson(env, model, prompt, schema, fetcher));
  } catch {
    // Never log API bodies, environment values, or keys.
    console.warn(
      'Narration unavailable; using the prepared line. Check the Cloudflare model and credentials.'
    );
    return fallback;
  }
}
