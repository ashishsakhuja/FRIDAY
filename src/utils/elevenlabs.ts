import type { VoiceSettings } from '../types';

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default Bella voice
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.8,
  style: 0.3,
  use_speaker_boost: true,
};

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  if (!API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: defaultVoiceSettings,
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
  }
}

export function playAudio(audioBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play();
    } catch (error) {
      reject(error);
    }
  });
}