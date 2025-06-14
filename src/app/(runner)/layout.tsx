"use client";

import React from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/contexts/user-context';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
    window.location.href = '/auth/login';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // Check for runner role
  if (session?.user?.role !== 'Runner') {
    window.location.href = '/auth/unauthorized';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Unauthorized access...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Layout for runner pages with Header and Footer
export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck>
      <UserProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </UserProvider>
    </AuthCheck>
  );
} 