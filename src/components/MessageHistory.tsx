import React from 'react';
import { User, Bot, Trash2, Camera } from 'lucide-react';
import type { Message } from '../types';

interface MessageHistoryProps {
  messages: Message[];
  onClear: () => void;
}

export function MessageHistory({ messages, onClear }: MessageHistoryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Conversation History</h3>
        <button
          onClick={onClear}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 p-3 rounded-lg backdrop-blur-sm ${
              message.isUser 
                ? 'bg-blue-500/20 border border-blue-400/30' 
                : 'bg-purple-500/20 border border-purple-400/30'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.isUser ? 'bg-blue-500' : 'bg-purple-500'
            }`}>
              {message.isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {message.hasScreenshot && (
                  <Camera className="w-3 h-3 text-cyan-400" />
                )}
              </div>
              <p className="text-white text-sm leading-relaxed">{message.text}</p>
              <span className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}