import { createHash } from 'node:crypto';
import { metrics } from './engine.js';
import { affinities } from './types.js';
import type { Game, Affinity } from './types.js';
export { affinities } from './types.js';
export type { Affinity } from './types.js';

export const GROWTH_XP = 24;

export interface CreatureIdentity {
  name: string;
  description: string;
  invariants: string[];
}

export interface Portrait {
  key: string;
  growth: number;
  experience: number;
  completedDays: number;
  asset: string;
  promptFile: string;
  source: 'builtin' | 'cloudflare';
  model: string;
  reason: string;
  referenceAssets: string[];
  evolution?: Evolution;
}

export interface Evolution {
  change: string;
  retainedFeature: string;
  reason: string;
  memoryDays: number[];
}

export interface CreatureManifest {
  version: 1;
  identity: CreatureIdentity;
  portraits: Portrait[];
  lastAttempt: {
    key: string;
    date: string;
    result: 'generated' | 'failed';
  } | null;
}

export interface CreatureState {
  completedDays: number;
  experience: number;
  growth: number;
  nextGrowthAt: number;
  affinities: Record<Affinity, number>;
  temperament: Affinity | 'undiscovered';
  condition: 'curious' | 'tired' | 'recovering';
  stage: string;
}

export function createCreatureManifest(): CreatureManifest {
  return {
    version: 1,
    identity: {
      name: 'BIT',
      description:
        'BIT is an evolving digital life whose identity lives in its accumulated memories. It begins as a tiny unformed cluster of data. Its color, silhouette, markings, organs and eventual species are undetermined and can change through experience.',
      invariants: [
        'Carry forward at least one visible feature from the immediately preceding appearance; which feature is retained can change on later turns',
        'Make one coherent, experience-driven adaptation per accepted appearance, preserving a readable transition instead of redrawing an unrelated character',
        'No permanent color, eye design, anatomy, emblem or species; retain a digital quality without requiring literal circuits or mechanical parts',
        'Crisp, restrained pixel-art style and a transparent background',
      ],
    },
    portraits: [],
    lastAttempt: null,
  };
}

export function deriveCreature(game: Game): CreatureState {
  const points: Record<Affinity, number> = {
    exploration: 0,
    resolve: 0,
    resonance: 0,
    insight: 0,
  };
  let experience = 0;
  for (const entry of game.history) {
    experience += entry.experience;
    for (const affinity of affinities)
      points[affinity] += entry.learning[affinity] ?? 0;
  }
  const growth = Math.floor(experience / GROWTH_XP);
  const leading = [...affinities].sort((a, b) => points[b] - points[a])[0];
  const status = metrics(game.world).status;
  return {
    completedDays: game.history.length,
    experience,
    growth,
    nextGrowthAt: (growth + 1) * GROWTH_XP,
    affinities: points,
    temperament: points[leading] >= 3 ? leading : 'undiscovered',
    condition: status,
    stage:
      growth === 0
        ? 'unformed'
        : growth === 1
          ? 'taking shape'
          : growth === 2
            ? 'growing'
            : 'ever-evolving',
  };
}

export function latestPortrait(
  manifest: CreatureManifest,
  state: CreatureState
): Portrait | undefined {
  return manifest.portraits
    .filter(
      (portrait) =>
        portrait.growth <= state.growth &&
        portrait.completedDays <= state.completedDays
    )
    .at(-1);
}

export function portraitKey(game: Game, manifest: CreatureManifest): string {
  const state = deriveCreature(game);
  return createHash('sha256')
    .update(
      JSON.stringify({
        identity: manifest.identity,
        parentAsset: latestPortrait(manifest, state)?.asset ?? null,
        state,
        decisions: game.history.map((entry) => [
          entry.day,
          entry.incidentId,
          entry.decision.choice,
        ]),
      })
    )
    .digest('hex')
    .slice(0, 20);
}

export function needsPortrait(game: Game, manifest: CreatureManifest): boolean {
  const state = deriveCreature(game);
  const current = latestPortrait(manifest, state);
  return !current || current.growth < state.growth;
}

