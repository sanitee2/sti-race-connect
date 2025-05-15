"use client"

import * as React from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { getOrganizationById, getOrganizationRoles } from "./organization-combobox"

interface OrganizationRoleComboboxProps {
  organizationId: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function OrganizationRoleCombobox({
  organizationId,
  value,
  onChange,
  className,
  disabled = false,
}: OrganizationRoleComboboxProps) {
  // State to store roles
  const [roles, setRoles] = React.useState<Array<{
    id: string;
    title: string;
    description?: string | null;
    is_leadership: boolean;
    is_default: boolean;
  }>>([]);
  const [loading, setLoading] = React.useState(false);
  
  // Fetch roles when organizationId changes
  React.useEffect(() => {
    let isMounted = true;
    
    async function fetchRoles() {
      if (!organizationId) return;
      
      setLoading(true);
      try {
        const fetchedRoles = await getOrganizationRoles(organizationId);
        if (isMounted) {
          setRoles(fetchedRoles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchRoles();
    
    return () => {
      isMounted = false;
    };
  }, [organizationId]);
  
  // Convert roles to combobox options
  const roleOptions = React.useMemo(() => {
    return roles.map(role => ({
      value: role.id,
      label: role.title + (role.is_leadership ? " (Leadership)" : "") + (role.is_default ? " (Default)" : "")
    }));
  }, [roles]);
  
  // If no organization is selected, or if there are no roles available and not loading
  if (!organizationId || (!loading && roleOptions.length === 0)) {
    return (
      <Combobox
        options={[]}
        value=""
        onChange={() => {}}
        placeholder={!organizationId 
          ? "Select an organization first" 
          : "No roles available for this organization"}
        emptyMessage="No roles found."
        className={className}
        disabled={true}
      />
    );
  }
  
  return (
    <Combobox
      options={roleOptions}
      value={value}
      onChange={onChange}
      placeholder={loading ? "Loading roles..." : "Select a role (optional)"}
      emptyMessage="No roles found."
      className={className}
      disabled={disabled || loading}
    />
  );
}

// Helper function to get role details by ID
export async function getRoleById(organizationId: string, roleId: string) {
  const roles = await getOrganizationRoles(organizationId);
  return roles.find((role: { id: string }) => role.id === roleId);
} 