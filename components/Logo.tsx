import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({ className = "h-8 w-auto", showText = true }) => {
  // Select image source based on showText prop
  const src = showText ? '/logo-text.png' : '/logo-no-text.png';

  return (
    <img 
        src={src} 
        alt="LevelUp Fitness AI" 
        className={`object-contain ${className}`}
    />
  );
};