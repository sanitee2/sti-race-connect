"use client";

import React from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/contexts/user-context';

// Session check component for runners
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
  
  // Check for runner role
  if (session?.user?.role !== 'Runner') {
    redirect('/auth/unauthorized');
    return null;
  }
  
  return <>{children}</>;
}

// Layout for runner pages with distinct dashboard path
export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck>
      <UserProvider>
        <div className="min-h-screen bg-background">
          {/* You'll add a runner-specific navbar/sidebar here */}
          <main className="container mx-auto py-4">
            {children}
          </main>
          
          {/* Toast notifications */}
          <Toaster position="top-right" />
        </div>
      </UserProvider>
    </AuthCheck>
  );
} 