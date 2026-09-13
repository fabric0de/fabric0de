import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import {
  buildPortraitPrompt,
  deriveCreature,
  latestPortrait,
  needsPortrait,
  portraitKey,
  validateCreatureManifest,
  validateEvolution,
} from './creature.js';
import type { CreatureManifest, Portrait, Evolution } from './creature.js';
import type { Game } from './types.js';
import {
  CF_IMAGE_MODEL,
  CF_TEXT_MODEL,
  cloudflareJson,
  cloudflarePortrait,
  cloudflarePortraitPrompt,
} from './cloudflare.js';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

// Inspect the actual PNG structure and decompressed data. An HTML error page,
// truncated image, oversized image, or opaque response cannot replace the pet.
export function validatePortraitPng(bytes: Buffer): void {
  if (
    bytes.length < 57 ||
    bytes.length > MAX_IMAGE_BYTES ||
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error('Invalid PNG');
  let width = 0;
  let height = 0;
  let ended = false;
  let offset = 8;
  const data: Buffer[] = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (offset + 12 + length > bytes.length) throw new Error('Truncated PNG');
    if (offset === 8 && (type !== 'IHDR' || length !== 13))
      throw new Error('Missing PNG header');
    if (type === 'IHDR') {
      width = bytes.readUInt32BE(offset + 8);
      height = bytes.readUInt32BE(offset + 12);
      if (
        width < 128 ||
        width > 2048 ||
        height !== width ||
        bytes[offset + 16] !== 8 ||
        bytes[offset + 17] !== 6 ||
        bytes[offset + 20] !== 0
      )
        throw new Error('Expected square, non-interlaced RGBA PNG');
    }
    if (type === 'IDAT')
      data.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (type === 'IEND') {
      ended = true;
      break;
    }
  }
  if (!ended || offset !== bytes.length || !data.length)
    throw new Error('Incomplete PNG');
  const expected = height * (1 + width * 4);
  const raw = inflateSync(Buffer.concat(data), { maxOutputLength: expected });
  if (raw.length !== expected) throw new Error('Invalid PNG pixel data');
  // Undo PNG filters to verify that there is both a subject and transparency.
  const rowBytes = width * 4;
  let previous = Buffer.alloc(rowBytes);
  let transparent = 0;
  let visible = 0;
  for (let y = 0; y < height; y++) {
    const base = y * (rowBytes + 1);
    const filter = raw[base];
    if (filter > 4) throw new Error('Invalid PNG filter');
    const row = Buffer.from(raw.subarray(base + 1, base + 1 + rowBytes));
    for (let x = 0; x < rowBytes; x++) {
      const left = x >= 4 ? row[x - 4] : 0;
      const up = previous[x];
      const corner = x >= 4 ? previous[x - 4] : 0;
      const p = left + up - corner;
      const a = Math.abs(p - left),
        b = Math.abs(p - up),
        c = Math.abs(p - corner);
      const prediction =
        filter === 0
          ? 0
          : filter === 1
            ? left
            : filter === 2
              ? up
              : filter === 3
                ? Math.floor((left + up) / 2)
                : a <= b && a <= c
                  ? left
                  : b <= c
                    ? up
                    : corner;
      row[x] = (row[x] + prediction) & 255;
      if (x % 4 === 3) {
        if (row[x] === 0) transparent++;
        if (row[x] > 128) visible++;
      }
    }
    previous = row;
  }
  if (transparent < width * height * 0.05 || visible < width * height * 0.01)
    throw new Error(
      'Portrait must contain a visible subject and transparent padding'
    );
}

async function reviewPortrait(
  candidate: Buffer,
  references: Buffer[],
  prompt: string,
  env: NodeJS.ProcessEnv,
  fetcher: typeof fetch
): Promise<boolean> {
  const schema = {
    type: 'object',
    properties: {
      same_identity: { type: 'boolean' },
      single_creature: { type: 'boolean' },
      clean_sprite: { type: 'boolean' },
      plausible_growth: { type: 'boolean' },
    },
    required: [
      'same_identity',
      'single_creature',
      'clean_sprite',
      'plausible_growth',
    ],
    additionalProperties: false,
  };
  const review = await cloudflareJson(
    env,
    env.CREATURE_REVIEW_MODEL || CF_TEXT_MODEL,
    `Review this digital life transition. The first ${references.length} images show the immediate parent only; the last is the candidate. same_identity means it visibly carries forward the parent feature named in the transition plan, NOT that it preserves a fixed palette, eyes, circuit marking, anatomy or species. plausible_growth means the planned change is visible and is one coherent step, rather than a complete unrelated redesign. First adaptation must remain small and simple, without jumping from unformed data to a developed monster. Color and anatomy changes are allowed; literal circuits and hatching are not required. Check exactly one lifeform, a clean pixel-art sprite without text, scenery or magenta residue, and a digital quality. Return the four boolean fields specified in the JSON schema. Creation request: ${prompt}`,
    schema,
    fetcher,
    [...references, candidate]
  );
  return (
    !!review &&
    typeof review === 'object' &&
    Object.keys(schema.properties).every(
      (key) => (review as Record<string, unknown>)[key] === true
    )
  );
}

