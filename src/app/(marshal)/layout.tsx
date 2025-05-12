"use client";

import React, { useState, useRef, useEffect, useMemo, ReactElement } from 'react';
import { User, LogOut, Settings, ChevronDown, Home } from 'lucide-react';
import { CollapsibleSidebar } from '@/components/ui/collapsible-sidebar';
import { Logo } from '@/components/Logo';
import { UserProvider, useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

// Breadcrumb item interface
interface BreadcrumbItemType {
  name: string;
  path: string;
  icon?: ReactElement | null;
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItemType[] {
  const paths = pathname.split('/').filter(Boolean);
  
  // Base structure - always start with dashboard
  const breadcrumbs: BreadcrumbItemType[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-4 w-4" />
    }
  ];
  
  // Add path segments
  let currentPath = '/dashboard';
  paths.forEach((segment, i) => {
    // Skip the first segment as it's dashboard
    if (i === 0 && (segment === 'dashboard' || segment === '')) {
      return;
    }
    
    currentPath += `/${segment}`;
    breadcrumbs.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: currentPath,
      icon: null
    });
  });
  
  return breadcrumbs;
}

// Breadcrumb Navigation Component
function BreadcrumbNav() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  // For mobile, only show the current page
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayBreadcrumbs = !isMobile 
    ? breadcrumbs 
    : breadcrumbs.length > 1 
      ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]] 
      : breadcrumbs;
  
  // Always show at least the dashboard breadcrumb
  return (
    <Breadcrumb className="text-sm">
      <BreadcrumbList className="text-muted-foreground">
        {displayBreadcrumbs.map((crumb, i) => {
          // For mobile, add ellipsis when skipping items
          const showEllipsis = isMobile && i === 1 && breadcrumbs.length > 2;
          
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <>
                  <BreadcrumbSeparator />
                  {showEllipsis && (
                    <>
                      <BreadcrumbItem>
                        <span className="text-xs text-muted-foreground">...</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </>
              )}
              <BreadcrumbItem>
                {i < displayBreadcrumbs.length - 1 || breadcrumbs.length === 1 ? (
                  <BreadcrumbLink 
                    href={crumb.path} 
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {crumb.icon && crumb.icon}
                    <span>{crumb.name}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                    {crumb.icon && crumb.icon}
                    <span className="truncate max-w-[150px] md:max-w-none">{crumb.name}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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
        <Avatar>
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
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
      {/* Sidebar */}
      <CollapsibleSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation bar */}
        <header className="h-16 border-b border-border flex items-center px-6 justify-between">
          <div className="flex items-center gap-2 max-w-[60%]">
            <div className="md:hidden mr-2">
              <Logo />
            </div>
            <BreadcrumbNav />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle variant="outline" />
            <UserProfile />
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
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
  
  // Optional: check for specific role
  if (initialLoadDone && session?.user?.role !== 'Marshal' && session?.user?.role !== 'Admin') {
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