"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Building,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const organizations = [
  {
    id: 1,
    name: 'Sports Club A',
    type: 'Sports Club',
    status: 'active',
    members: 120,
    events: 15,
    location: 'New York',
    contact: {
      name: 'John Smith',
      email: 'john@sportscluba.com',
      phone: '+1 234-567-8900'
    },
    details: {
      description: 'Leading sports organization in the region',
      foundedYear: 2010,
      website: 'www.sportscluba.com',
      socialMedia: {
        facebook: 'sportscluba',
        twitter: '@sportscluba',
        instagram: '@sportscluba'
      }
    }
  },
  {
    id: 2,
    name: 'Triathlon Club B',
    type: 'Sports Club',
    status: 'active',
    members: 85,
    events: 8,
    location: 'Los Angeles',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@triathlonb.com',
      phone: '+1 234-567-8901'
    },
    details: {
      description: 'Premier triathlon training club',
      foundedYear: 2015,
      website: 'www.triathlonb.com',
      socialMedia: {
        facebook: 'triathlonb',
        twitter: '@triathlonb',
        instagram: '@triathlonb'
      }
    }
  },
  // Add more mock data as needed
];

export default function Organizations() {
  const [selectedOrg, setSelectedOrg] = useState<typeof organizations[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusUpdate = async (id: number, action: 'activate' | 'deactivate') => {
    try {
      // API call would go here
      toast.success(`Successfully ${action}d organization`, {
        description: `The organization has been ${action}d.`
      });
    } catch (error) {
      toast.error('Failed to update organization status', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // API call would go here
      toast.success('Organization deleted successfully', {
        description: 'The organization has been removed from the system.'
      });
    } catch (error) {
      toast.error('Failed to delete organization', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleViewDetails = (org: typeof organizations[0]) => {
    setSelectedOrg(org);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Manage organizations and their settings
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.type}</TableCell>
                <TableCell>{org.location}</TableCell>
                <TableCell>{org.members}</TableCell>
                <TableCell>{org.events}</TableCell>
                <TableCell>
                  <Badge
                    variant={org.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(org)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Add edit action */}}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(org.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
            <DialogDescription>
              View complete organization information
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedOrg.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Members: {selectedOrg.members}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Events: {selectedOrg.events}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location: {selectedOrg.location}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email: {selectedOrg.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Phone: {selectedOrg.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Contact: {selectedOrg.contact.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg.details.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Founded</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg.details.foundedYear}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Website</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg.details.website}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Social Media</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Facebook: {selectedOrg.details.socialMedia.facebook}</p>
                    <p>Twitter: {selectedOrg.details.socialMedia.twitter}</p>
                    <p>Instagram: {selectedOrg.details.socialMedia.instagram}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {/* Add edit action */}}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Organization
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedOrg.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Organization
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 