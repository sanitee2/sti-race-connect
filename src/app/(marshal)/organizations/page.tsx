"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

// Define organization type based on Prisma model
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
  members?: {
    id: string;
    user_id: string;
    membership_role: string;
    joined_at: string;
    user: {
      name: string;
      email: string;
      profile_picture: string | null;
    };
  }[];
}

// Organization card component
const OrganizationCard = ({ organization }: { organization: Organization }) => {
  const router = useRouter();
  
  // Calculate member count from members array if available
  const memberCount = organization.members?.length || 0;
  
  // Format date to show in a readable format
  const joinedDate = new Date(organization.created_at).toLocaleDateString();

  return (
    <Card 
      className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer" 
      onClick={(e) => {
        // Don't navigate if dropdown was clicked
        if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) return;
        router.push(`/organizations/${organization.id}`);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-md border">
              {organization.logo_url ? 
                <AvatarImage src={organization.logo_url} alt={organization.name} /> : 
                <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                  {organization.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              }
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-1 text-lg">
                {organization.name}
                {organization.is_verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary ml-1" />
                )}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {organization.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-dropdown-trigger>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <button className="flex w-full items-center" onClick={() => router.push(`/organizations/${organization.id}`)}>
                  View details
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {organization.is_verified ? (
                <DropdownMenuItem className="text-destructive">
                  <button className="flex w-full items-center" onClick={() => alert(`Revoke ${organization.name}`)}>
                    Revoke verification
                  </button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-primary">
                  <button className="flex w-full items-center" onClick={() => alert(`Verify ${organization.name}`)}>
                    Verify organization
                  </button>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="grid gap-2 text-sm">
          {organization.address && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{organization.address}</span>
            </div>
          )}
          {organization.website && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Website:</span>
              <a 
                href={organization.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline flex items-center"
              >
                {organization.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 text-xs text-muted-foreground">
        <div className="flex gap-2">
          <Badge variant="outline">{memberCount} members</Badge>
          {/* Events count is not available in the current API response */}
          <Badge variant="outline">0 events</Badge>
        </div>
        <div>Joined {joinedDate}</div>
      </CardFooter>
    </Card>
  );
};

// Loading skeleton for organization cards
const OrganizationCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pb-0">
      <div className="grid gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
    <CardFooter className="flex justify-between pt-4">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-5 w-32" />
    </CardFooter>
  </Card>
);

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const router = useRouter();
  
  // Fetch organizations from API
  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to fetch organizations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, []);
  
  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Split organizations by verification status
  const verifiedOrganizations = filteredOrganizations.filter(org => org.is_verified);
  const pendingOrganizations = filteredOrganizations.filter(org => !org.is_verified);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage racing organizations and team memberships
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => router.push('/organizations/create')}>
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Failed to load organizations</h3>
          <p className="text-muted-foreground mt-1">
            {error}. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Refresh
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({filteredOrganizations.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedOrganizations.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrganizations.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <OrganizationCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No organizations found</h3>
                <p className="text-muted-foreground mt-1">
                  We couldn't find any organizations matching your search.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="verified" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <OrganizationCardSkeleton key={i} />
                ))}
              </div>
            ) : verifiedOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No verified organizations</h3>
                <p className="text-muted-foreground mt-1">
                  There are no verified organizations matching your search.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <OrganizationCardSkeleton key={i} />
                ))}
              </div>
            ) : pendingOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending organizations</h3>
                <p className="text-muted-foreground mt-1">
                  There are no pending organizations matching your search.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 