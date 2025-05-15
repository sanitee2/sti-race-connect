"use client";

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { 
  Building2, 
  ChevronLeft, 
  Users, 
  Calendar, 
  Mail, 
  Globe, 
  MapPin,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from 'date-fns';
import { toast } from "sonner";

// Organization type based on API response
interface Organization {
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
  creator: {
    id: string;
    name: string;
    email: string;
    profile_picture: string | null;
  };
  members: {
    id: string;
    user_id: string;
    membership_role: string;
    joined_at: string;
    user: {
      id: string;
      name: string;
      email: string;
      profile_picture: string | null;
    };
    role_assignments?: {
      id: string;
      role: {
        id: string;
        title: string;
        description: string | null;
        is_leadership: boolean;
      };
    }[];
  }[];
  roles: {
    id: string;
    title: string;
    description: string | null;
    is_leadership: boolean;
    is_default: boolean;
  }[];
  events: any[]; // This will be populated once events are implemented
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Properly unwrap params using React.use() with correct typing
  const unwrappedParams = React.use(params as any) as { id: string };
  const organizationId = unwrappedParams.id;
  
  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/organizations/${organizationId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch organization');
        }
        
        const data = await response.json();
        setOrganization(data);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to fetch organization details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">Loading organization details...</h3>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Failed to load organization</h3>
        <p className="text-muted-foreground mt-1 mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // If organization not found or data not loaded yet
  if (!organization) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div>
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 mb-4 p-0 h-auto"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Organizations</span>
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-md border">
              {organization.logo_url ? 
                <AvatarImage src={organization.logo_url} alt={organization.name} /> : 
                <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                  {organization.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              }
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
                {organization.is_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Pending
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{organization.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!organization.is_verified && (
              <Button className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Verify
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({organization.members.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({organization.events.length})</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Basic information about the organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {organization.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{organization.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {organization.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href={`mailto:${organization.email}`} className="text-sm text-primary hover:underline">
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.phone_number && (
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <a href={`tel:${organization.phone_number}`} className="text-sm text-primary hover:underline">
                          {organization.phone_number}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a 
                          href={organization.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {organization.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Organization activity and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold">{organization.members.length}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="text-2xl font-bold">{organization.events.length}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm font-medium">Organization History</p>
                  <Separator className="my-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{format(new Date(organization.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By</span>
                      <span>{organization.creator.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verification</span>
                      <span>{organization.is_verified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Members Tab */}
        <TabsContent value="members" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Organization Members</h2>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
          
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organization.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {member.user.profile_picture ? 
                            <AvatarImage src={member.user.profile_picture} alt={member.user.name} /> : 
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user.name.charAt(0)}
                            </AvatarFallback>
                          }
                        </Avatar>
                        <span>{member.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        member.membership_role === "Owner" ? "default" : 
                        member.membership_role === "Admin" ? "outline" : 
                        "secondary"
                      }>
                        {member.membership_role}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(member.joined_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Organization Events</h2>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
          
          {organization.events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {organization.events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => alert(`View event ${event.id}`)}>
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-md">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} · {event.participants} participants
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                This organization hasn't created any events yet.
              </p>
              <Button>Create First Event</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 