import React from 'react';
import type { AssistantState } from '../types';

interface OrbProps {
  state: AssistantState;
  onClick: () => void;
}

export function Orb({ state, onClick }: OrbProps) {
  const getOrbClasses = () => {
    const baseClasses = 'relative w-48 h-48 rounded-full cursor-pointer transition-all duration-500 transform hover:scale-105';
    
    switch (state) {
      case 'listening':
        return `${baseClasses} animate-pulse shadow-2xl shadow-blue-500/50`;
      case 'thinking':
        return `${baseClasses} animate-spin shadow-2xl shadow-cyan-500/50`;
      case 'speaking':
        return `${baseClasses} animate-bounce shadow-2xl shadow-purple-500/50`;
      default:
        return `${baseClasses} shadow-xl shadow-blue-500/30`;
    }
  };

  const getGradient = () => {
    switch (state) {
      case 'listening':
        return 'from-blue-400 via-blue-500 to-blue-600';
      case 'thinking':
        return 'from-cyan-400 via-cyan-500 to-cyan-600';
      case 'speaking':
        return 'from-purple-400 via-purple-500 to-purple-600';
      default:
        return 'from-blue-500 via-cyan-500 to-blue-600';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={getOrbClasses()}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {/* Main orb */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getGradient()} opacity-90`} />
        
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        
        {/* Core light */}
        <div className="absolute inset-1/3 rounded-full bg-gradient-to-br from-white/60 to-white/20 animate-pulse" />
        
        {/* Outer ring */}
        <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/30 animate-ping" 
             style={{ animationDuration: '2s' }} />
        
        {/* Particles */}
        {state === 'speaking' && (
          <>
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" 
                 style={{ animationDelay: '0s' }} />
            <div className="absolute -top-4 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping" 
                 style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-4 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping" 
                 style={{ animationDelay: '1s' }} />
            <div className="absolute -bottom-2 left-8 w-1 h-1 bg-purple-300 rounded-full animate-ping" 
                 style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>
    </div>
  );
}