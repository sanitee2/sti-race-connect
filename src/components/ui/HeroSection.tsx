"use client";

import React, { ReactNode } from 'react';
import { useTheme } from '@/providers/theme-provider';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  size?: 'default' | 'compact';
}

export function HeroSection({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  size = 'default' 
}: HeroSectionProps) {
  const { theme } = useTheme();
  
  const isCompact = size === 'compact';

  return (
    <section className={`
      ${isCompact ? 'pt-24 md:pt-32 pb-12 md:pb-16' : 'pt-32 md:pt-44 pb-24 md:pb-32'} 
      overflow-hidden relative bg-gradient-to-b from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 
      text-primary-foreground ${className}
    `}>
      {/* Background sporty elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className={`absolute top-20 left-1/4 ${isCompact ? 'w-40 h-40' : 'w-64 h-64'} rounded-full bg-secondary/20 dark:bg-secondary/30 blur-3xl`}></div>
        <div className={`absolute bottom-20 right-1/4 ${isCompact ? 'w-48 h-48' : 'w-80 h-80'} rounded-full bg-secondary/20 dark:bg-secondary/30 blur-3xl`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isCompact ? 'w-[400px] h-[400px]' : 'w-[600px] h-[600px]'} rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 blur-3xl`}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
      </div>
      
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className={`font-sans ${isCompact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-bold leading-tight text-primary-foreground mb-6`}>
              {title}
            </h1>
            
            {subtitle && (
              <p className={`${isCompact ? 'text-base' : 'text-lg'} text-primary-foreground/90 dark:text-primary-foreground max-w-3xl mx-auto ${children ? 'mb-8' : 'mb-0'}`}>
                {subtitle}
              </p>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </section>
  );
} 