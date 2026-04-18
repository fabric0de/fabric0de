import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import type {
  Quiz,
  QuizHistoryEntry,
  ThemeConfig,
  CloudflareAIResponse,
  CloudflareAIRequest,
} from './types.js';
import { parseJson, parseJsonWithFallback } from './jsonParser.js';
import { SYSTEM_PROMPT, buildQuizPrompt } from './prompts.js';

config();

const readmePath = path.join(process.cwd(), 'README.md');
const historyPath = path.join(process.cwd(), 'data', 'quiz-history.json');
const themesPath = path.join(process.cwd(), 'data', 'themes.json');
const archivePath = path.join(process.cwd(), 'docs', 'archive.md');

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_MODEL = process.env.CF_MODEL || '@cf/meta/llama-3.1-8b-instruct-fast';

const getKstDate = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
};

const getKstDateId = (): string => {
  const kst = getKstDate();
  const yyyy = String(kst.getUTCFullYear());
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const getThemeOfTheDay = (): string => {
  const themeConfig = readThemeConfig();
  const bucketName = themeConfig.weekdayBuckets[getKstDate().getUTCDay()];
  const bucketThemes = themeConfig.themes[bucketName] ?? [];

  if (bucketThemes.length === 0) {
    throw new Error(`No themes configured for weekday bucket: ${bucketName}`);
  }

  const history = readQuizHistory();
  const recentThemes = history
    .slice(-14)
    .map((entry) => entry.theme)
    .filter((theme): theme is string => Boolean(theme));

  const availableThemes = bucketThemes.filter(
    (theme) => !recentThemes.includes(theme)
  );
  const candidateThemes = availableThemes.length
    ? availableThemes
    : bucketThemes;

  const daySeed = Number(getKstDateId());
  return candidateThemes[daySeed % candidateThemes.length];
};

const validateGeneratedQuiz = (quiz: Partial<Quiz>): quiz is Quiz => {
  if (
    typeof quiz.question !== 'string' ||
    quiz.question.length < 5 ||
    typeof quiz.answer !== 'string' ||
    quiz.answer.length < 5
  ) {
    return false;
  }

  (quiz as Quiz).id = getKstDateId();
  (quiz as Quiz).theme = (quiz.theme || getThemeOfTheDay()).trim();
  return true;
};

const QUIZ_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    question: { type: 'string' },
    answer: { type: 'string' },
    theme: { type: 'string' },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    type: {
      type: 'string',
      enum: ['open', 'mcq'],
    },
  },
  required: ['question', 'answer', 'theme', 'difficulty', 'tags', 'type'],
  additionalProperties: false,
} as const;

