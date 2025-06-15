"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="bg-primary dark:bg-primary/95 text-primary-foreground pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-6 gap-10">
          <div className="md:col-span-2">
            <Logo variant="white" className="mb-6" />
            <p className="text-primary-foreground/70 dark:text-primary-foreground/80 mb-6 max-w-sm">
              STI Race Connect is the complete solution for running event management, bringing together organizers, marshals, and participants in one seamless platform.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 hover:bg-secondary flex items-center justify-center transition-colors" 
                  aria-label={social}
                >
                  <span className="text-xs uppercase text-primary-foreground">{social.slice(0,2)}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-5">Platform</h4>
            <ul className="space-y-3">
              {[
                { name: 'Features', href: '/#features' },
                { name: 'Events', href: '/events' },
                { name: 'Pricing', href: '#' },
                { name: 'Enterprise', href: '#' }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-primary-foreground/70 dark:text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-5">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'Knowledge Base', 'Blog', 'API Reference'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-primary-foreground/70 dark:text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-5">Company</h4>
            <ul className="space-y-3">
              {['About', 'Careers', 'Contact', 'Partner Program'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-primary-foreground/70 dark:text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-5">Legal</h4>
            <ul className="space-y-3">
              {['Privacy', 'Terms', 'Cookies', 'Licenses'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-primary-foreground/70 dark:text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 dark:border-primary-foreground/15 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/50 dark:text-primary-foreground/60 text-sm">&copy; 2024 STI Race Connect. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link href="#" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 