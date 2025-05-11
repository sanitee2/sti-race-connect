"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button 
      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent"
      onClick={() => {
        // Perform logout logic here
        window.location.href = '/auth/login';
      }}
    >
      <LogOut className="h-5 w-5 text-muted-foreground" />
      Sign Out
    </button>
  );
} 