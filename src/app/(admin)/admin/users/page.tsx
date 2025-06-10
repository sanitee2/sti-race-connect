"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  Shield, 
  UserX, 
  RefreshCw,
  Download,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Role, Gender, TshirtSize } from '@prisma/client';

// Types based on your Prisma schema
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Runner' | 'Marshal' | 'Admin';
  profile_picture?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Types for the form
type NewUser = {
  name: string;
  email: string;
  password: string;
  role: Role | '';
  dateOfBirth: string;
  gender: Gender | '';
  address: string;
  // Runner specific fields
  tshirtSize: TshirtSize | '';
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  // Marshal specific fields
  organizationName: string;
  rolePosition: string;
  socialMediaLinks: string;
  responsibilities: string;
  // Profile picture - can be a File object, URL string, or array of URLs (we'll use the first one)
  profilePicture: File | string | string[] | null;
};

type FormErrors = {
  [K in keyof NewUser]?: string;
};

// Initial state for new user form
const defaultNewUser: NewUser = {
  name: '',
  email: '',
  password: '',
  role: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  // Runner specific fields
  tshirtSize: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  // Marshal specific fields
  organizationName: '',
  rolePosition: '',
  socialMediaLinks: '',
  responsibilities: '',
  // Profile picture
  profilePicture: null,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>(defaultNewUser);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        role: roleFilter,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users.map((user: any) => ({
        ...user,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      })));
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users', {
        description: error instanceof Error ? error.message : "An error occurred while fetching users"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkRoleUpdate = async (role: string) => {
    try {
      const response = await fetch('/api/users/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update users');
      }

      toast.success('Users updated successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error updating users:', error);
      toast.error('Failed to update users');
    }
  };

  const handleDeactivateUsers = async (userIds: string[]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate users');
      }

      toast.success('Users deactivated', {
        description: `Successfully deactivated ${data.count} user(s)`
      });

      // Refresh the user list
      fetchUsers();
      // Clear selection
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to deactivate users', {
        description: error instanceof Error ? error.message : "An error occurred while deactivating users"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Implementation for exporting user data
      // This could be a separate API endpoint that returns CSV/Excel
      toast.info('Coming soon', {
        description: "Export functionality will be available soon"
      });
    } catch (error) {
      toast.error('Export failed', {
        description: "Failed to export user data"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Marshal':
        return 'bg-blue-100 text-blue-800';
      case 'Runner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    
    // Basic validation
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newUser.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!newUser.password.trim()) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!newUser.role) {
      errors.role = 'Role is required';
    }

    // Common profile validation
    if (!newUser.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!newUser.gender) {
      errors.gender = 'Gender is required';
    }

    // Role-specific validation
    if (newUser.role === 'Runner') {
      if (!newUser.address) {
        errors.address = 'Address is required';
      }
      if (!newUser.tshirtSize) {
        errors.tshirtSize = 'T-shirt size is required';
      }
      if (!newUser.emergencyContactName) {
        errors.emergencyContactName = 'Emergency contact name is required';
      }
      if (!newUser.emergencyContactPhone) {
        errors.emergencyContactPhone = 'Emergency contact phone is required';
      }
      if (!newUser.emergencyContactRelationship) {
        errors.emergencyContactRelationship = 'Emergency contact relationship is required';
      }
    } else if (newUser.role === 'Marshal') {
      // Only responsibilities is required for Marshal
      if (!newUser.responsibilities) {
        errors.responsibilities = 'Responsibilities are required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const formData = new FormData();
    
    // Append basic user data
    formData.append('name', newUser.name);
    formData.append('email', newUser.email);
    formData.append('password', newUser.password);
    formData.append('role', newUser.role);
    formData.append('dateOfBirth', newUser.dateOfBirth);
    formData.append('gender', newUser.gender);
    formData.append('address', newUser.address);

    // Append role-specific data
    if (newUser.role === 'Runner') {
      formData.append('tshirtSize', newUser.tshirtSize);
      formData.append('emergencyContactName', newUser.emergencyContactName);
      formData.append('emergencyContactPhone', newUser.emergencyContactPhone);
      formData.append('emergencyContactRelationship', newUser.emergencyContactRelationship);
    } else if (newUser.role === 'Marshal') {
      formData.append('organizationName', newUser.organizationName);
      formData.append('rolePosition', newUser.rolePosition);
      formData.append('socialMediaLinks', newUser.socialMediaLinks);
      formData.append('responsibilities', newUser.responsibilities);
    }

    // Append profile picture if exists
    if (newUser.profilePicture) {
      if (newUser.profilePicture instanceof File) {
        formData.append('profilePicture', newUser.profilePicture);
      } else if (typeof newUser.profilePicture === 'string') {
        formData.append('profilePicture', newUser.profilePicture);
      } else if (Array.isArray(newUser.profilePicture) && newUser.profilePicture.length > 0) {
        formData.append('profilePicture', newUser.profilePicture[0]);
      }
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      toast.success('User created successfully');
      setIsAddUserDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setNewUser(defaultNewUser);
    setFormErrors({});
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. All fields are required unless marked optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter user's name"
                  className={formErrors.name ? "border-destructive" : ""}
                />
                {formErrors.name && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter user's email"
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter user's password"
                  className={formErrors.password ? "border-destructive" : ""}
                />
                {formErrors.password && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'Runner' | 'Marshal' | 'Admin') => 
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger className={formErrors.role ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Runner">Runner</SelectItem>
                    <SelectItem value="Marshal">Marshal</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.role}
                  </p>
                )}
              </div>
            </div>

            {/* Common Profile Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newUser.dateOfBirth}
                  onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                  className={formErrors.dateOfBirth ? "border-destructive" : ""}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.dateOfBirth}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newUser.gender}
                  onValueChange={(value: 'Male' | 'Female' | 'Other') => 
                    setNewUser({ ...newUser, gender: value })
                  }
                >
                  <SelectTrigger className={formErrors.gender ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.gender}
                  </p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="Enter address"
                  className={formErrors.address ? "border-destructive" : ""}
                />
                {formErrors.address && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Runner-specific fields */}
            {newUser.role === 'Runner' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Runner Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tshirtSize">T-Shirt Size</Label>
                    <Select
                      value={newUser.tshirtSize}
                      onValueChange={(value: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL') => 
                        setNewUser({ ...newUser, tshirtSize: value })
                      }
                    >
                      <SelectTrigger className={formErrors.tshirtSize ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select t-shirt size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.tshirtSize && (
                      <p className="text-destructive text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.tshirtSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={newUser.emergencyContactName}
                        onChange={(e) => setNewUser({ ...newUser, emergencyContactName: e.target.value })}
                        placeholder="Emergency contact name"
                        className={formErrors.emergencyContactName ? "border-destructive" : ""}
                      />
                      {formErrors.emergencyContactName && (
                        <p className="text-destructive text-sm flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.emergencyContactName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={newUser.emergencyContactPhone}
                        onChange={(e) => setNewUser({ ...newUser, emergencyContactPhone: e.target.value })}
                        placeholder="Emergency contact phone"
                        className={formErrors.emergencyContactPhone ? "border-destructive" : ""}
                      />
                      {formErrors.emergencyContactPhone && (
                        <p className="text-destructive text-sm flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.emergencyContactPhone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={newUser.emergencyContactRelationship}
                        onChange={(e) => setNewUser({ ...newUser, emergencyContactRelationship: e.target.value })}
                        placeholder="Relationship to emergency contact"
                        className={formErrors.emergencyContactRelationship ? "border-destructive" : ""}
                      />
                      {formErrors.emergencyContactRelationship && (
                        <p className="text-destructive text-sm flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.emergencyContactRelationship}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marshal-specific fields */}
            {newUser.role === 'Marshal' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Marshal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name (Optional)</Label>
                    <Input
                      id="organizationName"
                      value={newUser.organizationName}
                      onChange={(e) => setNewUser({ ...newUser, organizationName: e.target.value })}
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rolePosition">Role Position (Optional)</Label>
                    <Input
                      id="rolePosition"
                      value={newUser.rolePosition}
                      onChange={(e) => setNewUser({ ...newUser, rolePosition: e.target.value })}
                      placeholder="Enter role position"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialMediaLinks">Social Media Links (Optional)</Label>
                    <Input
                      id="socialMediaLinks"
                      value={newUser.socialMediaLinks}
                      onChange={(e) => setNewUser({ ...newUser, socialMediaLinks: e.target.value })}
                      placeholder="Enter social media links"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Input
                      id="responsibilities"
                      value={newUser.responsibilities}
                      onChange={(e) => setNewUser({ ...newUser, responsibilities: e.target.value })}
                      placeholder="Enter responsibilities"
                      className={formErrors.responsibilities ? "border-destructive" : ""}
                    />
                    {formErrors.responsibilities && (
                      <p className="text-destructive text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.responsibilities}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Profile Picture (Optional)</Label>
              <ImageUpload
                variant="profile"
                onChange={(value) => setNewUser({ ...newUser, profilePicture: Array.isArray(value) ? value[0] : value })}
                folder="profile-picture"
                useCloud={true}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddUserDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} user(s) selected
              </span>
              <Select onValueChange={(value) => handleBulkRoleUpdate(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Change role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Marshal">Marshal</SelectItem>
                  <SelectItem value="Runner">Runner</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeactivateUsers(selectedUsers)}
              >
                Deactivate Selected
              </Button>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Marshal">Marshal</SelectItem>
                  <SelectItem value="Runner">Runner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchUsers}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <EnhancedAvatar
                            src={user.profile_picture || undefined}
                            fallback={user.name.charAt(0)}
                            alt={`${user.name}'s profile picture`}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(user.created_at, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(user.updated_at, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkRoleUpdate('Admin')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkRoleUpdate('Marshal')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Marshal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkRoleUpdate('Runner')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Runner
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeactivateUsers([user.id])}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {users.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    size="default"
                  />
                </PaginationItem>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      isActive={pagination.page === page}
                      size="default"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    size="default"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </div>
  );
} 