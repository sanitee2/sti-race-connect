"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Cloud, HardDrive, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ImageUploadTestPage() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [useCloud, setUseCloud] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  // Check Digital Ocean Spaces connection on page load
  useEffect(() => {
    async function checkSpacesConnection() {
      try {
        setConnectionStatus('checking');
        const response = await fetch('/api/upload/test');
        const data = await response.json();
        
        if (data.status === 'success') {
          setConnectionStatus('connected');
          setConnectionDetails(data);
        } else {
          setConnectionStatus('error');
          setConnectionDetails(data);
          if (useCloud) {
            toast.error("Digital Ocean Spaces connection failed. Switching to local storage.");
            setUseCloud(false);
          }
        }
      } catch (error) {
        console.error("Error checking Digital Ocean Spaces connection:", error);
        setConnectionStatus('error');
        if (useCloud) {
          toast.error("Digital Ocean Spaces connection failed. Switching to local storage.");
          setUseCloud(false);
        }
      }
    }
    
    checkSpacesConnection();
  }, []);

  const handleProfileChange = (value: string) => {
    setProfileImage(value);
  };

  const handleGalleryChange = (value: string[]) => {
    setGalleryImages(value);
  };

  const toggleCloudUpload = () => {
    if (connectionStatus === 'error' && !useCloud) {
      toast.error("Cannot enable cloud storage: Digital Ocean Spaces connection failed");
      return;
    }
    setUseCloud(!useCloud);
    // Clear existing images when switching mode
    setProfileImage("");
    setGalleryImages([]);
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 mb-4 p-0 h-auto"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Image Upload Component Test</h1>
            <p className="text-muted-foreground">
              This page demonstrates the image upload component in different variants
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">DO Spaces:</span>
            {connectionStatus === 'checking' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking
              </Badge>
            )}
            {connectionStatus === 'connected' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'error' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Connection Failed
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Settings</CardTitle>
          <CardDescription>
            Choose whether to upload images to Digital Ocean Spaces or store them locally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="cloud-mode" 
                checked={useCloud}
                onCheckedChange={toggleCloudUpload}
                disabled={connectionStatus === 'error'}
              />
              <Label htmlFor="cloud-mode" className={`cursor-pointer ${connectionStatus === 'error' ? 'opacity-50' : ''}`}>
                {useCloud ? (
                  <span className="flex items-center gap-1.5">
                    <Cloud className="h-4 w-4" />
                    Cloud Storage
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="h-4 w-4" />
                    Local Storage (Base64)
                  </span>
                )}
              </Label>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {useCloud 
                ? "Images will be uploaded to Digital Ocean Spaces"
                : connectionStatus === 'error'
                  ? "Local storage mode (Digital Ocean Spaces connection failed)"
                  : "Images will be stored as base64 data URLs (for testing only)"}
            </p>
          </div>
          
          {connectionStatus === 'connected' && connectionDetails && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Connection Details:</p>
              <div className="text-xs text-muted-foreground">
                <p>Available Buckets: {connectionDetails.buckets.join(', ')}</p>
                <p>API Key: {connectionDetails.credentials?.keyProvided ? 'Provided ✓' : 'Missing ✗'}</p>
                <p>Secret Key: {connectionDetails.credentials?.secretProvided ? 'Provided ✓' : 'Missing ✗'}</p>
              </div>
            </div>
          )}
          
          {connectionStatus === 'error' && connectionDetails && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-destructive mb-2">Connection Error:</p>
              <div className="text-xs text-muted-foreground">
                <p>Error: {connectionDetails.error}</p>
                <p>API Key: {connectionDetails.credentials?.keyProvided ? 'Provided ✓' : 'Missing ✗'}</p>
                <p>Secret Key: {connectionDetails.credentials?.secretProvided ? 'Provided ✓' : 'Missing ✗'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile picture upload */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture Upload</CardTitle>
            <CardDescription>Upload a single profile image</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ImageUpload 
              variant="profile"
              onChange={(value) => handleProfileChange(value as string)} 
              useCloud={useCloud}
              folder="profile-picture"
            />
            
            {profileImage && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-2">Output Value:</h3>
                <div className="bg-muted p-2 rounded-md">
                  <code className="text-xs break-all">
                    {profileImage.substring(0, 100)}...
                  </code>
                </div>
                
                {!profileImage.startsWith("data:") && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Public URL:</p>
                    <a 
                      href={profileImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View uploaded image
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery images upload */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Upload</CardTitle>
            <CardDescription>Upload multiple images for a gallery</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ImageUpload 
              variant="gallery"
              onChange={(value) => handleGalleryChange(value as string[])} 
              maxImages={4}
              useCloud={useCloud}
              folder="image-gallery"
            />
            
            {galleryImages.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-2">Output Values ({galleryImages.length}):</h3>
                <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
                  <code className="text-xs break-all">
                    {galleryImages.map((url, i) => (
                      <div key={i} className="mb-2">
                        {i + 1}: {url.substring(0, 50)}...
                      </div>
                    ))}
                  </code>
                </div>
                
                {!galleryImages[0].startsWith("data:") && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Public URLs:</p>
                    <div className="flex flex-col gap-1">
                      {galleryImages.map((url, i) => (
                        <a 
                          key={i}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Image {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 