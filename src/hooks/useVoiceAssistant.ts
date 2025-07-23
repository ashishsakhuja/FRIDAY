import { useState, useCallback, useRef } from 'react';
import type { AssistantState, Message } from '../types';
import { generateResponse } from '../utils/openai';
import { textToSpeech, playAudio } from '../utils/elevenlabs';
import { SpeechRecognitionService } from '../utils/speechRecognition';
import { captureScreen, analyzeScreenWithGPT } from '../utils/screenCapture';

export function useVoiceAssistant() {
  const [state, setState] = useState<AssistantState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoListening, setAutoListening] = useState(false);
  
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

  const getConversationHistory = useCallback(() => {
    return messages.slice(-10).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
  }, [messages]);

  const processUserInput = useCallback(async (transcript: string, hasScreenshot = false) => {
    try {
      // Check for power down commands
      const powerDownCommands = ['power down', 'standby', 'sleep', 'shut down', 'go to sleep', 'power off'];
      if (powerDownCommands.some(cmd => transcript.toLowerCase().includes(cmd))) {
        addMessage(transcript, true);
        addMessage("Powering down. Press the orb to wake me up.", false);
        
        setState('speaking');
        const audioBuffer = await textToSpeech("Powering down. Press the orb to wake me up.");
        await playAudio(audioBuffer);
        
        // Power down - stop auto listening and go to idle
        setAutoListening(false);
        setState('idle');
        return;
      }
      
      setState('thinking');
      
      let response: string;
      
      // Check if user wants screen analysis
      const needsScreenAnalysis = transcript.toLowerCase().includes('screen') || 
                                 transcript.toLowerCase().includes('see') ||
                                 transcript.toLowerCase().includes('look') ||
                                 transcript.toLowerCase().includes('analyze') ||
                                 hasScreenshot;
      
      if (needsScreenAnalysis) {
        try {
          const screenshot = await captureScreen();
          response = await analyzeScreenWithGPT(screenshot, transcript);
          addMessage(transcript, true).hasScreenshot = true;
          
          // Clear screenshot reference to help with garbage collection
          // The screenshot variable will be cleaned up automatically
        } catch (screenError) {
          console.warn('Screen capture failed, using regular response:', screenError);
          response = await generateResponse(transcript, getConversationHistory());
          addMessage(transcript, true);
        }
      } else {
        response = await generateResponse(transcript, getConversationHistory());
        addMessage(transcript, true);
      }
      
      addMessage(response, false);
      
      // Convert response to speech
      setState('speaking');
      const audioBuffer = await textToSpeech(response);
      await playAudio(audioBuffer);
      
      // Return to auto-listening if enabled
      if (autoListening) {
        setState('listening');
        startListeningContinuous();
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setState('idle');
    }
  }, [addMessage, getConversationHistory, autoListening]);

  const startListeningContinuous = useCallback(() => {
    speechRecognition.current.startListening(
      () => {
        // Called when no speech detected - turn off auto-listening
        setAutoListening(false);
        setState('idle');
      },
      () => {
        // Called when no-speech error occurs - just continue listening
        console.log('No speech detected, continuing to listen...');
      }
    ).then((transcript) => {
      if (transcript.trim()) {
        processUserInput(transcript);
      } else {
        // Empty transcript (from no-speech error) - just continue listening
        if (autoListening) {
          setTimeout(() => {
            if (autoListening && state === 'listening') {
              startListeningContinuous();
            }
          }, 500);
        }
      }
    }).catch((error) => {
      console.error('Speech recognition error:', error);
      setError(error.message);
      setState('idle');
      setAutoListening(false);
    });
  }, [processUserInput]);

  const startListening = useCallback(async () => {
    if (!speechRecognition.current.isSupported()) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setState('listening');
      setError(null);
      setAutoListening(true);
      
      startListeningContinuous();
    } catch (error) {
      console.error('Voice assistant error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setState('idle');
      setAutoListening(false);
    }
  }, [startListeningContinuous]);

  const stopListening = useCallback(() => {
    speechRecognition.current.stopListening();
    setAutoListening(false);
    setState('idle');
  }, []);

  const analyzeScreen = useCallback(async () => {
    if (state !== 'idle') return;
    
    try {
      setState('thinking');
      setError(null);
      
      const screenshot = await captureScreen();
      const response = await analyzeScreenWithGPT(screenshot, "What do you see on my screen? Help me with what I'm working on.");
      
      addMessage("Analyze my screen", true).hasScreenshot = true;
      addMessage(response, false);
      
      setState('speaking');
      const audioBuffer = await textToSpeech(response);
      await playAudio(audioBuffer);
      
      setState('idle');
    } catch (error) {
      console.error('Screen analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze screen');
      setState('idle');
    }
  }, [state, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    state,
    messages,
    error,
    autoListening,
    startListening,
    stopListening,
    analyzeScreen,
    clearMessages,
    isSupported: speechRecognition.current.isSupported(),
  };
}