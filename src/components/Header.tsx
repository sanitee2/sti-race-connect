"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/providers/theme-provider';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 dark:bg-primary/90 shadow-sm border-b border-primary/30 dark:border-primary/20">
      <div className="container mx-auto px-6 flex items-center justify-between py-4">
        <div className="flex-1 flex justify-start">
          <Logo variant="white" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex items-center space-x-10">
            <Link 
              href="/" 
              className={`font-medium transition-colors text-sm py-1 ${isActive('/') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
            >
              Home
            </Link>
            
            <Link 
              href="/#features" 
              className={`font-medium transition-colors text-sm py-1 ${pathname.includes('#features') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
            >
              Features
            </Link>
            
            <Link 
              href="/events" 
              className={`font-medium transition-colors text-sm py-1 ${isActive('/events') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
            >
              Events
            </Link>
            
            <Link 
              href="/#about" 
              className={`font-medium transition-colors text-sm py-1 ${pathname.includes('#about') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
            >
              About
            </Link>
          </nav>
        </div>
        
        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle 
              variant="ghost" 
              className="mr-2 bg-white/10 dark:bg-white/20 hover:bg-white/20 dark:hover:bg-white/30 text-white" 
            />
            <Link
              href="/auth/login" 
              className="border border-primary-foreground/20 hover:border-primary-foreground/50 text-primary-foreground hover:text-primary-foreground/90 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth/register" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg active:translate-y-0.5 hover-scale flex items-center gap-1"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle 
              variant="ghost" 
              className="mr-2 bg-white/10 dark:bg-white/20 hover:bg-white/20 dark:hover:bg-white/30 text-white" 
            />
            <button 
              className="text-primary-foreground focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-primary dark:bg-primary/95 border-t border-primary/30 dark:border-primary/20 py-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`font-medium py-2 ${isActive('/') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#features" 
              className={`font-medium py-2 ${pathname.includes('#features') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/events" 
              className={`font-medium py-2 ${isActive('/events') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/#about" 
              className={`font-medium py-2 ${pathname.includes('#about') ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/auth/login" 
              className="border border-primary-foreground/20 hover:border-primary-foreground/50 text-primary-foreground hover:text-primary-foreground/90 px-5 py-3 rounded-lg font-medium text-center transition-colors flex items-center justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-3 rounded-lg font-medium text-center shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover-scale"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}; 