export async function generatePortrait(
  game: Game,
  manifest: CreatureManifest,
  root: string,
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
  now = new Date()
): Promise<CreatureManifest> {
  validateCreatureManifest(manifest);
  if (
    !needsPortrait(game, manifest) ||
    env.CREATURE_IMAGES === 'off' ||
    !(env.CF_ACCOUNT_ID && env.CF_API_TOKEN)
  )
    return manifest;
  const date = now.toISOString().slice(0, 10);
  const key = portraitKey(game, manifest);
  // At most one attempt per UTC day after a manifest is saved, including failures.
  if (manifest.lastAttempt?.date === date) return manifest;
  const next = structuredClone(manifest);
  next.lastAttempt = { key, date, result: 'failed' };
  const state = deriveCreature(game);
  const current = latestPortrait(manifest, state);
  const referenceAssets = current ? [current.asset] : [];
  const model = env.CREATURE_IMAGE_MODEL || CF_IMAGE_MODEL;
  try {
    const references = await Promise.all(
      referenceAssets.map(async (asset) => {
        const bytes = await fs.readFile(path.join(root, asset));
        validatePortraitPng(bytes);
        return bytes;
      })
    );
    let evolution: Evolution | undefined;
    if (state.growth > 0 && game.history.length) {
      const planned = await cloudflareJson(
        env,
        env.CREATURE_REVIEW_MODEL || CF_TEXT_MODEL,
        `Plan ONE modest visual adaptation of BIT using the immediate-parent image and the actual recent experiences below. Return concise English fields: change (what will visibly change), retainedFeature (one specific visible feature of the parent to keep for this transition only), reason (why one or more provided decisions motivate this change), and memoryDays (the exact provided encounter day numbers supporting it). If there is no image reference, retainedFeature should say no previous appearance exists. Do not invent memories or use a fixed color, body, hatching sequence or tendency-to-species mapping. This plan controls image generation; it is also recorded in the album.\n${buildPortraitPrompt(game, manifest)}`,
        {
          type: 'object',
          properties: {
            change: { type: 'string' },
            retainedFeature: { type: 'string' },
            reason: { type: 'string' },
            memoryDays: { type: 'array', items: { type: 'integer' } },
          },
          required: ['change', 'retainedFeature', 'reason', 'memoryDays'],
          additionalProperties: false,
        },
        fetcher,
        references
      );
      validateEvolution(planned);
      const knownDays = new Set(
        game.history.slice(-8).map((entry) => entry.day)
      );
      if (planned.memoryDays.some((day) => !knownDays.has(day)))
        throw new Error('Evolution plan cites an unavailable memory');
      evolution = planned;
    }
    const prompt = cloudflarePortraitPrompt(
      buildPortraitPrompt(game, manifest, evolution)
    );
    const bytes = await cloudflarePortrait(
      references,
      prompt,
      model,
      env,
      fetcher
    );
    validatePortraitPng(bytes);
    if (references.some((reference) => reference.equals(bytes)))
      throw new Error('Growth returned the unchanged reference');
    if (!(await reviewPortrait(bytes, references, prompt, env, fetcher)))
      throw new Error('Portrait did not pass identity review');
    const digest = createHash('sha256')
      .update(bytes)
      .digest('hex')
      .slice(0, 12);
    const basename = `growth-${state.growth}-${digest}`;
    const portrait: Portrait = {
      key,
      growth: state.growth,
      experience: state.experience,
      completedDays: state.completedDays,
      asset: `assets/creature/${basename}.png`,
      promptFile: `assets/creature/${basename}.prompt.txt`,
      source: 'cloudflare',
      model,
      reason:
        evolution?.reason ??
        (game.history.length
          ? `Grew through ${state.completedDays} shared decisions; strongest tendency: ${state.temperament}.`
          : 'Awakened as an original AI-generated digital life.'),
      referenceAssets,
      ...(evolution ? { evolution } : {}),
    };
    await fs.mkdir(path.join(root, 'assets/creature'), { recursive: true });
    await fs.writeFile(path.join(root, portrait.asset), bytes);
    await fs.writeFile(path.join(root, portrait.promptFile), prompt + '\n');
    next.portraits.push(portrait);
    next.lastAttempt.result = 'generated';
    validateCreatureManifest(next);
    return next;
  } catch {
    console.warn(
      'Creature image unavailable or rejected; retaining the last accepted portrait. The game continues.'
    );
    return next;
  }
}
