export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}