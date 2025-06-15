"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Redirect component for the old runner-dashboard route
// This redirects from /runner-dashboard to /runner/analytics

export default function RunnerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard page which serves as the main dashboard
    router.replace("/runner/dashboard");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
} 