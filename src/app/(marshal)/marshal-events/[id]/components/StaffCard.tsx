"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Event, StaffRole } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users } from "lucide-react";

interface StaffMember {
  user_id: string;
  role_in_event: StaffRole;
  responsibilities?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface StaffCardProps {
  event: Event;
}

export function StaffCard({ event }: StaffCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(event.event_staff || []);
  const [newStaffMember, setNewStaffMember] = useState<StaffMember>({
    user_id: "",
    role_in_event: StaffRole.OTHER,
    responsibilities: ""
  });
  const [availableUsers, setAvailableUsers] = useState<{id: string, name: string, email: string}[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch available users when entering edit mode
  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load available users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddStaffMember = () => {
    if (!newStaffMember.user_id) {
      toast.error("Please select a user");
      return;
    }

    // Find the user details from available users
    const selectedUser = availableUsers.find(user => user.id === newStaffMember.user_id);
    
    const staffMemberToAdd: StaffMember = {
      ...newStaffMember,
      user: {
        name: selectedUser?.name || "Unknown User",
        email: selectedUser?.email || ""
      }
    };

    setStaffMembers([...staffMembers, staffMemberToAdd]);
    setNewStaffMember({
      user_id: "",
      role_in_event: StaffRole.OTHER,
      responsibilities: ""
    });
  };

  const handleRemoveStaffMember = (index: number) => {
    const updatedStaffMembers = [...staffMembers];
    updatedStaffMembers.splice(index, 1);
    setStaffMembers(updatedStaffMembers);
  };

  const handleUpdateStaffMember = (index: number, field: keyof StaffMember, value: any) => {
    const updatedStaffMembers = [...staffMembers];
    updatedStaffMembers[index][field] = value;
    setStaffMembers(updatedStaffMembers);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_staff: staffMembers.map(staff => ({
            user_id: staff.user_id,
            role_in_event: staff.role_in_event,
            responsibilities: staff.responsibilities
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update staff members');
      }

      toast.success('Staff members updated successfully');
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating staff members:', error);
      toast.error('Failed to update staff members');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Staff</CardTitle>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => {
            setIsEditing(true);
            fetchAvailableUsers();
          }}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            {/* Existing staff members */}
            {staffMembers.length > 0 ? (
              <div className="space-y-4">
                {staffMembers.map((staff, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Edit Staff Member</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveStaffMember(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>User</Label>
                        <div className="text-sm p-2 border rounded-md bg-muted/50">
                          <div className="font-medium">{staff.user?.name}</div>
                          <div className="text-muted-foreground">{staff.user?.email}</div>
                        </div>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select 
                          value={staff.role_in_event} 
                          onValueChange={(value) => handleUpdateStaffMember(index, 'role_in_event', value as StaffRole)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={StaffRole.MARSHAL}>Marshal</SelectItem>
                            <SelectItem value={StaffRole.COORDINATOR}>Coordinator</SelectItem>
                            <SelectItem value={StaffRole.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Responsibilities</Label>
                        <Textarea 
                          value={staff.responsibilities || ''} 
                          onChange={e => handleUpdateStaffMember(index, 'responsibilities', e.target.value)}
                          placeholder="Describe this staff member's responsibilities..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No staff members yet. Add one below.</p>
            )}

            {/* Add new staff member */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="font-medium">Add New Staff Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <Select 
                    value={newStaffMember.user_id} 
                    onValueChange={(value) => setNewStaffMember({...newStaffMember, user_id: value})}
                    disabled={isLoadingUsers || availableUsers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableUsers.length === 0 && !isLoadingUsers && (
                    <p className="text-xs text-muted-foreground mt-1">No users available</p>
                  )}
                </div>
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={newStaffMember.role_in_event} 
                    onValueChange={(value) => setNewStaffMember({...newStaffMember, role_in_event: value as StaffRole})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StaffRole.MARSHAL}>Marshal</SelectItem>
                      <SelectItem value={StaffRole.COORDINATOR}>Coordinator</SelectItem>
                      <SelectItem value={StaffRole.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Responsibilities</Label>
                  <Textarea 
                    value={newStaffMember.responsibilities || ''} 
                    onChange={e => setNewStaffMember({...newStaffMember, responsibilities: e.target.value})}
                    placeholder="Describe this staff member's responsibilities..."
                    rows={2}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddStaffMember} 
                className="mt-2"
                disabled={isLoadingUsers || !newStaffMember.user_id}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Staff Member
              </Button>
            </div>
          </div>
        ) : (
          // Display mode
          staffMembers && staffMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.map((staff, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{staff.user?.name || "Staff Member"}</p>
                      <p className="text-sm text-muted-foreground">{staff.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{staff.role_in_event}</Badge>
                  </div>
                  {staff.responsibilities && (
                    <p className="text-sm text-muted-foreground">{staff.responsibilities}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No staff members assigned.</p>
          )
        )}
      </CardContent>
    </Card>
  );
} 