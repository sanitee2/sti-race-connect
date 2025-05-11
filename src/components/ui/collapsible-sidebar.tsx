"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Calendar, Award, Users, Settings, Home, ChevronLeft, ChevronRight, Menu, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/providers/theme-provider';

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

export function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, isLoading, logout } = useUser();
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
        
        {/* User profile section */}
        {!isCollapsed && (
          <div className="px-4 mb-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-white/70">{user.role}</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
        
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
        
        <div className={cn("p-2 border-t border-white/10", isCollapsed && "flex justify-center")}>
          <button 
            className={cn(
              "text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors",
              isCollapsed ? "p-2 w-10 h-10 flex items-center justify-center" : "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium"
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
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