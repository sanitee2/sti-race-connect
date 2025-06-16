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
              <a 
                href="https://facebook.com/stiraceconnect" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors group" 
                aria-label="Follow us on Facebook"
                title="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <a 
                href="https://twitter.com/stiraceconnect" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors group" 
                aria-label="Follow us on Twitter"
                title="Follow us on Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              
              <a 
                href="https://instagram.com/stiraceconnect" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors group" 
                aria-label="Follow us on Instagram"
                title="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-2.297 0-4.163-1.852-4.163-4.163 0-2.297 1.866-4.163 4.163-4.163 2.297 0 4.163 1.866 4.163 4.163 0 2.311-1.866 4.163-4.163 4.163zm8.238-9.732h-1.297c-.269 0-.513-.269-.513-.513s.244-.513.513-.513h1.297c.269 0 .513.244.513.513s-.244.513-.513.513zm-4.67 9.732c-2.297 0-4.163-1.852-4.163-4.163 0-2.297 1.866-4.163 4.163-4.163s4.163 1.866 4.163 4.163c0 2.311-1.866 4.163-4.163 4.163z"/>
                  <path d="M12.017 7.346c-2.57 0-4.641 2.071-4.641 4.641s2.071 4.641 4.641 4.641 4.641-2.071 4.641-4.641-2.071-4.641-4.641-4.641zm0 7.68c-1.677 0-3.039-1.362-3.039-3.039s1.362-3.039 3.039-3.039 3.039 1.362 3.039 3.039-1.362 3.039-3.039 3.039z"/>
                </svg>
              </a>
              
              <a 
                href="https://linkedin.com/company/stiraceconnect" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 dark:bg-primary-foreground/15 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors group" 
                aria-label="Follow us on LinkedIn"
                title="Follow us on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-5">Platform</h4>
            <ul className="space-y-3">
              {[
                { name: 'Features', href: '/#features' },
                { name: 'Events', href: '/events' },
                { name: 'Rankings', href: '/rankings' }
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
            <h4 className="font-semibold text-lg mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' }
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
            <h4 className="font-semibold text-lg mb-5">Legal</h4>
            <ul className="space-y-3">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-primary-foreground/70 dark:text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                    {item.name}
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
              <Link href="/privacy" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Terms of Service</Link>
              <Link href="/contact" className="text-primary-foreground/50 dark:text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 