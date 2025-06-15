"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { MarshalSidebar } from '@/components/marshal-sidebar';
import { Logo } from '@/components/Logo';
import { UserProvider, useUser } from '@/contexts/user-context';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import MarshalBreadcrumb from '@/components/breadcrumb/marshal-breadcrumb';

// Component for user profile in header
function UserProfile() {
  const { user, isLoading, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Memoize user profile to prevent re-renders
  const userProfile = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      );
    }
    
    if (!user) {
      return null;
    }
    
    return (
      <button 
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <EnhancedAvatar
          src={user.profileImage}
          alt={user.name}
          fallback={user.name.charAt(0)}
          size="sm"
        />
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-medium leading-none">{user.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground hidden md:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>
    );
  }, [user, isLoading, dropdownOpen]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent visibility state changes from re-triggering loading states
  useEffect(() => {
    function handleVisibilityChange() {
      // Don't update any loading states when tab visibility changes
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  if (!user && !isLoading) return null;

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Successfully logged out', {
        description: 'Redirecting to login page...',
        duration: 2000
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
    } catch (error) {
      toast.error('Failed to log out', {
        description: 'Please try again'
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {userProfile}
        
        {/* Dropdown menu */}
        {dropdownOpen && user && (
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-5 duration-200">
            <div className="p-4 border-b border-border">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded inline-block capitalize">{user.role}</p>
            </div>
            <div className="py-1">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Your Profile
              </Link>
              <Link 
                href="/settings" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </div>
            <div className="py-1 border-t border-border">
              <button 
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Sign out from STI Race Connect?"
        description="You're about to sign out from your account. You'll need to sign in again to access your dashboard and event management tools."
        confirmText="Yes, sign me out"
        cancelText="No, stay signed in"
        onConfirm={handleLogout}
        variant="danger"
        confirmIcon={<LogOut className="h-4 w-4" />}
        isConfirmLoading={isLoggingOut}
      />
    </>
  );
}

// Inner layout component that uses the user context
function MarshalLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(240); // Default width
  const [isMobile, setIsMobile] = useState(false);
  
  // Track sidebar state and window size
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      // Adjust width based on sidebar state - get actual width from sidebar element
      const sidebarElement = document.querySelector('[data-sidebar]');
      if (sidebarElement) {
        setSidebarWidth(sidebarElement.clientWidth);
      }
    }
    
    // Initial check
    handleResize();
    
    // Setup observer for sidebar width changes
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width);
      }
    });
    
    const sidebarElement = document.querySelector('[data-sidebar]');
    if (sidebarElement) {
      observer.observe(sidebarElement);
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Prevent visibilitychange events from causing unnecessary re-renders
  useEffect(() => {
    function handleVisibilityChange() {
      // Empty handler to prevent default behavior
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar container - mark with data attribute for width detection */}
      <div data-sidebar className="h-screen fixed left-0 top-0 z-20">
        <MarshalSidebar />
      </div>
      
      {/* Main content - with dynamic sidebar width offset */}
      <div 
        className="flex-1 flex flex-col" 
        style={{ 
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          position: 'relative'
        }}
      >
        {/* Top navigation bar - fixed */}
        <header 
          className="h-16 border-b border-border flex items-center px-6 justify-between fixed bg-background z-10"
          style={{ 
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            right: 0
          }}
        >
          <div className="flex items-center gap-2 max-w-[60%]">
            <div className="md:hidden mr-2">
              <Logo />
            </div>
            <MarshalBreadcrumb />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle variant="outline" />
            <UserProfile />
          </div>
        </header>
        
        {/* Page content - scrollable with top padding for header */}
        <main className="flex-1 p-6 pt-[80px] overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

// Session check component to redirect unauthenticated users
function AuthCheck({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  useEffect(() => {
    if (status !== 'loading') {
      setInitialLoadDone(true);
    }
  }, [status]);

  // Prevent visibility change from triggering re-authentication
  useEffect(() => {
    const originalVisibilityState = document.visibilityState;
    
    function handleVisibilityChange() {
      // Don't refetch or change UI on tab switch
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  if (status === 'loading' && !initialLoadDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated' && initialLoadDone) {
    redirect('/auth/login');
    return null;
  }
  
  // Check for Marshal role only
  if (initialLoadDone && session?.user?.role !== 'Marshal') {
    redirect('/auth/unauthorized');
    return null;
  }
  
  return <>{children}</>;
}

// Main layout that provides the user context
export default function MarshalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck>
      <UserProvider>
        <MarshalLayoutInner>
          {children}
        </MarshalLayoutInner>
      </UserProvider>
    </AuthCheck>
  );
} 