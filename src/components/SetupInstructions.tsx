import React, { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export function SetupInstructions() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 max-w-2xl mx-auto z-50">
      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-yellow-400 font-semibold mb-2">Setup Required</h3>
            <div className="text-yellow-100 text-sm space-y-2">
              <p>To use FRIDAY, you need to configure your API keys:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Get your OpenAI API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>
                  Get your ElevenLabs API key from{' '}
                  <a 
                    href="https://elevenlabs.io/app/settings/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    ElevenLabs <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>Copy <code className="bg-black/30 px-1 rounded">.env.example</code> to <code className="bg-black/30 px-1 rounded">.env</code></li>
                <li>Add your API keys to the <code className="bg-black/30 px-1 rounded">.env</code> file</li>
              </ol>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}