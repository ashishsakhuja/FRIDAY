import { useState, useCallback, useRef } from 'react';
import { useEffect } from 'react';
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
  const [isAwake, setIsAwake] = useState(false);
  const [lastScreenAnalysis, setLastScreenAnalysis] = useState<string>('');
  
  const speechRecognition = useRef(new SpeechRecognitionService());
  const dynamicAnalysisTimer = useRef<NodeJS.Timeout | null>(null);

  // Start wake word listening when component mounts
  useEffect(() => {
    if (speechRecognition.current.isSupported() && !isAwake) {
      speechRecognition.current.startWakeWordListening(() => {
        setIsAwake(true);
        setAutoListening(true);
        setState('listening');
        startListeningContinuous();
        startDynamicScreenAnalysis();
      });
    }

    return () => {
      speechRecognition.current.stopWakeWordListening();
      if (dynamicAnalysisTimer.current) {
        clearInterval(dynamicAnalysisTimer.current);
      }
    };
  }, [isAwake]);

  const startDynamicScreenAnalysis = useCallback(() => {
    if (dynamicAnalysisTimer.current) {
      clearInterval(dynamicAnalysisTimer.current);
    }

    dynamicAnalysisTimer.current = setInterval(async () => {
      if (state === 'idle' || state === 'listening') {
        try {
          const screenshot = await captureScreen(true);
          
          // Only analyze if screen content has changed significantly
          if (screenshot !== lastScreenAnalysis) {
            setLastScreenAnalysis(screenshot);
            
            const analysis = await analyzeScreenWithGPT(
              screenshot, 
              "Analyze what the user is currently working on. Only provide suggestions if you see something that could be improved or if you can offer helpful assistance. Be brief and only speak up when truly helpful.",
              true
            );
            
            // Only respond if the analysis suggests something useful
            if (analysis && analysis.length > 50 && !analysis.toLowerCase().includes('looks good') && !analysis.toLowerCase().includes('nothing to suggest')) {
              addMessage("Dynamic screen analysis", false);
              addMessage(analysis, false);
              
              if (state !== 'speaking') {
                setState('speaking');
                const audioBuffer = await textToSpeech(analysis);
                await playAudio(audioBuffer);
                
                if (autoListening) {
                  setState('listening');
                } else {
                  setState('idle');
                }
              }
            }
          }
          
          // Clear screenshot immediately
          setLastScreenAnalysis('');
        } catch (error) {
          console.log('Dynamic analysis skipped:', error);
        }
      }
    }, 30000); // Analyze every 30 seconds
  }, [state, autoListening, lastScreenAnalysis, addMessage]);
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
        const audioBuffer = await textToSpeech("Powering down. Say 'Hey FRIDAY' to wake me up.");
        await playAudio(audioBuffer);
        
        // Power down - stop everything and start wake word listening
        setAutoListening(false);
        setIsAwake(false);
        setState('idle');
        
        // Stop dynamic analysis
        if (dynamicAnalysisTimer.current) {
          clearInterval(dynamicAnalysisTimer.current);
        }
        
        // Start wake word listening
        setTimeout(() => {
          speechRecognition.current.startWakeWordListening(() => {
            setIsAwake(true);
            setAutoListening(true);
            setState('listening');
            startListeningContinuous();
            startDynamicScreenAnalysis();
          });
        }, 1000);
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
          const screenshot = await captureScreen(true);
          response = await analyzeScreenWithGPT(screenshot, transcript);
          addMessage(transcript, true).hasScreenshot = true;
          
          // Clear screenshot immediately
          setLastScreenAnalysis('');
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
  }, [addMessage, getConversationHistory, autoListening, startDynamicScreenAnalysis]);

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

    setIsAwake(true);
    try {
      setState('listening');
      setError(null);
      setAutoListening(true);
      
      startDynamicScreenAnalysis();
      startListeningContinuous();
    } catch (error) {
      console.error('Voice assistant error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setState('idle');
      setAutoListening(false);
    }
  }, [startListeningContinuous, startDynamicScreenAnalysis]);

  const stopListening = useCallback(() => {
    speechRecognition.current.stopListening();
    setAutoListening(false);
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
    autoListening,
    isAwake,
    startListening,
    stopListening,
    clearMessages,
    isSupported: speechRecognition.current.isSupported(),
  };
}