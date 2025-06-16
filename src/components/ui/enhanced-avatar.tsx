"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface EnhancedAvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedAvatar({ 
  src, 
  alt, 
  fallback,
  className,
  size = 'md',
}: EnhancedAvatarProps) {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };
  
  // Generate fallback text from alt or provided fallback
  const fallbackText = fallback || alt.charAt(0).toUpperCase();
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && (
        <AvatarImage 
          src={src} 
          alt={alt}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
} 