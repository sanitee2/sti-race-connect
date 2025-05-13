"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Calendar, Award, Users, Settings, Home, ChevronLeft, ChevronRight, Menu, LogOut, ChevronDown, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/providers/theme-provider';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// SVG Logo extracted from Logo component
const LogoIcon = ({ variant = 'default' }: { variant?: 'default' | 'white' }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" 
      className={cn(
        variant === 'white' ? "fill-white/15" : "fill-current opacity-15",
        "text-primary"
      )} 
    />
    <path 
      d="M21 12C21 14.2091 19.2091 16 17 16C14.7909 16 13 14.2091 13 12C13 9.79086 14.7909 8 17 8C19.2091 8 21 9.79086 21 12Z" 
      className={cn(
        variant === 'white' ? "fill-white" : "fill-current",
        "text-primary"
      )} 
    />
    <path 
      d="M25 20.5C25 22.9853 22.5376 25 19.5 25C16.4624 25 14 22.9853 14 20.5C14 18.0147 16.4624 16 19.5 16C22.5376 16 25 18.0147 25 20.5Z" 
      className={cn(
        variant === 'white' ? "fill-white" : "fill-current",
        "text-primary"
      )} 
    />
    <path 
      d="M13 21.5C13 23.9853 10.5376 26 7.5 26C4.46243 26 2 23.9853 2 21.5C2 19.0147 4.46243 17 7.5 17C10.5376 17 13 19.0147 13 21.5Z" 
      className={cn(
        variant === 'white' ? "fill-white" : "fill-current",
        "text-primary"
      )} 
    />
  </svg>
);

interface NavLinkProps {
  href: string;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, label, isCollapsed, isActive, children }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 p-3 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-white/20 text-white" 
          : "text-white/80 hover:bg-white/10 hover:text-white",
        isCollapsed && "justify-center"
      )}
    >
      {children}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

// User profile component with dropdown
function UserProfileDropdown({ isCollapsed }: { isCollapsed: boolean }) {
  const { user, isLoading, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
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
  
  if (isLoading) {
    return (
      <div className={cn("flex justify-center p-2", !isCollapsed && "px-4")}>
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }
  
  if (!user) return null;
  
  // Shared dropdown content
  const dropdownContent = (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded inline-block capitalize w-fit">{user.role}</p>
        </div>
      </div>
      <div className="py-1">
        <Link 
          href="/profile" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={() => setDropdownOpen(false)}
        >
          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          Your Profile
        </Link>
        <Link 
          href="/settings" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={() => setDropdownOpen(false)}
        >
          <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          Settings
        </Link>
      </div>
      <div className="py-1 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
  
  if (isCollapsed) {
    return (
      <>
        <div className="relative px-2" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex justify-center items-center p-2 w-full hover:bg-white/10 rounded-md transition-colors"
          >
            <Avatar>
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="bg-white/10 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
          
          {/* Dropdown for collapsed state */}
          {dropdownOpen && (
            <div className="absolute bottom-full left-full ml-2 mb-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in-50 slide-in-from-left-5 duration-200">
              {dropdownContent}
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
  
  return (
    <>
      <div className="relative px-2" ref={dropdownRef}>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center w-full gap-3 p-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <Avatar>
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-white/10 text-white">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <div className="font-medium text-white text-sm">{user.name}</div>
            <div className="text-xs text-white/70 capitalize">{user.role}</div>
          </div>
          <ChevronDown className={`h-4 w-4 text-white/70 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown for expanded state - positioned above */}
        {dropdownOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in-50 slide-in-from-bottom-5 duration-200">
            {dropdownContent}
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

export function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // Handle screen resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  // Check if path is active - handling the route group structure
  const isActiveRoute = (route: string) => {
    return pathname.endsWith(route);
  };
  
  // Style for icons
  const getIconStyle = (isActive: boolean) => cn(
    "h-5 w-5", 
    isActive ? "text-white" : "text-white/70"
  );
  
  if (isMobile && !isSidebarOpen) {
    return (
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-primary shadow-md hover:bg-primary/90 text-white"
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }
  
  return (
    <div className="relative">
      <div className={cn(
        "bg-gradient-to-br from-primary to-primary/90 border-r border-primary/20 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isMobile ? "fixed top-0 left-0 z-10 h-full shadow-xl" : "h-screen",
        isMobile && !isSidebarOpen && "hidden"
      )}>
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed ? (
            <Logo variant="white" />
          ) : (
            <div className="flex justify-center w-full">
              <LogoIcon variant="white" />
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavLink 
            href="/dashboard" 
            label="Dashboard" 
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/dashboard')} 
          >
            <Home className={getIconStyle(isActiveRoute('/dashboard'))} />
          </NavLink>
          
          <NavLink 
            href="/marshal-events" 
            label="Events" 
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/marshal-events')} 
          >
            <Calendar className={getIconStyle(isActiveRoute('/marshal-events'))} />
          </NavLink>
          
          <NavLink 
            href="/participants" 
            label="Participants" 
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/participants')} 
          >
            <Users className={getIconStyle(isActiveRoute('/participants'))} />
          </NavLink>
          
          <NavLink 
            href="/profile" 
            label="Profile" 
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/profile')} 
          >
            <User className={getIconStyle(isActiveRoute('/profile'))} />
          </NavLink>
          
          <NavLink 
            href="/settings" 
            label="Settings" 
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/settings')} 
          >
            <Settings className={getIconStyle(isActiveRoute('/settings'))} />
          </NavLink>
        </nav>
        
        {/* User profile section with dropdown */}
        <div className={cn("mt-auto pt-3 pb-3")}>
          <UserProfileDropdown isCollapsed={isCollapsed} />
        </div>
        
        {/* Collapse control */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="absolute top-4 -right-3 bg-white text-primary hover:bg-primary-foreground p-0.5 rounded-full shadow-md transition-transform hover:scale-110"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
} 