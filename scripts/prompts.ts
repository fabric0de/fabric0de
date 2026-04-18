/**
 * Cloudflare AI prompt constants
 * Shared between test code and quiz generation code
 */

export const SYSTEM_PROMPT = `You are a helpful assistant that generates development quiz questions.
Generate exactly one concise development quiz per request.
Keep the question practical, clear, and suitable for a public daily quiz.`;

export const TEST_USER_PROMPT = 'Generate a quiz question about JavaScript.';

export const buildQuizPrompt = (
  topicOfTheDay: string,
  recentQuestions: string[]
): string => {
  const recentQuestionsBlock = recentQuestions.length
    ? `Avoid repeating or closely paraphrasing these recent questions:
${recentQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}`
    : 'There are no recent questions to avoid.';

  return `Generate exactly ONE development quiz about ${topicOfTheDay}.

Requirements:
- Language: English
- Question: 1-2 sentences
- Answer: 3-6 lines, use \\n for line breaks (not actual newlines)
- Theme: exactly "${topicOfTheDay}"
- Difficulty: beginner, intermediate, or advanced
- Type: "open" or "mcq"
- Tags: array of relevant tags

IMPORTANT:
- Make the question meaningfully different from recent questions

${recentQuestionsBlock}
`;
};
