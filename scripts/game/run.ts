import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createGame, validateGame } from './engine.js';
import { GitHub } from './github.js';
import { narrate } from './narrator.js';
import { renderCreatureAlbum, renderLog, replaceSection } from './render.js';
import { synchronize } from './runner.js';
import {
  createCreatureManifest,
  validateCreatureManifest,
} from './creature.js';
import { generatePortrait } from './creature-images.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
config({ path: path.join(root, '.env'), quiet: true });

function writeAtomic(relative: string, content: string): void {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, target);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (
    args.some((arg) => !['--publish', '--images'].includes(arg)) ||
    (args.includes('--publish') && args.includes('--images'))
  )
    throw new Error(
      'Use game:preview, game:update -- --publish, or creature:grow. Image generation and game publication are separate operations.'
    );
  const repo = process.env.GITHUB_REPOSITORY || 'fabric0de/fabric0de';
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
    throw new Error('Invalid repository');
  const statePath = path.join(root, 'data/life-state.json');
  let game: unknown = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
    : createGame();
  validateGame(game);
  const manifestPath = path.join(root, 'data/creature.json');
  let creature: unknown = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : createCreatureManifest();
  validateCreatureManifest(creature);
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  // Check the editable boundary before any external writes.
  replaceSection(readme, game, repo, creature);
  if (args.includes('--publish')) {
    if (
      process.env.GITHUB_ACTIONS !== 'true' ||
      !['schedule', 'workflow_dispatch'].includes(
        process.env.GITHUB_EVENT_NAME ?? ''
      )
    )
      throw new Error(
        'Publishing runs only in the trusted GitHub Actions workflow. Use game:preview locally.'
      );
    const publisher = new GitHub(
      repo,
      process.env.GITHUB_TOKEN ?? '',
      process.env.GAME_BOT_LOGIN || 'github-actions[bot]'
    );
    game = await synchronize(game, publisher, new Date(), (state) =>
      narrate(state)
    );
    validateGame(game);
  }
  if (args.includes('--images'))
    creature = await generatePortrait(game, creature, root);
  validateCreatureManifest(creature);
  writeAtomic('data/life-state.json', JSON.stringify(game, null, 2) + '\n');
  writeAtomic('data/creature.json', JSON.stringify(creature, null, 2) + '\n');
  writeAtomic('README.md', replaceSection(readme, game, repo, creature));
  writeAtomic('docs/journey-log.md', renderLog(game, repo));
  writeAtomic('docs/creature-album.md', renderCreatureAlbum(game, creature));
  console.log(
    `Day ${game.round.day}: ${game.round.incidentId}. ${args.includes('--publish') ? 'GitHub synchronized.' : args.includes('--images') ? 'Growth image check completed; game time unchanged.' : 'Local preview rendered; no API calls or time advancement.'}`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Game update failed');
  process.exitCode = 1;
});
