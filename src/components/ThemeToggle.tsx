"use client";

import { Moon, Sun, LaptopIcon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function ThemeToggle({ variant = "outline", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isWhiteText = className?.includes("text-white");

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full relative p-2 h-10 w-10",
        variant === "ghost" ? "hover:bg-primary-foreground/10 dark:hover:bg-primary-foreground/20" : "",
        variant === "outline" ? "bg-background dark:bg-card border-primary/20 dark:border-primary/30" : "",
        variant === "default" ? "bg-primary text-primary-foreground" : "",
        "shadow-sm hover:shadow", 
        className
      )}
      title={`Current theme: ${theme}`}
    >
      <Sun className={cn(
        "h-[1.2rem] w-[1.2rem] transition-all",
        theme === 'light' ? 'opacity-100' : 'opacity-0 scale-0',
        isWhiteText ? 'text-white' : 'text-primary'
      )} />
      <Moon className={cn(
        "h-[1.2rem] w-[1.2rem] absolute transition-all",
        theme === 'dark' ? 'opacity-100' : 'opacity-0 scale-0',
        isWhiteText ? 'text-white' : 'text-primary'
      )} />
      <LaptopIcon className={cn(
        "h-[1.2rem] w-[1.2rem] absolute transition-all",
        theme === 'system' ? 'opacity-100' : 'opacity-0 scale-0',
        isWhiteText ? 'text-white' : 'text-primary'
      )} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 