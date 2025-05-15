"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const [imgError, setImgError] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };
  
  useEffect(() => {
    // Reset error state when src changes
    setImgError(false);
    
    if (src) {
      // Try to get cached image from localStorage
      const cacheKey = `avatar-cache-${src}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        // Use cached version if available
        setLoadedSrc(cached);
      } else {
        // Otherwise use the original source
        setLoadedSrc(src);
        
        // We could implement blob caching here, but for avatars
        // it's often better to just let the browser cache handle it
        // as the images are small and frequently accessed
      }
    } else {
      setLoadedSrc(null);
    }
  }, [src]);
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      {!imgError && loadedSrc && (
        <img
          src={loadedSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          loading="eager" // Load eagerly for visible avatars
          fetchPriority="high" // High priority for visible avatars
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary">
        {fallback || alt.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
} 