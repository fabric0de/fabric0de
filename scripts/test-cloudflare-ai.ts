/**
 * Cloudflare Workers AI test script
 *
 * Usage:
 *   npm run test:ai
 *   or
 *   tsx scripts/test-cloudflare-ai.ts
 *
 * This script tests the Cloudflare Workers AI API connection
 * and displays the response.
 */

import { config } from 'dotenv';
import type { CloudflareAIResponse, CloudflareAIRequest } from './types.js';
import { SYSTEM_PROMPT, TEST_USER_PROMPT } from './prompts.js';

// Load .env file
config();

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_MODEL = process.env.CF_MODEL || '@cf/meta/llama-3.2-3b-instruct';

// Validate environment variables
if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('❌ Missing environment variables!');
  console.error('Please set CF_ACCOUNT_ID and CF_API_TOKEN in .env file.');
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log(`Account ID: ${CF_ACCOUNT_ID.substring(0, 8)}...`);
console.log(`Model: ${CF_MODEL}\n`);

// Test request
const testRequest: CloudflareAIRequest = {
  messages: [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: TEST_USER_PROMPT,
    },
  ],
};

// API call
fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
  {
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(testRequest),
  }
)
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as CloudflareAIResponse;

    console.log('✅ API call successful!\n');
    console.log('📦 Full response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📝 Extracted content:');
    console.log('─'.repeat(80));
    console.log(result.result.response);
    console.log('─'.repeat(80));
  })
  .catch((error) => {
    const err = error as Error;
    console.error('❌ Error occurred:', err.message);
    process.exit(1);
  });