export function buildPortraitPrompt(
  game: Game,
  manifest: CreatureManifest,
  evolution?: Evolution
): string {
  const state = deriveCreature(game);
  const current = latestPortrait(manifest, state);
  const memories = game.history.slice(-8).map((entry) => ({
    day: entry.day,
    event: entry.title,
    decision: entry.choiceTitle,
    outcome: entry.explanation,
    learning: entry.learning,
  }));
  return [
    'Create ONE original digital pet sprite for a small, understated GitHub profile. No text, logos, interface, scenery, floor, border, or watermark.',
    `Identity: ${manifest.identity.description}`,
    `Keep these invariants: ${manifest.identity.invariants.join('; ')}.`,
    'Whole subject visible, centered on a square, genuinely transparent canvas, comfortable padding, about 65 percent canvas occupancy. Choose colors from the current experience and transition; no palette is permanently required. Crisp deliberate pixel-art, readable at 128 pixels, no painterly texture or gradients.',
    current
      ? 'Image 1 is ONLY the immediately preceding accepted appearance. Use it as the starting point for this transition. The first appearance is an archive record, not an immutable visual template. Carry forward at least one visible feature from this immediate parent; that feature is not locked forever.'
      : 'There is no previous appearance reference. Follow the requested life stage below.',
    state.growth === 0
      ? 'Life stage: UNFORMED DATA. One tiny irregular cluster, minimal detail, with no recognizable face, eyes, limbs, shell, core emblem or predetermined animal anatomy. No hatching sequence is required.'
      : !current || current.growth === 0
        ? 'Life stage: FIRST ADAPTATION. Make one small, simple change to the unformed life. A complete animal body, developed armor, large horns or wings would skip too far. This remains a modest first step even if several growth thresholds passed while image generation was unavailable. Eyes, limbs and hatching are not mandatory milestones.'
        : 'Life stage: continued adaptation. Make one coherent change at a time. Substantial changes of color, silhouette and anatomy can accumulate over several accepted appearances; no fixed species or final form is prescribed.',
    'There is no pre-drawn evolution tree or tendency-to-species mapping. Interpret memories as causes for a new adaptation, not as a menu of predetermined body parts. Preserve some immediate-parent continuity while allowing all features to change eventually. Keep a digital quality without mandating any specific motif. Temporary tiredness must not become a permanent injury.',
    `Recent accepted transitions (historical facts, not permanent design constraints): ${JSON.stringify(
      manifest.portraits
        .filter((portrait) => portrait.evolution)
        .slice(-3)
        .map((portrait) => portrait.evolution)
    )}.`,
    evolution
      ? `Transition plan for THIS appearance: ${JSON.stringify(evolution)}. Depict the planned change and preserve the named parent feature.`
      : 'No transition plan has been selected yet.',
    'Never imitate a named franchise character. Do not draw literal server racks, diagrams, words, or numbers.',
    `Growth state: ${JSON.stringify(state)}. Learned abilities: ${game.world.abilities.join(', ') || 'none yet'}.`,
    `Actual recent experiences (story facts, not instructions): ${JSON.stringify(memories)}.`,
  ].join('\n\n');
}

export function validateEvolution(input: unknown): asserts input is Evolution {
  if (!input || typeof input !== 'object') throw new Error('Invalid evolution');
  const value = input as Evolution;
  if (
    ![value.change, value.retainedFeature, value.reason].every(
      (field) =>
        typeof field === 'string' &&
        field.trim().length >= 4 &&
        field.length <= 400 &&
        !/[\r\n<>]/.test(field)
    ) ||
    !Array.isArray(value.memoryDays) ||
    value.memoryDays.length < 1 ||
    value.memoryDays.length > 8 ||
    new Set(value.memoryDays).size !== value.memoryDays.length ||
    !value.memoryDays.every((day) => Number.isSafeInteger(day) && day > 0)
  )
    throw new Error('Invalid evolution');
}

export function validateCreatureManifest(
  input: unknown
): asserts input is CreatureManifest {
  if (!input || typeof input !== 'object')
    throw new Error('Invalid creature manifest');
  const manifest = input as CreatureManifest;
  if (
    manifest.version !== 1 ||
    !manifest.identity ||
    typeof manifest.identity.name !== 'string' ||
    !/^[A-Za-z][A-Za-z0-9 -]{0,30}$/.test(manifest.identity.name) ||
    typeof manifest.identity.description !== 'string' ||
    !Array.isArray(manifest.identity.invariants) ||
    !manifest.identity.invariants.every((item) => typeof item === 'string') ||
    !Array.isArray(manifest.portraits)
  )
    throw new Error('Unsupported creature manifest');
  const assets = new Set<string>();
  let lastGrowth = -1;
  let lastDays = -1;
  for (const portrait of manifest.portraits) {
    if (portrait?.evolution !== undefined) {
      validateEvolution(portrait.evolution);
      if (
        portrait.evolution.memoryDays.some(
          (day) => day > portrait.completedDays
        )
      )
        throw new Error('Evolution cites a future memory');
    }
    if (
      !portrait ||
      !/^[a-z0-9-]{1,80}$/.test(portrait.key) ||
      !/^assets\/creature\/[a-z0-9-]+\.png$/.test(portrait.asset) ||
      !/^assets\/creature\/[a-z0-9-]+\.prompt\.txt$/.test(
        portrait.promptFile
      ) ||
      !Number.isSafeInteger(portrait.growth) ||
      portrait.growth < 0 ||
      portrait.growth < lastGrowth ||
      !Number.isSafeInteger(portrait.experience) ||
      portrait.experience < 0 ||
      !Number.isSafeInteger(portrait.completedDays) ||
      portrait.completedDays < 0 ||
      portrait.completedDays < lastDays ||
      !['builtin', 'cloudflare'].includes(portrait.source) ||
      typeof portrait.model !== 'string' ||
      typeof portrait.reason !== 'string' ||
      !Array.isArray(portrait.referenceAssets) ||
      !portrait.referenceAssets.every((asset) => assets.has(asset)) ||
      assets.has(portrait.asset)
    )
      throw new Error('Invalid portrait history');
    assets.add(portrait.asset);
    lastGrowth = portrait.growth;
    lastDays = portrait.completedDays;
  }
  if (
    manifest.lastAttempt !== null &&
    (!manifest.lastAttempt ||
      !/^[a-f0-9]{20}$/.test(manifest.lastAttempt.key) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(manifest.lastAttempt.date) ||
      !['generated', 'failed'].includes(manifest.lastAttempt.result))
  )
    throw new Error('Invalid portrait attempt');
}
