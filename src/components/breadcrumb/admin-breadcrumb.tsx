"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const routeNameMap: Record<string, string> = {
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'users': 'User Management',
  'marshal-verification': 'Marshal Verification',
  'events': 'Event Oversight',
  'rules': 'System Rules',
  'reports': 'Reports',
  'settings': 'Settings',
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) || [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const displayName = routeNameMap[segment] || segment;

        return (
          <React.Fragment key={href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            <div className="flex items-center">
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
} 