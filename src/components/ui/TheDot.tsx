import React from 'react';
import { cn } from '@/lib/utils';

interface TheDotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function TheDot({ className, size = 'md' }: TheDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-8 h-8',
    xl: 'w-16 h-16'
  };

  return (
    <div 
      className={cn(
        "rounded-full bg-primary inline-block",
        sizeClasses[size],
        className
      )}
    />
  );
}
