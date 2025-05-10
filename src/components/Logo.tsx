import Link from 'next/link';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  textColor?: string;
}

export function Logo({ className = "", textColor = "" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="bg-accent w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
        <Activity className="h-6 w-6 text-accent-foreground" />
      </div>
      <span className={cn("font-bold text-xl", textColor)}>Race Connect</span>
    </Link>
  );
} 