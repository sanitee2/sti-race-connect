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
  // Get roles for the selected organization
  const roles = React.useMemo(() => {
    if (!organizationId) return [];
    return getOrganizationRoles(organizationId);
  }, [organizationId]);
  
  // Convert roles to combobox options
  const roleOptions = React.useMemo(() => {
    return roles.map(role => ({
      value: role.id,
      label: role.title + (role.is_leadership ? " (Leadership)" : "") + (role.is_default ? " (Default)" : "")
    }));
  }, [roles]);
  
  // If no organization is selected, or if there are no roles available
  if (!organizationId || roleOptions.length === 0) {
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
      placeholder="Select a role (optional)"
      emptyMessage="No roles found."
      className={className}
      disabled={disabled}
    />
  );
}

// Helper function to get role details by ID
export function getRoleById(organizationId: string, roleId: string) {
  const roles = getOrganizationRoles(organizationId);
  return roles.find(role => role.id === roleId);
} 