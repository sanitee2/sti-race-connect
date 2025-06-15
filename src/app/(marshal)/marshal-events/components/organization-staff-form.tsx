import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrganizationCombobox } from "@/components/organization-combobox";
import { StaffRole } from "@/app/(marshal)/marshal-events/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  name: string;
  email: string;
}

interface OrganizationStaffFormProps {
  organizationId?: string;
  eventStaff?: {
    user_id: string;
    name: string;
    email: string;
    role_in_event: StaffRole;
    responsibilities: string;
  }[];
  onOrganizationChange: (value: string | undefined) => void;
  onStaffChange: (staff: {
    user_id: string;
    name: string;
    email: string;
    role_in_event: StaffRole;
    responsibilities: string;
  }[]) => void;
}

export function OrganizationStaffForm({
  organizationId,
  eventStaff = [],
  onOrganizationChange,
  onStaffChange
}: OrganizationStaffFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [responsibilities, setResponsibilities] = useState("");

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 3) {
        setUsers([]);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleAddStaff = () => {
    if (!selectedUser || !selectedRole) return;

    const newStaff = {
      user_id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      role_in_event: selectedRole,
      responsibilities
    };

    onStaffChange([...eventStaff, newStaff]);
    setSelectedUser(null);
    setSelectedRole(null);
    setResponsibilities("");
    setSearchQuery("");
  };

  const handleRemoveStaff = (userId: string) => {
    onStaffChange(eventStaff.filter(staff => staff.user_id !== userId));
  };

  return (
    <div className="space-y-8">
      {/* Organization Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Organization (Optional)</Label>
            <span className="text-xs text-muted-foreground">You can add staff members regardless of organization selection</span>
          </div>
          <OrganizationCombobox
            value={organizationId || ""}
            onChange={onOrganizationChange}
          />
          <p className="text-xs text-muted-foreground">
            Select an organization if this event is associated with one. This is optional.
          </p>
        </div>
      </div>

      <Separator />

      {/* Staff Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Event Staff (Optional)</Label>
          <p className="text-xs text-muted-foreground">
            Add staff members who will be involved in organizing and running the event.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Staff</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedUser ? selectedUser.name : "Select staff..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users
                        .filter(user => !eventStaff.some(staff => staff.user_id === user.id))
                        .map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.name}
                            onSelect={() => setSelectedUser(user)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole || ""}
                onValueChange={(value: string) => setSelectedRole(value as StaffRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StaffRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsibilities</Label>
              <Input
                placeholder="Enter responsibilities"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddStaff}
            disabled={!selectedUser || !selectedRole}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Selected Staff</Label>
          <div className="space-y-2">
            {eventStaff.map((staff) => (
              <div key={staff.user_id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="space-y-1">
                  <p className="font-medium">{staff.name}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{staff.role_in_event.replace(/_/g, ' ')}</Badge>
                    {staff.responsibilities && (
                      <span className="text-sm text-muted-foreground">{staff.responsibilities}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStaff(staff.user_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {eventStaff.length === 0 && (
              <p className="text-sm text-muted-foreground">No staff members added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 