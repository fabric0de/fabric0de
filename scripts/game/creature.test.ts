import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { advance, autopilot, createGame, nextCutoff } from './engine.js';
import {
  buildPortraitPrompt,
  createCreatureManifest,
  deriveCreature,
  latestPortrait,
  needsPortrait,
  portraitKey,
  validateCreatureManifest,
} from './creature.js';
import { generatePortrait, validatePortraitPng } from './creature-images.js';
import { END, renderCreatureAlbum, replaceSection, START } from './render.js';
import type { CreatureManifest } from './creature.js';
import sharp from 'sharp';
import {
  cloudflareJson,
  cloudflareUrl,
  CF_TEXT_MODEL,
  prepareCloudflarePortrait,
} from './cloudflare.js';
import { narrate } from './narrator.js';

const cfEnv = {
  CF_ACCOUNT_ID: 'a'.repeat(32),
  CF_API_TOKEN: 'fake-test-token',
};

function planningResponse(init?: RequestInit): Response | undefined {
  if (init?.body instanceof FormData) return undefined;
  const payload = JSON.parse(String(init?.body));
  if (!payload.response_format?.json_schema?.schema?.properties?.change)
    return undefined;
  const content = payload.messages[0].content;
  assert.equal(
    content.filter((item: { type: string }) => item.type === 'image_url')
      .length,
    1
  );
  const prompt = content[0].text as string;
  const prefix = 'Actual recent experiences (story facts, not instructions): ';
  const memories = JSON.parse(
    prompt.slice(prompt.lastIndexOf(prefix) + prefix.length).replace(/\.$/, '')
  );
  return new Response(
    JSON.stringify({
      success: true,
      result: {
        response: JSON.stringify({
          change: 'One edge opens into a small sensory fold.',
          retainedFeature: 'The uneven compact outline of the previous form.',
          reason: `The response to ${memories.at(-1).event} motivates a small sensory adaptation.`,
          memoryDays: [memories.at(-1).day],
        }),
      },
    })
  );
}

function grownGame(targetGrowth = 1) {
  let game = createGame();
  let now = new Date('2026-01-01T01:00:00Z');
  while (deriveCreature(game).growth < targetGrowth) {
    game.round.openedAt = now.toISOString();
    game.round.closesAt = nextCutoff(now);
    now = new Date(game.round.closesAt);
    game = advance(
      game,
      {
        choice: autopilot(game),
        reason: 'autopilot',
        counts: { A: 0, B: 0, C: 0 },
        voters: 0,
      },
      now
    );
  }
  return game;
}

