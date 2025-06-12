"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

export default function SystemRulesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Rules</h1>
        <p className="text-sm text-muted-foreground">
          Configure and manage global system policies
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Global Policies</h2>
          <p>System rules and policies configuration will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
} 