import sharp from 'sharp';

export const CF_IMAGE_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
export const CF_TEXT_MODEL = '@cf/google/gemma-4-26b-a4b-it';

export function cloudflareUrl(env: NodeJS.ProcessEnv, model: string): string {
  if (!/^[a-f0-9]{32}$/i.test(env.CF_ACCOUNT_ID ?? '') || !env.CF_API_TOKEN)
    throw new Error('Cloudflare account and token are required');
  if (!/^@cf\/[a-z0-9-]+\/[a-z0-9_.-]+$/.test(model))
    throw new Error('Invalid Cloudflare model');
  return `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`;
}

export async function cloudflareJson(
  env: NodeJS.ProcessEnv,
  model: string,
  prompt: string,
  schema: object,
  fetcher: typeof fetch,
  images: Buffer[] = []
): Promise<unknown> {
  const response = await fetcher(cloudflareUrl(env, model), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...images.map((bytes) => ({
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${bytes.toString('base64')}`,
              },
            })),
          ],
        },
      ],
      max_completion_tokens: 2048,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'profile_result', strict: true, schema },
      },
      stream: false,
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok)
    throw new Error(`Cloudflare request failed (${response.status})`);
  const envelope = (await response.json()) as {
    success?: boolean;
    result?: unknown;
  };
  if (envelope.success === false) throw new Error('Cloudflare request failed');
  const result = (envelope.result ?? envelope) as {
    response?: unknown;
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  const choice = result.choices?.[0];
  if (choice?.finish_reason && choice.finish_reason !== 'stop')
    throw new Error('Incomplete Cloudflare reply');
  const content = choice?.message?.content ?? result.response;
  return typeof content === 'string' ? JSON.parse(content) : content;
}

export function cloudflarePortraitPrompt(prompt: string): string {
  return (
    prompt
      .replaceAll(
        'genuinely transparent canvas',
        'flat pure magenta (#ff00ff) canvas'
      )
      .replaceAll(
        'transparent background',
        'flat pure magenta (#ff00ff) background'
      )
      .replace(
        'Image 1 is ONLY the immediately preceding accepted appearance',
        'Input image 0 is ONLY the immediately preceding accepted appearance'
      ) +
    '\n\nUse only pure magenta outside the creature, without shadows or gradients. Never use magenta on the creature. The flat background will be removed after generation.'
  );
}

// FLUX does not expose an alpha-output option. Remove only the requested
// magenta backdrop; keep subject colors and existing alpha. Reject bad output
// through the shared portrait validator and vision review after this step.
export async function prepareCloudflarePortrait(
  bytes: Buffer
): Promise<Buffer> {
  if (bytes.length > 20 * 1024 * 1024) throw new Error('Image too large');
  const decoder = sharp(bytes, { limitInputPixels: 2048 * 2048 });
  const meta = await decoder.metadata();
  if (
    !meta.width ||
    meta.width !== meta.height ||
    meta.width < 128 ||
    meta.width > 2048 ||
    (meta.pages ?? 1) !== 1
  )
    throw new Error('Expected one square image');
  const { data, info } = await decoder
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r >= 180 && b >= 180 && g <= 100 && Math.abs(r - b) <= 65)
      data[i + 3] = 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

export async function cloudflarePortrait(
  references: Buffer[],
  prompt: string,
  model: string,
  env: NodeJS.ProcessEnv,
  fetcher: typeof fetch
): Promise<Buffer> {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', '1024');
  form.append('height', '1024');
  for (const [index, bytes] of references.entries()) {
    const resized = await sharp(bytes)
      .resize(480, 480, { kernel: 'nearest' })
      .flatten({ background: '#ff00ff' })
      .png()
      .toBuffer();
    form.append(
      `input_image_${index}`,
      new Blob([Uint8Array.from(resized)], { type: 'image/png' }),
      `reference-${index}.png`
    );
  }
  const response = await fetcher(cloudflareUrl(env, model), {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` },
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok)
    throw new Error(`Cloudflare image failed (${response.status})`);
  const envelope = (await response.json()) as {
    success?: boolean;
    result?: { image?: string };
  };
  const encoded = envelope.result?.image;
  if (
    envelope.success === false ||
    typeof encoded !== 'string' ||
    encoded.length > 28 * 1024 * 1024 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)
  )
    throw new Error('Invalid Cloudflare image response');
  return prepareCloudflarePortrait(Buffer.from(encoded, 'base64'));
}
