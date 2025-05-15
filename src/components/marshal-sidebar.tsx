"use client";

import React from 'react';
import { User, Calendar, Users, Settings, Home, Building2 } from 'lucide-react';
import { CollapsibleSidebar, NavItem } from '@/components/ui/collapsible-sidebar';

// Define the navigation items for the marshal role
const marshalNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <Home />,
  },
  {
    href: '/marshal-events',
    label: 'Events',
    icon: <Calendar />,
  },
  {
    href: '/participants',
    label: 'Participants',
    icon: <Users />,
  },
  {
    href: '/organizations',
    label: 'Organizations',
    icon: <Building2 />,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <User />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings />,
  },
];

export function MarshalSidebar() {
  return <CollapsibleSidebar navItems={marshalNavItems} showUserProfile={true} />;
} 