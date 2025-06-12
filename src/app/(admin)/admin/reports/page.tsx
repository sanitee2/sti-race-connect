"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          View system reports and analytics
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">System Analytics</h2>
          <p>Reports and analytics functionality will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
} 