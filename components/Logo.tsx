import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({ className = "h-8 w-auto", showText = true }) => {
  const src = showText ? '/levelup-withtext.png' : '/logo.png';

  return (
    <img
      src={src}
      alt="LevelUp Fitness AI"
      className={`object-contain ${className}`}
    />
  );
};