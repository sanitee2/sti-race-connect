"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Menu, X, ChevronRight, HomeIcon, UserIcon, CalendarIcon, TrophyIcon, LineChartIcon, Medal } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserNav } from '@/components/UserNav';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  
  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!session) {
      // Public navigation for non-authenticated users
      return [
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Features', href: '/#features', icon: null },
        { name: 'Events', href: '/events', icon: CalendarIcon },
        { name: 'About', href: '/#about', icon: null },
      ];
    }

    const role = session.user?.role;
    
    switch (role) {
      case 'Runner':
        return [
          { name: 'Home', href: '/', icon: HomeIcon },
          { name: 'Events', href: '/events', icon: CalendarIcon },
          { name: 'My Events', href: '/runner/my-events', icon: TrophyIcon },
          { name: 'Rankings', href: '/runner/ranking', icon: Medal },
          { name: 'Dashboard', href: '/runner/dashboard', icon: LineChartIcon },
        ];
      
      case 'Admin':
        return [
          { name: 'Home', href: '/', icon: HomeIcon },
          { name: 'Dashboard', href: '/admin/dashboard', icon: LineChartIcon },
          { name: 'Users', href: '/admin/users', icon: UserIcon },
          { name: 'Events', href: '/admin/events', icon: CalendarIcon },
        ];
      
      case 'Marshal':
        return [
          { name: 'Home', href: '/', icon: HomeIcon },
          { name: 'Dashboard', href: '/dashboard', icon: LineChartIcon },
          { name: 'Events', href: '/marshal-events', icon: CalendarIcon },
        ];
      
      default:
        return [
          { name: 'Home', href: '/', icon: HomeIcon },
          { name: 'Events', href: '/events', icon: CalendarIcon },
        ];
    }
  };

  // Helper function to render auth buttons for non-authenticated users
  const renderAuthButtons = () => (
    <>
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
    </>
  );

  // Helper function to render user navigation for authenticated users
  const renderUserNav = () => (
    <div className="flex items-center space-x-2">
      <UserNav />
    </div>
  );

  const navigationItems = getNavigationItems();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 dark:bg-primary/90 shadow-sm border-b border-primary/30 dark:border-primary/20">
      <div className="container mx-auto px-6 flex items-center justify-between py-3">
        <div className="flex-1 flex justify-start">
          <Logo variant="white" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex items-center space-x-10">
            {navigationItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`font-medium transition-colors text-sm py-1 ${
                  isActive(item.href) ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle 
              variant="ghost" 
              className="mr-2 bg-white/10 dark:bg-white/20 hover:bg-white/20 dark:hover:bg-white/30 text-white" 
            />
            {/* Conditional rendering based on authentication status */}
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-white/10 animate-pulse rounded-lg"></div>
            ) : session ? (
              renderUserNav()
            ) : (
              renderAuthButtons()
            )}
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
        <nav className="md:hidden bg-primary dark:bg-primary/95 border-t border-primary/30 dark:border-primary/20 py-3 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`font-medium py-2 flex items-center gap-2 ${
                  isActive(item.href) ? 'text-secondary' : 'text-primary-foreground hover:text-secondary/90'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Authentication Section */}
            {status === 'loading' ? (
              <div className="h-12 bg-white/10 animate-pulse rounded-lg"></div>
            ) : session ? (
              <div className="pt-2 border-t border-primary-foreground/20">
                <div className="flex items-center justify-between">
                  <div className="text-primary-foreground">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-primary-foreground/70">{session.user?.email}</p>
                  </div>
                  <UserNav />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}; 