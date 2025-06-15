"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfile() {
  const handleSave = async () => {
    try {
      // API call would go here
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-8">
        {/* Profile Photo */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="size-24">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Profile Photo</h2>
                <p className="text-sm text-muted-foreground">
                  Update your profile picture
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload New Photo
                </Button>
                <Button variant="outline" className="text-destructive">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <Textarea
                    id="address"
                    placeholder="Enter your address"
                    className="min-h-[100px] pl-10 pt-2"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Admin Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Admin Information</h2>
              <p className="text-sm text-muted-foreground">
                Your administrative role details
              </p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="font-medium">System Administrator</p>
                  <p className="text-sm text-muted-foreground">
                    Full system access and control
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <p className="text-sm">User Management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <p className="text-sm">Event Management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <p className="text-sm">System Configuration</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <p className="text-sm">Data Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 