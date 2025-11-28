/**
 * Cloudflare AI prompt constants
 * Shared between test code and quiz generation code
 */

export const SYSTEM_PROMPT = `You are a helpful assistant that generates development quiz questions.
CRITICAL REQUIREMENTS:
1. You must respond with ONLY valid JSON. No markdown code blocks (no \`\`\`), no YAML syntax (no | or |-), no explanations.
2. All string values must be properly quoted and escaped. Use \\n for newlines, not actual newline characters.
3. You must generate exactly ONE quiz question per request. Never generate multiple questions.
4. The JSON must be complete and valid. Do not truncate or cut off the response.
5. Example format:
{"id":"20230220","question":"Your question here","answer":"Your answer here with \\n for line breaks","difficulty":"beginner","tags":["tag1"],"type":"open"}`;

export const TEST_USER_PROMPT = 'Generate a quiz question about JavaScript.';

export const buildQuizPrompt = (topicOfTheDay: string): string => {
  return `Generate exactly ONE development quiz about ${topicOfTheDay}.

CRITICAL: Respond with ONLY valid JSON. No markdown code blocks, no YAML syntax, no explanations.

Requirements:
- Language: English
- Question: 1-2 sentences
- Answer: 3-6 lines, use \\n for line breaks (not actual newlines)
- Difficulty: beginner, intermediate, or advanced
- Type: "open" or "mcq"
- Tags: array of relevant tags

IMPORTANT: 
- All string values must be in a single line with \\n for newlines
- Do NOT use YAML pipe syntax (| or |-)
- Do NOT wrap the JSON in markdown code blocks
- The JSON must be complete and valid

Example (note: this is just for reference, generate your own):
{"id":"20230220","question":"What is JavaScript?","answer":"JavaScript is a programming language.\\nIt is used for web development.\\nIt runs in browsers.","difficulty":"beginner","tags":["javascript"],"type":"open"}`;
};
