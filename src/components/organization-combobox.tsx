"use client"

import * as React from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { toast } from "sonner";

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
}

export function OrganizationCombobox({
  value,
  onChange,
  className,
  disabled = false,
}: OrganizationComboboxProps) {
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch organizations from API
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/organizations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        toast.error('Failed to load organizations', {
          description: 'Please try again later'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, []);

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
      placeholder={isLoading ? "Loading organizations..." : "Select an organization (optional)"}
      emptyMessage="No organizations found."
      className={className}
      disabled={disabled || isLoading}
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