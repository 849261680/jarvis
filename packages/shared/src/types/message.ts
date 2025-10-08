export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface ChatResponse {
  message: string;
  shouldCreateLog?: boolean;
  logData?: Partial<DailyLog>;
}

export interface DailyLog {
  date: string;
  activities: Activity[];
  reflection?: string;
  aiSuggestion?: string;
}

export interface Activity {
  category: 'work' | 'study' | 'exercise' | 'entertainment' | 'life';
  name: string;
  duration?: number;
  time?: string;
  rating?: number;
}
