"use client";

import React, { useState, useEffect } from 'react';
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
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { DialogFooter } from '@/components/ui/dialog';

// Types for events
interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
  image?: string;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  target_audience: string;
  cover_image?: string;
  gallery_images?: string[];
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'cancelled' | 'completed';
  target_audience: string;
  created_by: string;
  participants?: number;
  categories?: EventCategory[];
  cover_image?: string;
  gallery_images?: string[];
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    target_audience: '',
    cover_image: '',
    gallery_images: []
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsPageLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsPageLoading(false);
    }
  };

  const getStatusColor = (status: Event['status']): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'active':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Event['status']) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Event ${newStatus} successfully`, {
        description: `The event has been marked as ${newStatus}.`
      });

      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      toast.error('Failed to update event status', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully', {
        description: 'The event has been removed from the system.'
      });

      // Close the dialog if open
      setIsDetailsOpen(false);
      
      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleEditEvent = async (event: Event) => {
    try {
      setIsLoading(true);
      setSelectedEvent(event);
      setEventFormData({
        name: event.name,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        target_audience: event.target_audience,
        cover_image: event.cover_image || "",
        gallery_images: event.gallery_images || []
      });
      setIsEditEventOpen(true);
    } catch (error) {
      toast.error('Failed to load event details', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventFormData,
          id: selectedEvent.id,
          status: selectedEvent.status,
          created_by: selectedEvent.created_by
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      toast.success('Event updated successfully');
      setIsEditEventOpen(false);
      fetchEvents(); // Refresh the events list
    } catch (error) {
      toast.error('Failed to update event', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Manage and approve race events
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
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading events...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-muted-foreground">No events found matching your criteria.</p>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {event.cover_image ? (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden">
                          <Image
                            src={event.cover_image}
                            alt={event.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Created by {event.created_by}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {event.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {event.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.categories && event.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {event.categories.slice(0, 2).map((category, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                        {event.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No categories</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(event.status)}
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
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit event</span>
                      </Button>
                      {event.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                          onClick={() => handleStatusUpdate(event.id, 'approved')}
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                      )}
                      {['pending', 'approved'].includes(event.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(event.id, 'cancelled')}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and manage event information
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created by {selectedEvent.created_by}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={getStatusColor(selectedEvent.status)}
                  className="capitalize"
                >
                  {selectedEvent.status}
                </Badge>
              </div>

              {/* Featured Image */}
              {selectedEvent.cover_image && (
                <div>
                  <Label className="text-sm font-medium">Featured Image</Label>
                  <div className="mt-2 relative h-48 w-full rounded-md overflow-hidden">
                    <Image
                      src={selectedEvent.cover_image}
                      alt={selectedEvent.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 600px) 100vw, 600px"
                    />
                  </div>
                </div>
              )}

              {/* Gallery Images */}
              {selectedEvent.gallery_images && selectedEvent.gallery_images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Gallery Images ({selectedEvent.gallery_images.length})</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedEvent.gallery_images.map((imageUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`Gallery image ${idx + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform cursor-pointer"
                          sizes="(max-width: 768px) 50vw, 200px"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.target_audience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Participants</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.participants || 0}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
              </div>

              {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.categories.map((category, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {selectedEvent.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                    onClick={() => {
                      handleStatusUpdate(selectedEvent.id, 'approved');
                      setIsDetailsOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    Approve Event
                  </Button>
                )}
                {['pending', 'approved'].includes(selectedEvent.status) && (
                  <Button
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                    onClick={() => {
                      handleStatusUpdate(selectedEvent.id, 'cancelled');
                      setIsDetailsOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel Event
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedEvent.id);
                    setIsDetailsOpen(false);
                  }}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-name">Event Name</Label>
                  <Input
                    id="edit-event-name"
                    value={eventFormData.name}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter event name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData(prev => ({ 
                      ...prev, 
                      date: e.target.value 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={eventFormData.time}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="edit-target-audience">Target Audience</Label>
                <Input
                  id="edit-target-audience"
                  value={eventFormData.target_audience}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., All ages, Professionals"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a description of the event"
                  rows={3}
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <ImageUpload
                  variant="featured"
                  onChange={(value) => setEventFormData(prev => ({ ...prev, cover_image: value as string }))}
                  images={eventFormData.cover_image ? [eventFormData.cover_image] : []}
                  useCloud={true}
                  folder="event-covers"
                />
              </div>

              <div className="space-y-2">
                <Label>Gallery Images</Label>
                <ImageUpload
                  variant="gallery"
                  onChange={(value) => setEventFormData(prev => ({ ...prev, gallery_images: value as string[] }))}
                  images={eventFormData.gallery_images || []}
                  maxImages={6}
                  useCloud={true}
                  folder="event-gallery"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 