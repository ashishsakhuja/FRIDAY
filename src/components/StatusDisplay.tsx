import React from 'react';
import { Mic, MicOff, Brain, Volume2 } from 'lucide-react';
import type { AssistantState } from '../types';

interface StatusDisplayProps {
  state: AssistantState;
  error: string | null;
  autoListening?: boolean;
  isAwake?: boolean;
}

export function StatusDisplay({ state, error, autoListening, isAwake }: StatusDisplayProps) {
  if (!isAwake) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <MicOff className="w-6 h-6 text-gray-500" />
          <span className="text-lg font-medium text-gray-500">
            Standby Mode
          </span>
        </div>
        <div className="text-xs text-gray-400 text-center">
          Listening for wake word • Say "Hey FRIDAY" to activate
        </div>
        {error && (
          <div className="text-red-400 text-sm text-center max-w-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (state) {
      case 'listening':
        return {
          icon: <Mic className={`w-6 h-6 ${autoListening ? 'text-green-400' : 'text-blue-400'}`} />,
          text: autoListening ? 'Auto-Listening...' : 'Listening...',
          color: autoListening ? 'text-green-400' : 'text-blue-400',
        };
      case 'thinking':
        return {
          icon: <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />,
          text: 'Processing...',
          color: 'text-cyan-400',
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-6 h-6 text-purple-400" />,
          text: 'Speaking...',
          color: 'text-purple-400',
        };
      default:
        return {
          icon: <MicOff className="w-6 h-6 text-gray-400" />,
          text: 'Ready',
          color: 'text-gray-400',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        {status.icon}
        <span className={`text-lg font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>
      {autoListening && state === 'listening' && (
        <div className="text-xs text-green-300 text-center">
          Continuous listening active • Press orb to stop
        </div>
      )}
      {error && (
        <div className="text-red-400 text-sm text-center max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}