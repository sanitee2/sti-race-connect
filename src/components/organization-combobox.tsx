"use client"

import * as React from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Organization data type
type Organization = {
  id: string;
  name: string;
  description: string;
  address?: string | null;
  logo_url?: string | null;
  website?: string | null;
  phone_number?: string | null;
  email?: string | null;
  social_media?: Record<string, string> | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  members?: Array<any>;
  roles?: Array<{
    id: string;
    title: string;
    description?: string | null;
    is_leadership: boolean;
    is_default: boolean;
  }>;
}

interface OrganizationComboboxProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  isRegistrationMode?: boolean
}

export function OrganizationCombobox({
  value,
  onChange,
  className,
  disabled = false,
  isRegistrationMode = false,
}: OrganizationComboboxProps) {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch organizations from API
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      // Skip auth check if in registration mode
      if (!isRegistrationMode && status !== 'authenticated') {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/organizations', {
          credentials: isRegistrationMode ? 'omit' : 'include', // Skip credentials in registration mode
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          if (!isRegistrationMode) {
            toast.error('Authentication required', {
              description: 'Please sign in to view organizations'
            });
          }
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        if (!isRegistrationMode) {
          toast.error('Failed to load organizations', {
            description: err instanceof Error ? err.message : 'Please try again later'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [status, isRegistrationMode]);

  // Convert organizations to options format
  const organizationOptions = React.useMemo(
    () => organizations.map(org => ({
      value: org.id,
      label: org.name + (org.is_verified ? " ✓" : ""),
    })),
    [organizations]
  );

  return (
    <Combobox
      options={organizationOptions}
      value={value}
      onChange={onChange}
      placeholder={
        isLoading 
          ? "Loading organizations..." 
          : !isRegistrationMode && status !== 'authenticated'
          ? "Please sign in to view organizations"
          : "Select an organization (optional)"
      }
      emptyMessage={
        !isRegistrationMode && status !== 'authenticated'
          ? "Authentication required"
          : "No organizations found."
      }
      className={className}
      disabled={disabled || isLoading || (!isRegistrationMode && status !== 'authenticated')}
    />
  )
}

// Helper function to get organization details by ID
export function getOrganizationById(id: string) {
  // This is now an async function that fetches from the API
  // For backward compatibility, we'll return a promise that resolves
  // to the organization or undefined
  return fetch(`/api/organizations/${id}`)
    .then(res => res.ok ? res.json() : null)
    .catch(err => {
      console.error('Error fetching organization:', err);
      return null;
    });
}

// Helper function to get available roles for an organization
export async function getOrganizationRoles(orgId: string) {
  try {
    const org = await getOrganizationById(orgId);
    return org?.roles || [];
  } catch (error) {
    console.error('Error fetching organization roles:', error);
    return [];
  }
} 