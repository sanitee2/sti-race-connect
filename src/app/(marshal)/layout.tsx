"use client";

import React from 'react';
import { User } from 'lucide-react';
import { CollapsibleSidebar } from '@/components/ui/collapsible-sidebar';
import { Logo } from '@/components/Logo';
import { UserProvider, useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

// Component for user profile in header
function UserProfile() {
  const { user, isLoading } = useUser();
  
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
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user.profileImage} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{user.name}</span>
    </div>
  );
}

// Inner layout component that uses the user context
function MarshalLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CollapsibleSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation bar */}
        <header className="h-16 border-b border-border flex items-center px-6 justify-between">
          <div className="md:hidden">
            <Logo />
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
    </div>
  );
}

// Session check component to redirect unauthenticated users
function AuthCheck({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    redirect('/auth/login');
    return null;
  }
  
  // Optional: check for specific role
  if (session?.user?.role !== 'Marshal' && session?.user?.role !== 'Admin') {
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