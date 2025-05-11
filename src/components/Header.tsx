"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Menu, X, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo textColor="text-primary" />
          <Activity className="h-5 w-5 text-secondary animate-pulse hidden sm:block" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#features" className="text-foreground hover:text-primary font-medium transition-colors text-sm hover:underline underline-offset-4 decoration-secondary decoration-2">
            Features
          </Link>
          <Link href="/events" className="text-foreground hover:text-primary font-medium transition-colors text-sm hover:underline underline-offset-4 decoration-secondary decoration-2">
            Events
          </Link>
          <Link href="/#about" className="text-foreground hover:text-primary font-medium transition-colors text-sm hover:underline underline-offset-4 decoration-secondary decoration-2">
            About
          </Link>
          <Link href="/auth/login" className="text-foreground hover:text-primary font-medium transition-colors text-sm hover:underline underline-offset-4 decoration-secondary decoration-2">
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg active:translate-y-0.5 hover-scale flex items-center gap-1"
          >
            Get Started
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="block md:hidden text-foreground focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-card border-t border-border py-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/#features" 
              className="text-foreground hover:text-primary font-medium py-2 hover:underline underline-offset-4 decoration-secondary decoration-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/events" 
              className="text-foreground hover:text-primary font-medium py-2 hover:underline underline-offset-4 decoration-secondary decoration-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/#about" 
              className="text-foreground hover:text-primary font-medium py-2 hover:underline underline-offset-4 decoration-secondary decoration-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/auth/login" 
              className="text-foreground hover:text-primary font-medium py-2 hover:underline underline-offset-4 decoration-secondary decoration-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-secondary text-secondary-foreground px-5 py-3 rounded-lg font-medium text-center shadow-md hover:bg-secondary/90 flex items-center justify-center gap-2 hover-scale"
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