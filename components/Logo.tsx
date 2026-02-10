```
import React from 'react';

export const Logo: React.FC<{ className?: string, variant?: 'default' | 'large' }> = ({ className = "h-8 w-auto", variant = 'default' }) => {
  const src = variant === 'large' ? '/levelup-withtext.png' : '/logo.png';

  return (
    <img 
        src={src} 
        alt="LevelUp Fitness AI" 
        className={`object - contain ${ className } `}
    />
  );
};
```