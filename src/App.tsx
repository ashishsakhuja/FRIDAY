import React from 'react';
import { Orb } from './components/Orb';
import { StatusDisplay } from './components/StatusDisplay';
import { MessageHistory } from './components/MessageHistory';
import { SetupInstructions } from './components/SetupInstructions';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

function App() {
  const {
    state,
    messages,
    error,
    startListening,
    stopListening,
    clearMessages,
    isSupported,
  } = useVoiceAssistant();

  const handleOrbClick = () => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle') {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <SetupInstructions />
      
      <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-8">
        {/* Main title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white mb-2">
            F.R.I.D.A.Y.
          </h1>
          <p className="text-gray-300 text-lg">
            Female Replacement Intelligent Digital Assistant Youth
          </p>
        </div>

        {/* Main orb */}
        <div className="relative">
          <Orb state={state} onClick={handleOrbClick} />
        </div>

        {/* Status display */}
        <StatusDisplay state={state} error={error} />

        {/* Instructions */}
        <div className="text-center max-w-md">
          {!isSupported ? (
            <p className="text-red-400">
              Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.
            </p>
          ) : state === 'idle' ? (
            <p className="text-gray-300">
              Click the orb to start talking with FRIDAY
            </p>
          ) : (
            <p className="text-gray-300">
              {state === 'listening' && 'Speak now, or click the orb to stop listening'}
              {state === 'thinking' && 'Processing your request...'}
              {state === 'speaking' && 'FRIDAY is responding...'}
            </p>
          )}
        </div>

        {/* Message history */}
        <MessageHistory messages={messages} onClear={clearMessages} />
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

export default App;