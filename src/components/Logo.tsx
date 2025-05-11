import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  textColor?: string;
  linkClassName?: string;
  variant?: 'default' | 'white';
}

export function Logo({ 
  className = "", 
  textColor = "", 
  linkClassName = "",
  variant = 'default'
}: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", linkClassName)}>
      <div className={cn("flex items-center", className)}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" 
            className={cn(
              variant === 'white' ? "fill-white/15" : "fill-current opacity-15",
              "text-primary"
            )} 
          />
          <path 
            d="M21 12C21 14.2091 19.2091 16 17 16C14.7909 16 13 14.2091 13 12C13 9.79086 14.7909 8 17 8C19.2091 8 21 9.79086 21 12Z" 
            className={cn(
              variant === 'white' ? "fill-white" : "fill-current",
              "text-primary"
            )} 
          />
          <path 
            d="M25 20.5C25 22.9853 22.5376 25 19.5 25C16.4624 25 14 22.9853 14 20.5C14 18.0147 16.4624 16 19.5 16C22.5376 16 25 18.0147 25 20.5Z" 
            className={cn(
              variant === 'white' ? "fill-white" : "fill-current",
              "text-primary"
            )} 
          />
          <path 
            d="M13 21.5C13 23.9853 10.5376 26 7.5 26C4.46243 26 2 23.9853 2 21.5C2 19.0147 4.46243 17 7.5 17C10.5376 17 13 19.0147 13 21.5Z" 
            className={cn(
              variant === 'white' ? "fill-white" : "fill-current",
              "text-primary"
            )} 
          />
        </svg>
        <div className="flex flex-col ml-2">
          <span className={cn(
            "font-bold text-xl leading-none", 
            variant === 'white' ? "text-white" : textColor || "text-foreground"
          )}>
            Race Connect
          </span>
          <span className={cn(
            "text-[10px] tracking-widest uppercase font-medium",
            variant === 'white' ? "text-white/70" : "text-muted-foreground"
          )}>
            STI
          </span>
        </div>
      </div>
    </Link>
  );
} 