
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  messages: Message[];
  context?: {
    topics: string[];
    preferences?: Record<string, any>;
  };
}
