export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SupportSession {
  id: string;
  problem_description: string;
  ai_response: string;
  detected_priority: number;
  category: string;
  solved: boolean;
  status: string;

  messages: SupportMessage[];
}