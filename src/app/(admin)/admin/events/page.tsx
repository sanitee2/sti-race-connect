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
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Clock,
  Flag,
  Building,
  Medal,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const events = [
  {
    id: 1,
    name: 'City Marathon 2024',
    type: 'Marathon',
    status: 'upcoming',
    date: '2024-06-15',
    location: 'New York',
    participants: 500,
    organization: 'Sports Club A',
    details: {
      description: 'Annual city marathon event',
      startTime: '06:00 AM',
      distance: '42.2 km',
      registrationDeadline: '2024-06-01',
      maxParticipants: 1000,
      requirements: [
        'Age 18+',
        'Medical clearance',
        'Previous marathon experience'
      ],
      amenities: [
        'Water stations',
        'Medical support',
        'Timing chips',
        'Finisher medals'
      ],
      marshals: 50,
      categories: [
        'Elite',
        'Amateur',
        'Veterans'
      ]
    }
  },
  {
    id: 2,
    name: 'Triathlon Championship',
    type: 'Triathlon',
    status: 'active',
    date: '2024-07-20',
    location: 'Los Angeles',
    participants: 200,
    organization: 'Triathlon Club B',
    details: {
      description: 'Professional triathlon competition',
      startTime: '07:00 AM',
      distances: {
        swim: '1.5 km',
        bike: '40 km',
        run: '10 km'
      },
      registrationDeadline: '2024-07-05',
      maxParticipants: 300,
      requirements: [
        'Age 18+',
        'Medical clearance',
        'Swimming certification'
      ],
      amenities: [
        'Transition areas',
        'Bike support',
        'Medical team',
        'Recovery zone'
      ],
      marshals: 40,
      categories: [
        'Professional',
        'Age Groups',
        'Relay Teams'
      ]
    }
  },
  // Add more mock data as needed
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusUpdate = async (id: number, action: 'approve' | 'cancel') => {
    try {
      // API call would go here
      toast.success(`Successfully ${action}d event`, {
        description: `The event has been ${action}d.`
      });
    } catch (error) {
      toast.error('Failed to update event status', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // API call would go here
      toast.success('Event deleted successfully', {
        description: 'The event has been removed from the system.'
      });
    } catch (error) {
      toast.error('Failed to delete event', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleViewDetails = (event: typeof events[0]) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Manage race events and their details
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search events..."
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
          Add Event
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.participants}</TableCell>
                <TableCell>
                  <Badge
                    variant={event.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(event)}
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
                      onClick={() => handleDelete(event.id)}
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
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View complete event information
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedEvent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Date: {selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Start Time: {selectedEvent.details.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location: {selectedEvent.location}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Participants: {selectedEvent.participants} / {selectedEvent.details.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span>Marshals: {selectedEvent.details.marshals}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Organization: {selectedEvent.organization}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.details.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Distance</h4>
                  <p className="text-sm text-muted-foreground">
                    {typeof selectedEvent.details.distance === 'string'
                      ? selectedEvent.details.distance
                      : Object.entries(selectedEvent.details.distances as Record<string, string>)
                          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                          .join(' • ')
                    }
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Registration Deadline</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.details.registrationDeadline}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Requirements</h4>
                  <div className="space-y-1">
                    {selectedEvent.details.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{req}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.details.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.details.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {/* Add edit action */}}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedEvent.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 