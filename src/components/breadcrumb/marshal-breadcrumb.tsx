"use client";

import React, { ReactElement, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Building2, Users, Calendar, Settings, User } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

// Breadcrumb item interface
interface BreadcrumbItemType {
  name: string;
  path: string;
  icon?: ReactElement | null;
}

// Path mapping for prettier names and icons
const pathMappings: Record<string, { name: string, icon: ReactElement }> = {
  'dashboard': { name: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  'organizations': { name: 'Organizations', icon: <Building2 className="h-4 w-4" /> },
  'users': { name: 'Users', icon: <Users className="h-4 w-4" /> },
  'events': { name: 'Events', icon: <Calendar className="h-4 w-4" /> },
  'settings': { name: 'Settings', icon: <Settings className="h-4 w-4" /> },
  'profile': { name: 'Profile', icon: <User className="h-4 w-4" /> },
};

// Generate breadcrumbs from pathname
function getDefaultBreadcrumb(): BreadcrumbItemType[] {
  return [{ name: 'Dashboard', path: '/dashboard', icon: pathMappings.dashboard.icon }];
}

// Generate breadcrumbs from pathname safely
function generateBreadcrumbsFromPath(path: string): BreadcrumbItemType[] {
  // Start with dashboard
  const breadcrumbs = getDefaultBreadcrumb();
  
  // If no path or just root, return dashboard
  if (!path || path === '/') {
    return breadcrumbs;
  }
  
  // Split the path into segments and remove empty strings
  const segments = path.split('/').filter(Boolean);
  
  // Build the path as we go
  let currentPath = '';
  
  // Add each segment to the breadcrumbs
  segments.forEach((segment) => {
    // Skip 'dashboard' as it's already included
    if (segment === 'dashboard') {
      return;
    }
    
    // Skip dynamic parameters like [id]
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return;
    }
    
    // Update the current path
    currentPath += `/${segment}`;
    
    // Get mapping or format the segment name
    const mapping = pathMappings[segment];
    const name = mapping?.name || 
                segment.charAt(0).toUpperCase() + 
                segment.slice(1).replace(/-/g, ' ');
    
    // Add to breadcrumbs
    breadcrumbs.push({
      name,
      path: currentPath,
      icon: mapping?.icon || null
    });
  });
  
  return breadcrumbs;
}

// MarshalBreadcrumb Component
export default function MarshalBreadcrumb() {
  // Get the current pathname
  const pathname = usePathname();
  
  // Store breadcrumbs in state to handle the null case
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>(getDefaultBreadcrumb());
  
  // Update breadcrumbs when pathname changes
  useEffect(() => {
    if (pathname) {
      setBreadcrumbs(generateBreadcrumbsFromPath(pathname));
    }
  }, [pathname]);
  
  // For mobile, show only the first and last items
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Update mobile state on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Display breadcrumbs based on mobile state
  const displayBreadcrumbs = !isMobile 
    ? breadcrumbs 
    : breadcrumbs.length > 1 
      ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]] 
      : breadcrumbs;
  
  return (
    <Breadcrumb className="text-sm">
      <BreadcrumbList className="text-muted-foreground">
        {displayBreadcrumbs.map((crumb, i) => {
          // Show ellipsis on mobile when skipping items
          const showEllipsis = isMobile && i === 1 && breadcrumbs.length > 2;
          
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <>
                  <BreadcrumbSeparator />
                  {showEllipsis && (
                    <>
                      <BreadcrumbItem>
                        <span className="text-xs text-muted-foreground">...</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </>
              )}
              <BreadcrumbItem>
                {i < displayBreadcrumbs.length - 1 || breadcrumbs.length === 1 ? (
                  <BreadcrumbLink 
                    href={crumb.path} 
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {crumb.icon && crumb.icon}
                    <span>{crumb.name}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                    {crumb.icon && crumb.icon}
                    <span className="truncate max-w-[150px] md:max-w-none">{crumb.name}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 