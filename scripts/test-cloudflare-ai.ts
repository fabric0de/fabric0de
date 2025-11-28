/**
 * Repeated parsing test script
 * Tests JSON parsing with multiple API calls and improves parsing logic
 *
 * Usage:
 *   tsx scripts/test-parsing.ts
 */

import { config } from 'dotenv';
import type {
  CloudflareAIResponse,
  CloudflareAIRequest,
  Quiz,
} from './types.js';
import { SYSTEM_PROMPT, buildQuizPrompt } from './prompts.js';
import { parseJson, parseJsonWithFallback } from './jsonParser.js';
import fs from 'fs';

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

const topics = ['JavaScript', 'Web', 'HTTP', 'CSS', 'Node.js', 'CS Basics'];

interface TestResult {
  attempt: number;
  success: boolean;
  topic: string;
  error?: string;
  response?: string;
  parsed?: Quiz;
}

const testResults: TestResult[] = [];

const testSingleCall = async (attempt: number): Promise<TestResult> => {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  console.log(`\n[Attempt ${attempt}] Testing with topic: ${topic}`);

  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildQuizPrompt(topic) },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        } as CloudflareAIRequest),
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      return {
        attempt,
        success: false,
        topic,
        error: `HTTP ${resp.status}: ${errorText}`,
        response: errorText,
      };
    }

    const result = (await resp.json()) as CloudflareAIResponse;
    const rawResponse = result.result.response;

    // Try parsing
    let parsed: Quiz;
    try {
      parsed = parseJson<Quiz>(rawResponse);
      console.log(`  ✅ parseJson succeeded`);
      return {
        attempt,
        success: true,
        topic,
        response: rawResponse,
        parsed,
      };
    } catch (e1) {
      const error1 = e1 as Error;
      console.log(
        `  ⚠️  parseJson failed: ${error1.message.substring(0, 100)}`
      );
      try {
        parsed = parseJsonWithFallback<Quiz>(rawResponse);
        console.log(`  ✅ parseJsonWithFallback succeeded`);
        return {
          attempt,
          success: true,
          topic,
          response: rawResponse,
          parsed,
        };
      } catch (e2) {
        const error2 = e2 as Error;
        console.log(
          `  ❌ parseJsonWithFallback failed: ${error2.message.substring(0, 100)}`
        );
        return {
          attempt,
          success: false,
          topic,
          error: error2.message,
          response: rawResponse,
        };
      }
    }
  } catch (e) {
    const error = e as Error;
    return {
      attempt,
      success: false,
      topic,
      error: error.message,
    };
  }
};

const runTests = async (count: number = 10) => {
  console.log('🚀 Starting repeated parsing tests...');
  console.log(`📊 Will run ${count} tests\n`);

  const successRates: number[] = [];

  for (let i = 1; i <= count; i++) {
    const result = await testSingleCall(i);
    testResults.push(result);

    // Small delay between requests
    if (i < count) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const successCount = testResults.filter((r) => r.success).length;
  const failureCount = testResults.filter((r) => !r.success).length;
  const successRate = (successCount / count) * 100;

  console.log(`✅ Successful: ${successCount}/${count}`);
  console.log(`❌ Failed: ${failureCount}/${count}`);
  console.log(`📈 Success rate: ${successRate.toFixed(1)}%`);

  successRates.push(successRate);

  // Show failures
  if (failureCount > 0) {
    console.log('\n❌ FAILED ATTEMPTS:');
    testResults
      .filter((r) => !r.success)
      .forEach((result) => {
        console.log(`\n[Attempt ${result.attempt}] Topic: ${result.topic}`);
        console.log(`Error: ${result.error}`);
        if (result.response) {
          console.log(`\nResponse preview (first 500 chars):`);
          console.log('-'.repeat(80));
          console.log(result.response.substring(0, 500));
          console.log('-'.repeat(80));
        }
      });
  }

  // Save detailed results to file
  const resultsFile = 'test-results.json';
  fs.writeFileSync(
    resultsFile,
    JSON.stringify(
      {
        summary: {
          total: count,
          success: successCount,
          failure: failureCount,
          successRate: (successCount / count) * 100,
        },
        results: testResults,
      },
      null,
      2
    )
  );
  console.log(`\n💾 Detailed results saved to ${resultsFile}`);

  // Exit with error code if any failures
  if (failureCount > 0) {
    console.log(
      '\n⚠️  Some tests failed. Review the results and improve parsing logic.'
    );
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
};

// Run multiple test batches and calculate average
const runMultipleBatches = async (
  batches: number = 2,
  testsPerBatch: number = 10
) => {
  console.log(
    `🔄 Running ${batches} batches of ${testsPerBatch} tests each...\n`
  );
  const allSuccessRates: number[] = [];

  for (let batch = 1; batch <= batches; batch++) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📦 BATCH ${batch}/${batches}`);
    console.log('='.repeat(80));

    testResults.length = 0; // Clear previous results

    for (let i = 1; i <= testsPerBatch; i++) {
      const result = await testSingleCall(i);
      testResults.push(result);
      if (i < testsPerBatch) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successCount = testResults.filter((r) => r.success).length;
    const successRate = (successCount / testsPerBatch) * 100;
    allSuccessRates.push(successRate);

    console.log(
      `\n📊 Batch ${batch} Summary: ${successCount}/${testsPerBatch} (${successRate.toFixed(1)}%)`
    );

    if (batch < batches) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Overall statistics
  const average =
    allSuccessRates.reduce((a, b) => a + b, 0) / allSuccessRates.length;
  const min = Math.min(...allSuccessRates);
  const max = Math.max(...allSuccessRates);

  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 OVERALL STATISTICS');
  console.log('='.repeat(80));
  console.log(`Total batches: ${batches}`);
  console.log(`Tests per batch: ${testsPerBatch}`);
  console.log(`Total tests: ${batches * testsPerBatch}`);
  console.log(`Average success rate: ${average.toFixed(1)}%`);
  console.log(`Min success rate: ${min.toFixed(1)}%`);
  console.log(`Max success rate: ${max.toFixed(1)}%`);
  console.log(
    `All rates: ${allSuccessRates.map((r) => r.toFixed(1)).join('%, ')}%`
  );

  if (average < 95) {
    console.log(
      '\n⚠️  Average success rate is below 95%. Consider further improvements.'
    );
    process.exit(1);
  } else {
    console.log('\n🎉 Average success rate is excellent!');
    process.exit(0);
  }
};

// Run 4 batches of 5 tests each (total 20 tests)
runMultipleBatches(4, 5);
