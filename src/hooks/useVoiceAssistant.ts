import { useState, useCallback, useRef } from 'react';
import type { AssistantState, Message } from '../types';
import { generateResponse } from '../utils/openai';
import { textToSpeech, playAudio } from '../utils/elevenlabs';
import { SpeechRecognitionService } from '../utils/speechRecognition';

export function useVoiceAssistant() {
  const [state, setState] = useState<AssistantState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const speechRecognition = useRef(new SpeechRecognitionService());

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isUser,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const startListening = useCallback(async () => {
    if (!speechRecognition.current.isSupported()) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setState('listening');
      setError(null);
      
      const transcript = await speechRecognition.current.startListening();
      addMessage(transcript, true);
      
      // Process the user's message
      setState('thinking');
      const response = await generateResponse(transcript);
      addMessage(response, false);
      
      // Convert response to speech
      setState('speaking');
      const audioBuffer = await textToSpeech(response);
      await playAudio(audioBuffer);
      
      setState('idle');
    } catch (error) {
      console.error('Voice assistant error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setState('idle');
    }
  }, [addMessage]);

  const stopListening = useCallback(() => {
    speechRecognition.current.stopListening();
    setState('idle');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    state,
    messages,
    error,
    startListening,
    stopListening,
    clearMessages,
    isSupported: speechRecognition.current.isSupported(),
  };
}