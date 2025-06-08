"use client";

import React from 'react';
import { User, Calendar, Users, Settings, Home, Building2 } from 'lucide-react';
import { CollapsibleSidebar, NavItem } from '@/components/ui/collapsible-sidebar';

// Define the navigation items for the marshal role
const marshalNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5 flex-shrink-0" />,
  },
  {
    href: '/marshal-events',
    label: 'Events',
    icon: <Calendar className="h-5 w-5 flex-shrink-0" />,
  },
  {
    href: '/participants',
    label: 'Participants',
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
  },
  {
    href: '/organizations',
    label: 'Organizations',
    icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <User className="h-5 w-5 flex-shrink-0" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5 flex-shrink-0" />,
  },
];

export function MarshalSidebar() {
  return <CollapsibleSidebar navItems={marshalNavItems} showUserProfile={true} />;
} 