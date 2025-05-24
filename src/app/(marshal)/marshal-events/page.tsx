"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Search, Plus, Filter, ChevronDown, Eye, Edit, Trash2, UserPlus, Award, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { TimePicker } from "@/components/ui/time-picker";

// Define types for our data
interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  target_audience: string;
  created_by: string;
  participants?: number;
  categories?: EventCategory[];
}

interface EventFormData {
  name: string;
  description: string;
  date: Date | undefined;
  time: Date | undefined;
  location: string;
  target_audience: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  targetAudience: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Form states
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    name: "",
    description: "",
    date: undefined,
    time: undefined,
    location: "",
    target_audience: ""
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    targetAudience: ""
  });

  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // API Functions
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

  const createEvent = async (eventData: EventFormData) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date ? format(eventData.date, 'yyyy-MM-dd') : '',
        time: eventData.time ? format(eventData.time, 'HH:mm') : '',
        location: eventData.location,
        target_audience: eventData.target_audience,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    return response.json();
  };

  const updateEvent = async (eventId: string, eventData: EventFormData) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date ? format(eventData.date, 'yyyy-MM-dd') : '',
        time: eventData.time ? format(eventData.time, 'HH:mm') : '',
        location: eventData.location,
        target_audience: eventData.target_audience,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    return response.json();
  };

  const deleteEvent = async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }

    return response.json();
  };

  const addCategoryToEvent = async (eventId: string, categoryData: CategoryFormData) => {
    const response = await fetch(`/api/events/${eventId}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        targetAudience: categoryData.targetAudience,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add category');
    }

    return response.json();
  };

  const updateCategory = async (eventId: string, categoryId: string, categoryData: CategoryFormData) => {
    const response = await fetch(`/api/events/${eventId}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        targetAudience: categoryData.targetAudience,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    return response.json();
  };

  const deleteCategoryFromEvent = async (eventId: string, categoryId: string) => {
    const response = await fetch(`/api/events/${eventId}/categories/${categoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }

    return response.json();
  };

  // Filter events based on search query, tab, and filter status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter based on active tab
    const matchesTab = 
      (activeTab === "upcoming" && new Date(event.date) >= new Date()) || 
      (activeTab === "past" && new Date(event.date) < new Date()) ||
      (activeTab === "all");
    
    // Filter based on status
    const matchesStatus = filterStatus === "all" || event.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  // Event CRUD Functions
  const handleCreateEvent = async () => {
    if (!validateEventForm()) return;
    
    setIsLoading(true);
    try {
      const newEvent = await createEvent(eventFormData);
      setEvents(prev => [...prev, newEvent]);
      resetEventForm();
      setIsCreateEventOpen(false);
      toast.success("Event Created", {
        description: "Your event has been successfully created.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !validateEventForm()) return;
    
    setIsLoading(true);
    try {
      const updatedEvent = await updateEvent(selectedEvent.id, eventFormData);
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      ));

      resetEventForm();
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      toast.success("Event Updated", {
        description: "Your event has been successfully updated.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      await deleteEvent(selectedEvent.id);
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsDeleteEventOpen(false);
      setSelectedEvent(null);
      toast.success("Event Deleted", {
        description: "The event has been successfully deleted.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Category CRUD Functions
  const handleAddCategory = async () => {
    if (!selectedEvent || !validateCategoryForm()) return;
    
    setIsLoading(true);
    try {
      const newCategory = await addCategoryToEvent(selectedEvent.id, categoryFormData);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: [...(event.categories || []), newCategory]
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: [...(prev.categories || []), newCategory]
      } : prev);

      resetCategoryForm();
      toast.success("Category Added", {
        description: "New category has been successfully added.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedEvent || !editingCategory || !validateCategoryForm()) return;
    
    setIsLoading(true);
    try {
      const updatedCategory = await updateCategory(selectedEvent.id, editingCategory.id, categoryFormData);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: event.categories?.map(cat => 
                cat.id === editingCategory.id ? updatedCategory : cat
              )
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      } : prev);

      resetCategoryForm();
      setEditingCategory(null);
      toast.success("Category Updated", {
        description: "Category has been successfully updated.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedEvent || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      await deleteCategoryFromEvent(selectedEvent.id, selectedCategory.id);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: event.categories?.filter(cat => cat.id !== selectedCategory.id)
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.filter(cat => cat.id !== selectedCategory.id)
      } : prev);

      setIsDeleteCategoryOpen(false);
      setSelectedCategory(null);
      toast.success("Category Deleted", {
        description: "Category has been successfully deleted.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const validateEventForm = (): boolean => {
    if (!eventFormData.name.trim()) {
      toast.error("Event name is required.");
      return false;
    }
    if (!eventFormData.location.trim()) {
      toast.error("Event location is required.");
      return false;
    }
    if (!eventFormData.date) {
      toast.error("Event date is required.");
      return false;
    }
    if (!eventFormData.time) {
      toast.error("Event time is required.");
      return false;
    }
    return true;
  };

  const validateCategoryForm = (): boolean => {
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required.");
      return false;
    }
    return true;
  };

  const resetEventForm = () => {
    setEventFormData({
      name: "",
      description: "",
      date: undefined,
      time: undefined,
      location: "",
      target_audience: ""
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      targetAudience: ""
    });
  };

  const openCreateEvent = () => {
    resetEventForm();
    setIsCreateEventOpen(true);
  };

  const openEditEvent = (event: Event) => {
    // Parse the time string (HH:MM format) into a Date object
    let timeDate: Date | undefined;
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
    }

    setEventFormData({
      name: event.name,
      description: event.description,
      date: new Date(event.date),
      time: timeDate,
      location: event.location,
      target_audience: event.target_audience
    });
    setSelectedEvent(event);
    setIsEditEventOpen(true);
  };

  const openDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteEventOpen(true);
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const openCategoryManagement = (event: Event) => {
    setSelectedEvent(event);
    setIsCategoryManagementOpen(true);
    resetCategoryForm();
    setEditingCategory(null);
  };

  const openEditCategory = (category: EventCategory) => {
    setCategoryFormData({
      name: category.name,
      description: category.description,
      targetAudience: category.targetAudience
    });
    setEditingCategory(category);
  };

  const openDeleteCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleManageStaff = (event: Event) => {
    // This would open a staff management dialog
    toast.info("Staff management feature coming soon.");
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Create, view and manage race events for STI Race Connect.
          </p>
        </div>
        <Button onClick={openCreateEvent} className="flex gap-2">
          <Plus size={16} /> Create Event
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter size={16} /> 
                {filterStatus === "all" ? "All Statuses" : 
                 filterStatus === "upcoming" ? "Upcoming" : 
                 filterStatus === "active" ? "Active" : 
                 filterStatus === "completed" ? "Completed" : "Filter"}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("upcoming")}>
                Upcoming
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          <EventsDisplay 
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <EventsDisplay 
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <EventsDisplay 
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Enter the details for the new race event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-name" className="text-right">
                Event Name *
              </Label>
              <Input 
                id="event-name" 
                placeholder="Enter event name" 
                className="col-span-3"
                value={eventFormData.name}
                onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Event Date *
              </Label>
              <div className="col-span-3">
                <DatePicker 
                  date={eventFormData.date}
                  onSelect={(date) => setEventFormData(prev => ({ ...prev, date }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Event Time *
              </Label>
              <div className="col-span-3">
                <TimePicker
                  date={eventFormData.time}
                  onChange={(time) => setEventFormData(prev => ({ ...prev, time }))}
                  hourCycle={12}
                  placeholder="Select time"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location *
              </Label>
              <Input 
                id="location" 
                placeholder="Enter event location" 
                className="col-span-3"
                value={eventFormData.location}
                onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-audience" className="text-right">
                Target Audience
              </Label>
              <Input 
                id="target-audience" 
                placeholder="e.g., All ages, Professionals" 
                className="col-span-3"
                value={eventFormData.target_audience}
                onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                placeholder="Provide a description of the event"
                rows={3}
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleCreateEvent} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-event-name" className="text-right">
                Event Name *
              </Label>
              <Input 
                id="edit-event-name" 
                placeholder="Enter event name" 
                className="col-span-3"
                value={eventFormData.name}
                onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-event-date" className="text-right">
                Event Date *
              </Label>
              <div className="col-span-3">
                <DatePicker 
                  date={eventFormData.date}
                  onSelect={(date) => setEventFormData(prev => ({ ...prev, date }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-event-time" className="text-right">
                Event Time *
              </Label>
              <div className="col-span-3">
                <TimePicker
                  date={eventFormData.time}
                  onChange={(time) => setEventFormData(prev => ({ ...prev, time }))}
                  hourCycle={12}
                  placeholder="Select time"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location *
              </Label>
              <Input 
                id="edit-location" 
                placeholder="Enter event location" 
                className="col-span-3"
                value={eventFormData.location}
                onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-target-audience" className="text-right">
                Target Audience
              </Label>
              <Input 
                id="edit-target-audience" 
                placeholder="e.g., All ages, Professionals" 
                className="col-span-3"
                value={eventFormData.target_audience}
                onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                className="col-span-3"
                placeholder="Provide a description of the event"
                rows={3}
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditEvent} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteEventOpen}
        onOpenChange={setIsDeleteEventOpen}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the event "${selectedEvent?.name}" and all its associated data.`}
        onConfirm={handleDeleteEvent}
        confirmText={isLoading ? "Deleting..." : "Delete Event"}
        variant="danger"
        isConfirmLoading={isLoading}
      />

      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this event.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
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
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedEvent.status} />
                  </div>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryManagementOpen} onOpenChange={setIsCategoryManagementOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Event Categories</DialogTitle>
            <DialogDescription>
              {selectedEvent ? `Create and manage categories for ${selectedEvent.name}` : 'Create and manage event categories'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Categories</h3>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent.categories && selectedEvent.categories.length > 0 ? (
                      selectedEvent.categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>{category.targetAudience}</TableCell>
                          <TableCell>{category.participants}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => openEditCategory(category)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => openDeleteCategory(category)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No categories added to this event yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-muted/50 rounded-md p-4 mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="text-right">
                      Category Name *
                    </Label>
                    <Input 
                      id="category-name" 
                      placeholder="e.g., 5K Run, Marathon" 
                      className="col-span-3"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-description" className="text-right">
                      Description
                    </Label>
                    <Input 
                      id="category-description" 
                      placeholder="Brief description of this category" 
                      className="col-span-3"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-target-audience" className="text-right">
                      Target Audience
                    </Label>
                    <Input 
                      id="category-target-audience" 
                      placeholder="e.g., Adults, Children, Elite runners" 
                      className="col-span-3"
                      value={categoryFormData.targetAudience}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingCategory && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingCategory(null);
                          resetCategoryForm();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      onClick={editingCategory ? handleEditCategory : handleAddCategory}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryManagementOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteCategoryOpen}
        onOpenChange={setIsDeleteCategoryOpen}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteCategory}
        confirmText={isLoading ? "Deleting..." : "Delete Category"}
        variant="danger"
        isConfirmLoading={isLoading}
      />
    </div>
  );
}

