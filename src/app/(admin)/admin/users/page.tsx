"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">User List</h2>
          <p>User management functionality will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
} 