export interface CloudflareAIResponse {
  result: {
    response: string;
  };
  success: boolean;
  errors: unknown[];
  messages: unknown[];
}

export interface Quiz {
  id: string;
  question: string;
  answer: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  type?: 'open' | 'mcq';
}

export interface CloudflareAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CloudflareAIRequest {
  messages: CloudflareAIMessage[];
  max_tokens?: number;
  temperature?: number;
}
