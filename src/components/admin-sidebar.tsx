"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarCheck,
  Settings,
  ScrollText,
  UserCheck,
  AlertCircle
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and key metrics'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts and roles'
  },
  {
    name: 'Marshal Verification',
    href: '/admin/marshal-verification',
    icon: UserCheck,
    description: 'Review and verify marshal applications'
  },
  {
    name: 'Event Oversight',
    href: '/admin/events',
    icon: CalendarCheck,
    description: 'Monitor and manage events'
  },
  {
    name: 'System Rules',
    href: '/admin/rules',
    icon: ScrollText,
    description: 'Configure global system policies'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: AlertCircle,
    description: 'View system reports and analytics'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-semibold">Admin Panel</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-1 flex-col p-4">
          <ul role="list" className="flex flex-1 flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h5 className="font-medium">Admin Access</h5>
              <p className="text-xs text-muted-foreground">Full system control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 