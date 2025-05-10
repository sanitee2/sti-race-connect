"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Logo textColor="text-primary" />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/#features" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm">
            Features
          </Link>
          <Link href="/events" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm">
            Events
          </Link>
          <Link href="/#about" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm">
            About
          </Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm">
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="block md:hidden text-gray-700 focus:outline-none"
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
        <nav className="md:hidden bg-white border-t border-gray-100 py-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/#features" 
              className="text-gray-600 hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/events" 
              className="text-gray-600 hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/#about" 
              className="text-gray-600 hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/auth/login" 
              className="text-gray-600 hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}; 