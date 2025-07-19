export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  hasScreenshot?: boolean;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface ConversationContext {
  messages: Message[];
  lastScreenshot?: string;
  userPreferences?: Record<string, any>;
}