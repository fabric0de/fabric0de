export interface CloudflareAIResponse {
  result: {
    response: unknown;
  };
  success: boolean;
  errors: unknown[];
  messages: unknown[];
}

export interface Quiz {
  id: string;
  question: string;
  answer: string;
  theme?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  type?: 'open' | 'mcq';
}

export interface QuizHistoryEntry extends Quiz {
  createdAt: string;
}

export interface ThemeConfig {
  weekdayBuckets: string[];
  themes: Record<string, string[]>;
}

export interface CloudflareAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CloudflareAIRequest {
  messages: CloudflareAIMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: {
    type: 'json_object' | 'json_schema';
    json_schema?: unknown;
  };
}
