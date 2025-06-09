"use client";

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mail, Phone, MapPin, Calendar, Shield, User2, Building2, Clock, Medal, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";

export default function MarshalProfile() {
  const { user, updateUser, isLoading: isUserLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        throw new Error("User ID not found");
      }

      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.profileImage,
      };

      await updateUser(updatedUser);
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Skeleton className="size-32 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <EnhancedAvatar
                src={formData.profileImage}
                alt={formData.name}
                fallback={formData.name.charAt(0)}
                size="xl"
                className="size-32"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageUpload
                    variant="profile"
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        profileImage: value as string
                      }));
                    }}
                    images={formData.profileImage ? [formData.profileImage] : []}
                    useCloud={true}
                    folder="profile-picture"
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              <Badge variant="secondary" className="mt-2 capitalize">
                {user?.role || "Marshal"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Details */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details and contact information</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to current user data
                    if (user) {
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        profileImage: user.profileImage || "",
                      });
                    }
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 