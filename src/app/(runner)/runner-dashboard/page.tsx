"use client";

import React from 'react';
// Import the components and hooks you need for the runner dashboard
// This is the runner dashboard page at /runner-dashboard

export default function RunnerDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Runner Dashboard</h1>
      
      {/* Your runner dashboard content goes here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
          {/* Content for upcoming events */}
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">My Registrations</h2>
          {/* Content for registrations */}
        </div>
      </div>
    </div>
  );
} 