// Component to display events in either card or table format
function EventsDisplay({ 
  events, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: { 
  events: Event[],
  onManageCategories: (event: Event) => void,
  onEditEvent: (event: Event) => void,
  onDeleteEvent: (event: Event) => void,
  onViewDetails: (event: Event) => void,
  onManageStaff: (event: Event) => void
}) {
  const [viewMode, setViewMode] = useState("cards");
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="border rounded-md overflow-hidden flex">
          <Button 
            variant={viewMode === "cards" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("cards")}
            className="rounded-none"
          >
            Cards
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("table")}
            className="rounded-none"
          >
            Table
          </Button>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((event: Event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onManageCategories={onManageCategories}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onViewDetails={onViewDetails}
                onManageStaff={onManageStaff}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event: Event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell>{event.categories?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onViewDetails(event)}>
                            <Eye size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEditEvent(event)}>
                            <Edit size={14} /> Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageStaff(event)}>
                            <UserPlus size={14} /> Manage Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
                            <Award size={14} /> Manage Categories
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex gap-2 items-center text-destructive" onClick={() => onDeleteEvent(event)}>
                            <Trash2 size={14} /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No events found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: { 
  event: Event,
  onManageCategories: (event: Event) => void,
  onEditEvent: (event: Event) => void,
  onDeleteEvent: (event: Event) => void,
  onViewDetails: (event: Event) => void,
  onManageStaff: (event: Event) => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <StatusBadge status={event.status} />
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{event.participants || 0} Participants</span>
          </div>
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.categories.map((category, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" className="flex gap-1 items-center" onClick={() => onViewDetails(event)}>
          <Eye size={14} /> Details
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEditEvent(event)}>
              <Edit size={14} /> Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageStaff(event)}>
              <UserPlus size={14} /> Manage Staff
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
              <Award size={14} /> Manage Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex gap-2 items-center text-destructive" onClick={() => onDeleteEvent(event)}>
              <Trash2 size={14} /> Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let variant: "outline" | "secondary" | "default" | "destructive" = "outline";
  let icon = null;

  switch (status.toLowerCase()) {
    case "upcoming":
      variant = "secondary";
      icon = <Calendar className="mr-1 h-3 w-3" />;
      break;
    case "active":
      variant = "default";
      icon = <Check className="mr-1 h-3 w-3" />;
      break;
    case "completed":
      variant = "outline";
      icon = <Check className="mr-1 h-3 w-3" />;
      break;
    case "cancelled":
      variant = "destructive";
      icon = <X className="mr-1 h-3 w-3" />;
      break;
    default:
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {icon}
      {status}
    </Badge>
  );
} 