const ensureDirForFile = (filePath: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const readThemeConfig = (): ThemeConfig => {
  const raw = fs.readFileSync(themesPath, 'utf-8');
  return JSON.parse(raw) as ThemeConfig;
};

const readQuizHistory = (): QuizHistoryEntry[] => {
  try {
    const raw = fs.readFileSync(historyPath, 'utf-8');
    const parsed = JSON.parse(raw) as QuizHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getRecentQuestions = (history: QuizHistoryEntry[]): string[] => {
  return history
    .slice(-10)
    .map((entry) => entry.question)
    .filter(Boolean);
};

const normalizeText = (value: string): string => {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
};

const isDuplicateQuiz = (quiz: Quiz, history: QuizHistoryEntry[]): boolean => {
  const normalizedQuestion = normalizeText(quiz.question);
  return history.some(
    (entry) => normalizeText(entry.question) === normalizedQuestion
  );
};

const formatAnswer = (answer: string): string => {
  if (answer.includes('```')) {
    return answer;
  }

  return answer
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `> ${line}`)
    .join('\n\n');
};

const buildArchiveContent = (history: QuizHistoryEntry[]): string => {
  const entries = [...history].sort((a, b) => b.id.localeCompare(a.id));
  const sections = entries.map((entry) => {
    const meta = [
      entry.theme ? `theme: **${entry.theme}**` : '',
      entry.difficulty ? `difficulty: **${entry.difficulty}**` : '',
      entry.tags?.length ? entry.tags.map((tag) => `\`${tag}\``).join(' ') : '',
    ]
      .filter(Boolean)
      .join(' • ');

    return `## ${entry.id} - ${entry.question}

${meta}

${formatAnswer(entry.answer)}`;
  });

  return `# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

${sections.length ? sections.join('\n\n---\n\n') : '_No archived quizzes yet._'}
`;
};

const persistQuiz = (quiz: Quiz): void => {
  ensureDirForFile(historyPath);
  ensureDirForFile(archivePath);

  const history = readQuizHistory().filter((entry) => entry.id !== quiz.id);
  const nextHistory: QuizHistoryEntry[] = [
    ...history,
    {
      ...quiz,
      theme: quiz.theme ?? getThemeOfTheDay(),
      createdAt: new Date().toISOString(),
    },
  ].sort((a, b) => a.id.localeCompare(b.id));

  fs.writeFileSync(historyPath, JSON.stringify(nextHistory, null, 2) + '\n');
  fs.writeFileSync(archivePath, buildArchiveContent(nextHistory));
};

const parseQuizResponse = (response: unknown): Quiz => {
  if (
    response &&
    typeof response === 'object' &&
    'question' in response &&
    'answer' in response
  ) {
    return response as Quiz;
  }

  if (typeof response === 'string') {
    try {
      return parseJson<Quiz>(response);
    } catch {
      return parseJsonWithFallback<Quiz>(response);
    }
  }

  throw new Error('Unexpected response format from Cloudflare AI');
};

const generateQuizWithCloudflareAI = async (
  recentQuestions: string[]
): Promise<Quiz | null> => {
  try {
    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      throw new Error(
        'CF_ACCOUNT_ID and CF_API_TOKEN environment variables are required'
      );
    }

    const topicOfTheDay = getThemeOfTheDay();

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
            {
              role: 'user',
              content: buildQuizPrompt(topicOfTheDay, recentQuestions),
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: QUIZ_JSON_SCHEMA,
          },
          max_tokens: 1000,
          temperature: 0.2,
        } as CloudflareAIRequest),
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Cloudflare AI error: ${resp.status} - ${errorText}`);
    }

    const result = (await resp.json()) as CloudflareAIResponse;
    const parsed = parseQuizResponse(result.result.response);

    if (!validateGeneratedQuiz(parsed)) {
      console.error('Validation failed for quiz:', parsed);
      return null;
    }

    return parsed;
  } catch (e) {
    const error = e as Error;
    console.error('Cloudflare AI generation failed:', error.message);
    return null;
  }
};

const history = readQuizHistory();
const recentQuestions = getRecentQuestions(history);

let quiz: Quiz | null = null;

for (let attempt = 1; attempt <= 3; attempt++) {
  const generated = await generateQuizWithCloudflareAI(recentQuestions);
  if (!generated) {
    continue;
  }

  if (!isDuplicateQuiz(generated, history)) {
    quiz = generated;
    break;
  }

  console.warn(
    `Duplicate quiz detected on attempt ${attempt}: ${generated.question}`
  );
}

if (!quiz) {
  console.error('No quiz generated by Cloudflare AI. Aborting.');
  process.exit(1);
}

const difficultyEmoji: Record<string, string> = {
  beginner: '🟢',
  intermediate: '🟡',
  advanced: '🔴',
};

const themeBadge = quiz.theme ? `🗓️ **${quiz.theme}**` : '';
const difficultyBadge = quiz.difficulty
  ? `${difficultyEmoji[quiz.difficulty] || '📌'} **${quiz.difficulty}**`
  : '';
const tagsBadge = quiz.tags?.length
  ? `🏷️ ${quiz.tags.map((tag) => `\`${tag}\``).join(' ')}`
  : '';
const dateBadge = `📅 ${getKstDateId()}`;

const newQuizSection = `<!--START_SECTION:quiz-->

<div align="center">

### ❓ ${quiz.question}

</div>

<div align="center">

${[themeBadge, difficultyBadge, tagsBadge, dateBadge].filter(Boolean).join(' • ')}

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

${formatAnswer(quiz.answer)}

<br>

</details>

<!--END_SECTION:quiz-->`;

const readme = fs.readFileSync(readmePath, 'utf-8');
fs.writeFileSync(
  readmePath,
  readme.replace(
    /<!--START_SECTION:quiz-->[\s\S]*<!--END_SECTION:quiz-->/,
    newQuizSection
  )
);

persistQuiz(quiz);

console.log(`Updated quiz: ${quiz.question}`);
