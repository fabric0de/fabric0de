import { affordable, autopilot, choicesFor } from './engine.js';
import { getIncident } from './events.js';
import {
  deriveCreature,
  latestPortrait,
  needsPortrait,
  affinities,
} from './creature.js';
import type { CreatureManifest } from './creature.js';
import type { Choice, Game, HistoryEntry, Round, World } from './types.js';

export const START = '<!--START_SECTION:digital-life-->';
export const END = '<!--END_SECTION:digital-life-->';
export function escapeMarkdown(value: string): string {
  return value
    .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
    .replace(/[\\`*_[\]{}()#!|]/g, '\\$&')
    .replace(/[\r\n]+/g, ' ');
}
export function utc(value: string): string {
  return new Date(value).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}
export function worldSummary(world: World): string {
  return `Energy **${world.energy}/100** · Core stability **${world.stability}/100** · Bond **${world.bond}/100** · Data fragments **${world.fragments}**\n\nLearned abilities: ${world.abilities.length ? world.abilities.map((ability) => `**${ability}**`).join(', ') : 'none yet'}.`;
}
export function choiceDetails(choice: Choice): string {
  const changes = (['energy', 'stability', 'bond', 'fragments'] as const)
    .filter((key) => choice.effect[key])
    .map(
      (key) =>
        `${key} ${(choice.effect[key] ?? 0) > 0 ? '+' : ''}${choice.effect[key]}`
    );
  if (choice.effect.learn) changes.push(`learn ${choice.effect.learn}`);
  const learning = Object.entries(choice.learning)
    .map(([key, points]) => `${key} +${points}`)
    .join(', ');
  return `${choice.hint} ${changes.join(' · ')}. Learning: ${learning}.`;
}
export function decisionSummary(entry: HistoryEntry): string {
  const d = entry.decision;
  return `${d.choice}. ${entry.choiceTitle} — ${d.reason === 'autopilot' ? 'autopilot (no valid votes)' : d.reason === 'tie' ? 'tied vote; A → B → C priority' : `${d.voters} voter${d.voters === 1 ? '' : 's'}`}`;
}
export function resultMarkdown(entry: HistoryEntry): string {
  return `**Decision:** ${decisionSummary(entry)}

${entry.explanation}

**Remembered:** +${entry.experience} XP · ${Object.entries(entry.learning)
    .map(([key, value]) => `${key} +${value}`)
    .join(' · ')}

| After this encounter | Before | After |
| :--- | ---: | ---: |
| Energy | ${entry.before.energy} | ${entry.after.energy} |
| Core stability | ${entry.before.stability} | ${entry.after.stability} |
| Bond | ${entry.before.bond} | ${entry.after.bond} |
| Data fragments | ${entry.before.fragments} | ${entry.after.fragments} |

${entry.after.abilities
  .filter((ability) => !entry.before.abilities.includes(ability))
  .map((ability) => `New ability: **${ability}**.`)
  .join('\n')}

Votes: A ${entry.decision.counts.A} · B ${entry.decision.counts.B} · C ${entry.decision.counts.C}. Includes six energy recovered after the encounter; meters stop at their limits.`;
}

export function renderSection(
  game: Game,
  repo: string,
  creature?: CreatureManifest
): string {
  const incident = getIncident(game.round.incidentId);
  const pet = deriveCreature(game);
  const portrait = creature ? latestPortrait(creature, pet) : undefined;
  const name = creature?.identity.name ?? 'BIT';
  const link = game.round.issueNumber
    ? `https://github.com/${repo}/issues/${game.round.issueNumber}`
    : null;
  return `${START}

## still becoming.

A digital life shaped by your choices.

${portrait ? `<img src="./${portrait.asset}" width="144" height="144" alt="${name}, ${portrait.growth === 0 ? 'a tiny unformed cluster of data' : 'an evolving digital life'}">\n` : ''}
**${name}** · ${pet.stage} · **${pet.condition}** · \`DAY ${String(game.round.day).padStart(3, '0')}\`

Growth **${pet.growth}** · **${pet.experience} XP** · next growth at **${pet.nextGrowthAt} XP**${pet.temperament !== 'undiscovered' ? ` · drawn to **${pet.temperament}**` : ''}

${creature && needsPortrait(game, creature) ? '<sub>A new appearance is pending.</sub>\n\n' : ''}> ${escapeMarkdown(game.round.quip)}

Today — **${incident.title}**

${link ? `[Read the encounter & vote →](${link})` : '*The first vote opens at the next update.*'}

<sub>Daily at 08:00 UTC</sub>

[Growth album](./docs/creature-album.md) · [Journey log](./docs/journey-log.md) · [How it works](./docs/game.md)

${END}`;
}
export function replaceSection(
  readme: string,
  game: Game,
  repo: string,
  creature?: CreatureManifest
): string {
  const start = readme.indexOf(START),
    end = readme.indexOf(END);
  if (
    start < 0 ||
    end < start ||
    readme.indexOf(START, start + START.length) !== -1 ||
    readme.indexOf(END, end + END.length) !== -1
  )
    throw new Error('README must contain exactly one digital-life section');
  return (
    readme.slice(0, start) +
    renderSection(game, repo, creature) +
    readme.slice(end + END.length)
  );
}
export interface IssueMeta {
  key: string;
  openedAt: string;
  closesAt: string;
}
export function renderIssue(game: Game, meta: IssueMeta, repo: string): string {
  const incident = getIncident(game.round.incidentId),
    pet = deriveCreature(game);
  return `<!-- bit-round:${JSON.stringify(meta)} -->

# Day ${game.round.day}: ${incident.title}

${incident.description}

## Before this encounter

BIT is **${pet.condition}** · growth **${pet.growth}** · **${pet.experience} XP**.

${worldSummary(game.world)}

${choicesFor(game)
  .map(
    (choice) =>
      `### ${choice.id}. ${choice.title}${affordable(game, choice) ? '' : ' (unavailable)'}\n\n${choiceDetails(choice)}`
  )
  .join('\n\n')}

Every completed encounter earns 3 XP, plus 2 XP for a new ability. Six energy is recovered afterward. Meters stop at their limits. These choices influence growth without fixing a species or anatomy in advance.

## Vote

Comment with just **A**, **B**, or **C** (case-insensitive). One latest valid comment or edit per GitHub account; comments created or edited at or after the cutoff do not count. Bots, deleted comments, and unavailable choices do not count.

Voting opens **${utc(meta.openedAt)}** and closes **${utc(meta.closesAt)}**. The scheduled job may run later; the cutoff does not move. Ties use **A → B → C**. With no valid votes, autopilot chooses **${autopilot(game)}** for this state.

This is a fictional digital world; no real systems are accessed through these choices.

[Profile](https://github.com/${repo}#readme) · [Rules](https://github.com/${repo}/blob/HEAD/docs/game.md)
`;
}
export function renderLog(game: Game, repo: string): string {
  const entries = game.history.slice(-60).reverse();
  return (
    `# BIT's journey log

Encounters, choices, and memories of a digital life. No scheduled reset or fixed ending.

[Back to the profile](../README.md) · [Rules](./game.md) · [Complete history](../data/life-state.json)

${entries.length ? 'The latest 60 encounters appear below. Every encounter is retained in the state file.' : 'No decisions yet. The first encounter opens when the story workflow runs.'}

${entries.map((entry) => `## Day ${entry.day} — ${entry.title}\n\n${utc(entry.resolvedAt)}${entry.issueNumber ? ` · [Voting issue](https://github.com/${repo}/issues/${entry.issueNumber})` : ''}\n\n${resultMarkdown(entry)}`).join('\n\n---\n\n')}
`.trimEnd() + '\n'
  );
}
export function withWindow(
  round: Round,
  meta: IssueMeta,
  issueNumber: number
): Round {
  return {
    ...round,
    openedAt: meta.openedAt,
    closesAt: meta.closesAt,
    issueNumber,
  };
}
export function renderCreatureAlbum(
  game: Game,
  manifest: CreatureManifest
): string {
  const pet = deriveCreature(game);
  return (
    `# ${manifest.identity.name}'s growth album

Every appearance below was generated by AI. Its memories connect the appearances: no fixed palette, anatomy, emblem or species. Each new appearance starts from the immediately preceding one.

[Back to the profile](../README.md) · [Journey log](./journey-log.md) · [Growth rules](./game.md#growth-and-appearance)

${pet.completedDays} completed encounters · ${pet.experience} XP · growth ${pet.growth} · ${pet.condition}

Learned tendencies: ${affinities.map((affinity) => `${affinity} ${pet.affinities[affinity]}`).join(' · ')}.

${needsPortrait(game, manifest) ? 'A new portrait is pending. Experience keeps accumulating; the last accepted appearance stays visible.\n\n' : ''}${
      [...manifest.portraits]
        .reverse()
        .map(
          (portrait) =>
            `## ${portrait.growth === 0 ? 'Awakening' : `Growth ${portrait.growth}`} — ${portrait.completedDays} completed encounters\n\n<img src="../${portrait.asset}" width="192" height="192" alt="${manifest.identity.name} at growth ${portrait.growth}">\n\n${escapeMarkdown(portrait.reason)}\n\n${portrait.evolution ? `**Changed:** ${escapeMarkdown(portrait.evolution.change)}\n\n**Carried forward:** ${escapeMarkdown(portrait.evolution.retainedFeature)}\n\n**Memories behind this change:** days ${portrait.evolution.memoryDays.join(', ')}.\n\n` : ''}${portrait.experience} XP · [Generation prompt](../${portrait.promptFile})${portrait.referenceAssets.length ? ` · ${portrait.referenceAssets.length} earlier appearance reference(s)` : ''}\n`
        )
        .join('\n') ||
      'No portraits yet. The first appearance will be generated when image generation is available.\n'
    }
`.trimEnd() + '\n'
  );
}
