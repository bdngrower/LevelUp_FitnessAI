import React from 'react';
import { Dumbbell } from './Icons';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
        <Dumbbell className="w-5 h-5 fill-current" />
      </div>
      {showText && (
        <span className="text-xl">LevelUp<span className="text-primary">.AI</span></span>
      )}
    </div>
  );
};