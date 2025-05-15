"use client";

import React from 'react';
import { User, Calendar, Trophy, Clock, Home, Medal } from 'lucide-react';
import { CollapsibleSidebar, NavItem } from '@/components/ui/collapsible-sidebar';

// Define the navigation items for the runner role
const runnerNavItems: NavItem[] = [
  {
    href: '/runner/dashboard',
    label: 'Dashboard',
    icon: <Home />,
  },
  {
    href: '/runner/events',
    label: 'Events',
    icon: <Calendar />,
  },
  {
    href: '/runner/my-races',
    label: 'My Races',
    icon: <Medal />,
  },
  {
    href: '/runner/results',
    label: 'Results',
    icon: <Trophy />,
  },
  {
    href: '/runner/profile',
    label: 'Profile',
    icon: <User />,
  },
];

export function RunnerSidebar() {
  return <CollapsibleSidebar navItems={runnerNavItems} showUserProfile={true} />;
} 