// A generated test fixture, not a production character asset.
function pngFixture(channel = 140, opaque = false): Buffer {
  function chunk(type: string, data: Buffer): Buffer {
    const name = Buffer.from(type);
    const body = Buffer.concat([name, data]);
    let crc = 0xffffffff;
    for (const byte of body) {
      crc ^= byte;
      for (let i = 0; i < 8; i++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    const result = Buffer.alloc(data.length + 12);
    result.writeUInt32BE(data.length);
    body.copy(result, 4);
    result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
    return result;
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(128, 0);
  header.writeUInt32BE(128, 4);
  header[8] = 8;
  header[9] = 6;
  const pixels = Buffer.alloc(128 * (128 * 4 + 1));
  for (let y = 0; y < 128; y++)
    for (let x = 0; x < 128; x++) {
      const i = y * (128 * 4 + 1) + 1 + x * 4;
      pixels[i + 1] = channel;
      pixels[i + 3] =
        opaque || (x > 30 && x < 98 && y > 30 && y < 98) ? 255 : 0;
    }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function birthManifest(): CreatureManifest {
  const manifest = createCreatureManifest();
  manifest.portraits.push({
    key: 'birth',
    growth: 0,
    experience: 0,
    completedDays: 0,
    asset: 'assets/creature/birth.png',
    promptFile: 'assets/creature/birth.prompt.txt',
    source: 'builtin',
    model: 'test',
    reason: 'AI-generated birth.',
    referenceAssets: [],
  });
  return manifest;
}

async function workspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'creature-test-'));
  await fs.mkdir(path.join(root, 'assets/creature'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'assets/creature/birth.png'),
    pngFixture()
  );
  return root;
}

test('growth is derived from lasting decisions, not views, reruns, or wall-clock time', () => {
  const first = deriveCreature(createGame());
  assert.equal(first.growth, 0);
  assert.equal(first.experience, 0);
  const game = grownGame();
  const grown = deriveCreature(game);
  assert.equal(grown.growth, 1);
  assert.ok(grown.experience >= 24);
  assert.deepEqual(deriveCreature(game), grown);
  assert.ok(Object.values(grown.affinities).some((points) => points > 0));
  const sick = structuredClone(game);
  sick.world.stability = 0;
  assert.equal(deriveCreature(sick).condition, 'recovering');
  assert.equal(deriveCreature(sick).experience, grown.experience);
});

test('new growth uses memories and identity references, with no pre-drawn evolution selection', () => {
  const game = grownGame();
  const manifest = birthManifest();
  assert.equal(needsPortrait(createGame(), manifest), false);
  assert.equal(needsPortrait(game, manifest), true);
  const prompt = buildPortraitPrompt(game, manifest);
  assert.match(prompt, /ONLY the immediately preceding accepted appearance/);
  assert.match(prompt, /no pre-drawn evolution tree/);
  assert.match(prompt, /FIRST ADAPTATION/);
  assert.match(
    prompt,
    /complete animal body, developed armor, large horns or wings would skip too far/
  );
  assert.match(prompt, /without mandating any specific motif/);
  assert.ok(prompt.includes(game.history.at(-1)!.choiceTitle));
  assert.ok(prompt.includes(manifest.identity.invariants[0]));
  assert.equal(
    portraitKey(game, manifest),
    portraitKey(structuredClone(game), manifest)
  );
});

test('unformed beginnings and delayed images preserve gradual adaptation', () => {
  assert.equal(deriveCreature(createGame()).stage, 'unformed');
  const eggPrompt = buildPortraitPrompt(createGame(), createCreatureManifest());
  assert.match(eggPrompt, /UNFORMED DATA/);
  assert.match(eggPrompt, /no recognizable face, eyes, limbs/);
  const delayed = grownGame(3);
  const manifest = birthManifest();
  const hatchPrompt = buildPortraitPrompt(delayed, manifest);
  assert.match(hatchPrompt, /FIRST ADAPTATION/);
  assert.match(hatchPrompt, /even if several growth thresholds passed/);
  assert.doesNotMatch(hatchPrompt, /Winged, armored, bestial/);
  manifest.portraits.push({
    ...manifest.portraits[0],
    key: 'hatched',
    growth: 1,
    experience: 24,
    completedDays: 8,
    asset: 'assets/creature/hatched.png',
    promptFile: 'assets/creature/hatched.prompt.txt',
    referenceAssets: [manifest.portraits[0].asset],
  });
  const laterPrompt = buildPortraitPrompt(delayed, manifest);
  assert.doesNotMatch(laterPrompt, /FIRST ADAPTATION/);
  assert.match(laterPrompt, /no fixed species or final form/);
  assert.match(laterPrompt, /over several accepted appearances/);
});

test('manifest rejects unsafe asset paths and broken lineage', () => {
  validateCreatureManifest(birthManifest());
  const manifest = birthManifest();
  manifest.portraits[0].asset = '../../.env';
  assert.throws(() => validateCreatureManifest(manifest));
  const lineage = birthManifest();
  lineage.portraits[0].referenceAssets = ['assets/creature/missing.png'];
  assert.throws(() => validateCreatureManifest(lineage));
});

test('PNG validation rejects opaque, truncated, and non-image responses', () => {
  validatePortraitPng(pngFixture());
  assert.throws(
    () => validatePortraitPng(pngFixture(140, true)),
    /transparent/
  );
  assert.throws(() => validatePortraitPng(pngFixture().subarray(0, 50)));
  assert.throws(() => validatePortraitPng(Buffer.from('<html>error</html>')));
});

test('missing key, disabled images, and unchanged growth cause no API calls', async () => {
  const manifest = birthManifest();
  let calls = 0;
  const mock: typeof fetch = async () => {
    calls++;
    throw new Error('unexpected call');
  };
  assert.deepEqual(
    await generatePortrait(grownGame(), manifest, '/unused', {}, mock),
    manifest
  );
  assert.deepEqual(
    await generatePortrait(
      grownGame(),
      manifest,
      '/unused',
      {
        ...cfEnv,
        CREATURE_IMAGES: 'off',
      },
      mock
    ),
    manifest
  );
  assert.deepEqual(
    await generatePortrait(createGame(), manifest, '/unused', cfEnv, mock),
    manifest
  );
  assert.equal(calls, 0);
});

test('accepted growth is saved with references and a prompt; retries do not generate twice', async () => {
  const root = await workspace();
  try {
    let calls = 0;
    const candidate = pngFixture(180);
    const mock: typeof fetch = async (url, init) => {
      calls++;
      assert.equal(new URL(String(url)).hostname, 'api.cloudflare.com');
      const plan = planningResponse(init);
      if (plan) return plan;
      if (init?.body instanceof FormData) {
        assert.ok(init.body.get('input_image_0') instanceof Blob);
        assert.equal(
          init.body.get('input_image_1'),
          null,
          'only the immediate parent is referenced'
        );
        return new Response(
          JSON.stringify({
            success: true,
            result: { image: candidate.toString('base64') },
          })
        );
      }
      const payload = JSON.parse(String(init?.body));
      assert.equal(
        payload.messages[0].content.filter(
          (item: { type: string }) => item.type === 'image_url'
        ).length,
        2
      );
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            choices: [
              {
                finish_reason: 'stop',
                message: {
                  content: JSON.stringify({
                    same_identity: true,
                    single_creature: true,
                    clean_sprite: true,
                    plausible_growth: true,
                  }),
                },
              },
            ],
          },
        })
      );
    };
    const game = grownGame();
    const manifest = birthManifest();
    const now = new Date('2026-09-13T01:00:00Z');
    const accepted = await generatePortrait(
      game,
      manifest,
      root,
      cfEnv,
      mock,
      now
    );
    assert.equal(accepted.portraits.length, 2);
    assert.equal(manifest.portraits.length, 1, 'input manifest is unchanged');
    assert.equal(accepted.lastAttempt?.result, 'generated');
    const last = accepted.portraits.at(-1)!;
    assert.equal(
      last.evolution?.change,
      'One edge opens into a small sensory fold.'
    );
    assert.deepEqual(last.evolution?.memoryDays, [game.history.at(-1)!.day]);
    assert.equal(last.reason, last.evolution?.reason);
    assert.match(renderCreatureAlbum(game, accepted), /Carried forward/);
    assert.match(
      renderCreatureAlbum(game, accepted),
      /Memories behind this change/
    );
    assert.deepEqual(
      await sharp(await fs.readFile(path.join(root, last.asset)))
        .raw()
        .toBuffer(),
      await sharp(candidate).raw().toBuffer()
    );
    assert.match(
      await fs.readFile(path.join(root, last.promptFile), 'utf8'),
      /Actual recent experiences/
    );
    assert.deepEqual(
      await generatePortrait(game, accepted, root, cfEnv, mock, now),
      accepted
    );
    assert.equal(calls, 3);
    assert.deepEqual(
      await fs.readFile(path.join(root, 'assets/creature/birth.png')),
      pngFixture()
    );
    assert.equal(
      latestPortrait(accepted, deriveCreature(createGame()))?.growth,
      0,
      'a rolled-back game never shows a future portrait'
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('later evolution references only the immediate parent and records a causal transition', async () => {
  const root = await workspace();
  try {
    const parentBytes = pngFixture(170);
    await fs.writeFile(
      path.join(root, 'assets/creature/parent.png'),
      parentBytes
    );
    const manifest = birthManifest();
    manifest.portraits.push({
      ...manifest.portraits[0],
      key: 'parent',
      growth: 1,
      experience: 24,
      completedDays: 8,
      asset: 'assets/creature/parent.png',
      promptFile: 'assets/creature/parent.prompt.txt',
      referenceAssets: [manifest.portraits[0].asset],
    });
    const game = grownGame(3);
    let calls = 0;
    const mock: typeof fetch = async (_url, init) => {
      calls++;
      if (init?.body instanceof FormData) {
        assert.equal(init.body.get('input_image_1'), null);
        assert.match(
          String(init.body.get('prompt')),
          /One edge opens into a small sensory fold/
        );
        assert.match(String(init.body.get('prompt')), /continued adaptation/);
        const reference = init.body.get('input_image_0') as Blob;
        const pixel = await sharp(Buffer.from(await reference.arrayBuffer()))
          .extract({ left: 240, top: 240, width: 1, height: 1 })
          .raw()
          .toBuffer();
        assert.equal(
          pixel[1],
          170,
          'image generation sees the parent, not the birth image'
        );
        return new Response(
          JSON.stringify({
            success: true,
            result: { image: pngFixture(210).toString('base64') },
          })
        );
      }
      const payload = JSON.parse(String(init?.body));
      const imageParts = payload.messages[0].content.filter(
        (part: { type: string }) => part.type === 'image_url'
      );
      assert.equal(
        imageParts[0].image_url.url,
        `data:image/png;base64,${parentBytes.toString('base64')}`
      );
      const plan = planningResponse(init);
      if (plan) return plan;
      assert.equal(
        imageParts.length,
        2,
        'review compares only parent and candidate'
      );
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            response: JSON.stringify({
              same_identity: true,
              single_creature: true,
              clean_sprite: true,
              plausible_growth: true,
            }),
          },
        })
      );
    };
    const result = await generatePortrait(game, manifest, root, cfEnv, mock);
    assert.equal(calls, 3);
    assert.equal(result.portraits.length, 3);
    const last = result.portraits.at(-1)!;
    assert.deepEqual(last.referenceAssets, ['assets/creature/parent.png']);
    assert.deepEqual(last.evolution?.memoryDays, [game.history.at(-1)!.day]);
    assert.equal(manifest.portraits.length, 2);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('an invented memory in a transition plan stops before image generation', async () => {
  const root = await workspace();
  try {
    let calls = 0;
    const mock: typeof fetch = async (_url, init) => {
      calls++;
      assert.ok(!(init?.body instanceof FormData));
      const response = planningResponse(init)!;
      const envelope = (await response.json()) as {
        result: { response: string };
      };
      const plan = JSON.parse(envelope.result.response);
      plan.memoryDays = [999];
      envelope.result.response = JSON.stringify(plan);
      return new Response(JSON.stringify(envelope));
    };
    const game = grownGame();
    const before = structuredClone(game);
    const manifest = birthManifest();
    const result = await generatePortrait(game, manifest, root, cfEnv, mock);
    assert.equal(calls, 1);
    assert.equal(result.lastAttempt?.result, 'failed');
    assert.deepEqual(result.portraits, manifest.portraits);
    assert.deepEqual(game, before);
    assert.deepEqual(await fs.readdir(path.join(root, 'assets/creature')), [
      'birth.png',
    ]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('failed generation preserves the portrait and prevents same-day repeated charges', async () => {
  const root = await workspace();
  try {
    let calls = 0;
    const mock: typeof fetch = async () => {
      calls++;
      return new Response('{}', { status: 503 });
    };
    const game = grownGame();
    const failed = await generatePortrait(
      game,
      birthManifest(),
      root,
      cfEnv,
      mock,
      new Date('2026-09-13T01:00:00Z')
    );
    assert.equal(failed.lastAttempt?.result, 'failed');
    assert.equal(failed.portraits.length, 1);
    await generatePortrait(
      game,
      failed,
      root,
      cfEnv,
      mock,
      new Date('2026-09-13T02:00:00Z')
    );
    assert.equal(calls, 1);
    await generatePortrait(
      game,
      failed,
      root,
      cfEnv,
      mock,
      new Date('2026-09-14T02:00:00Z')
    );
    assert.equal(calls, 2);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('a rejected identity review cannot publish the generated image', async () => {
  const root = await workspace();
  try {
    const mock: typeof fetch = async (_url, init) =>
      planningResponse(init) ??
      (init?.body instanceof FormData
        ? new Response(
            JSON.stringify({
              success: true,
              result: { image: pngFixture(190).toString('base64') },
            })
          )
        : new Response(
            JSON.stringify({
              success: true,
              result: {
                choices: [
                  {
                    finish_reason: 'stop',
                    message: {
                      content: JSON.stringify({
                        same_identity: false,
                        single_creature: true,
                        clean_sprite: true,
                        plausible_growth: true,
                      }),
                    },
                  },
                ],
              },
            })
          ));
    const result = await generatePortrait(
      grownGame(),
      birthManifest(),
      root,
      cfEnv,
      mock
    );
    assert.equal(result.portraits.length, 1);
    assert.equal(result.lastAttempt?.result, 'failed');
    assert.deepEqual(await fs.readdir(path.join(root, 'assets/creature')), [
      'birth.png',
    ]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('profile keeps personal content, shows the actual portrait, and labels a pending growth honestly', () => {
  const game = grownGame();
  const manifest = birthManifest();
  const input = `# My profile\nPersonal links\n${START}\n${END}\nFooter`;
  const output = replaceSection(input, game, 'fabric0de/fabric0de', manifest);
  assert.ok(output.startsWith('# My profile\nPersonal links\n'));
  assert.ok(output.endsWith('Footer'));
  assert.match(output, /\.\/assets\/creature\/birth\.png/);
  assert.match(output, /new appearance is pending/);
  assert.match(
    renderCreatureAlbum(game, manifest),
    /\.\.\/assets\/creature\/birth\.png/
  );
  assert.match(renderCreatureAlbum(game, manifest), /Awakening/);
});

test('reference editing, background removal, vision review and provenance work together', async () => {
  const root = await workspace();
  try {
    const generated = await sharp(pngFixture(190))
      .flatten({ background: '#ff00ff' })
      .png()
      .toBuffer();
    let calls = 0;
    let approve = true;
    const mock: typeof fetch = async (url, init) => {
      calls++;
      assert.equal(new URL(String(url)).hostname, 'api.cloudflare.com');
      const plan = planningResponse(init);
      if (plan) return plan;
      if (init?.body instanceof FormData) {
        assert.ok(String(url).endsWith('/flux-2-klein-4b'));
        assert.match(String(init.body.get('prompt')), /Input image 0/);
        assert.doesNotMatch(
          String(init.body.get('prompt')),
          /genuinely transparent canvas/
        );
        const reference = init.body.get('input_image_0') as Blob;
        const metadata = await sharp(
          Buffer.from(await reference.arrayBuffer())
        ).metadata();
        assert.equal(metadata.width, 480);
        assert.equal(init.body.get('input_image_1'), null);
        return new Response(
          JSON.stringify({
            success: true,
            result: { image: generated.toString('base64') },
          })
        );
      }
      const body = JSON.parse(String(init?.body));
      assert.equal(
        body.messages[0].content.filter(
          (part: { type: string }) => part.type === 'image_url'
        ).length,
        2
      );
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            choices: [
              {
                finish_reason: 'stop',
                message: {
                  content: JSON.stringify({
                    same_identity: approve,
                    single_creature: true,
                    clean_sprite: true,
                    plausible_growth: true,
                  }),
                },
              },
            ],
          },
        })
      );
    };
    const manifest = birthManifest();
    const accepted = await generatePortrait(
      grownGame(),
      manifest,
      root,
      cfEnv,
      mock
    );
    assert.equal(accepted.portraits.length, 2);
    const portrait = accepted.portraits.at(-1)!;
    assert.equal(portrait.source, 'cloudflare');
    validatePortraitPng(await fs.readFile(path.join(root, portrait.asset)));
    assert.match(
      await fs.readFile(path.join(root, portrait.promptFile), 'utf8'),
      /magenta/
    );
    await generatePortrait(grownGame(), accepted, root, cfEnv, mock);
    assert.equal(calls, 3);
    approve = false;
    const rejected = await generatePortrait(
      grownGame(),
      manifest,
      root,
      cfEnv,
      mock
    );
    assert.equal(rejected.portraits.length, 1);
    assert.equal(rejected.lastAttempt?.result, 'failed');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('Cloudflare conversion preserves the subject and rejects missing backgrounds and malformed images', async () => {
  const flat = await sharp(pngFixture())
    .flatten({ background: '#ff00ff' })
    .png()
    .toBuffer();
  const output = await prepareCloudflarePortrait(flat);
  validatePortraitPng(output);
  const { data } = await sharp(output)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0);
  assert.equal(data[(64 * 128 + 64) * 4 + 1], 140);
  assert.equal(data[(64 * 128 + 64) * 4 + 3], 255);
  assert.throws(() => validatePortraitPng(pngFixture(140, true)));
  await assert.rejects(prepareCloudflarePortrait(Buffer.from('not an image')));
  assert.throws(() =>
    cloudflareUrl({ ...cfEnv, CF_ACCOUNT_ID: '../other' }, CF_TEXT_MODEL)
  );
  assert.throws(() => cloudflareUrl(cfEnv, 'https://example.com'));
});

test('Cloudflare narration uses existing credentials and invalid/incomplete replies fall back', async () => {
  const game = createGame();
  const mock: typeof fetch = async (url) => {
    assert.equal(new URL(String(url)).hostname, 'api.cloudflare.com');
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          choices: [
            {
              finish_reason: 'stop',
              message: {
                content:
                  '{"quip":"The unfamiliar signal sounds a little closer."}',
              },
            },
          ],
        },
      })
    );
  };
  assert.equal(
    await narrate(game, cfEnv, mock),
    'The unfamiliar signal sounds a little closer.'
  );
  const incomplete: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        result: {
          choices: [{ finish_reason: 'length', message: { content: '{}' } }],
        },
      })
    );
  await assert.rejects(
    cloudflareJson(cfEnv, CF_TEXT_MODEL, 'test', {}, incomplete)
  );
  assert.equal(await narrate(game, cfEnv, incomplete), game.round.quip);
  let calls = 0;
  const never: typeof fetch = async () => {
    calls++;
    throw new Error('unexpected');
  };
  await generatePortrait(
    grownGame(),
    birthManifest(),
    '/unused',
    { CF_ACCOUNT_ID: cfEnv.CF_ACCOUNT_ID },
    never
  );
  await generatePortrait(
    grownGame(),
    birthManifest(),
    '/unused',
    { ...cfEnv, CREATURE_IMAGES: 'off' },
    never
  );
  assert.equal(calls, 0);
});
