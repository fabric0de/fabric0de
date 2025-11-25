/**
 * Cloudflare AI prompt constants
 * Shared between test code and quiz generation code
 */

export const SYSTEM_PROMPT = `You are a helpful assistant that generates development quiz questions.
CRITICAL: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.
You must generate exactly ONE quiz question per request. Never generate multiple questions.`;

export const TEST_USER_PROMPT = 'Generate a quiz question about JavaScript.';

export const buildQuizPrompt = (topicOfTheDay: string): string => {
  return `Generate exactly ONE development quiz about ${topicOfTheDay}.

Requirements:
- Language: English
- Question: 1-2 sentences
- Answer: 3-6 lines, in Markdown format
- Difficulty: beginner, intermediate, or advanced
- Type: "open" or "mcq"
- Tags: array of relevant tags

JSON format:
{
  "id": "YYYYMMDD",
  "question": "Your question here",
  "answer": "Your answer in Markdown",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["tag1", "tag2"],
  "type": "open|mcq"
}`;
};
