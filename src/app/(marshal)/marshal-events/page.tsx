"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Search, Plus, Filter, ChevronDown, Eye, Edit, Trash2, UserPlus, Award, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define types for our data
interface EventCategory {
  name: string;
  description?: string;
  targetAudience?: string;
  participants?: number;
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
  categories?: string[];
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterStatus, setFilterStatus] = useState("all");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  
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

  // Function to open category management dialog
  const openCategoryManagement = (event: Event) => {
    setSelectedEvent(event);
    setIsCategoryManagementOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Create, view and manage race events for STI Race Connect.
          </p>
        </div>
        <Button onClick={() => setIsCreateEventOpen(true)} className="flex gap-2">
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
          <EventsDisplay events={filteredEvents} onManageCategories={openCategoryManagement} />
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <EventsDisplay events={filteredEvents} onManageCategories={openCategoryManagement} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <EventsDisplay events={filteredEvents} onManageCategories={openCategoryManagement} />
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
                Event Name
              </Label>
              <Input id="event-name" placeholder="Enter event name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Event Date
              </Label>
              <div className="col-span-3">
                <DatePicker 
                  date={eventDate}
                  onSelect={setEventDate}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input id="location" placeholder="Enter event location" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-audience" className="text-right">
                Target Audience
              </Label>
              <Input id="target-audience" placeholder="e.g., All ages, Professionals" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <textarea
                id="description"
                className="col-span-3 flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Provide a description of the event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryManagementOpen} onOpenChange={setIsCategoryManagementOpen}>
        <DialogContent className="sm:max-w-[700px]">
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
                <Button size="sm" className="flex items-center gap-1">
                  <Plus size={14} /> Add Category
                </Button>
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
                      selectedEvent.categories.map((category, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{category}</TableCell>
                          <TableCell>Description for {category}</TableCell>
                          <TableCell>All ages</TableCell>
                          <TableCell>{Math.floor(Math.random() * 50) + 5}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
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
                <h4 className="text-sm font-medium mb-2">Add New Category</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="text-right">
                      Category Name
                    </Label>
                    <Input id="category-name" placeholder="e.g., 5K Run, Marathon" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-description" className="text-right">
                      Description
                    </Label>
                    <Input id="category-description" placeholder="Brief description of this category" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target-audience" className="text-right">
                      Target Audience
                    </Label>
                    <Input id="target-audience" placeholder="e.g., Adults, Children, Elite runners" className="col-span-3" />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm">Add Category</Button>
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
    </div>
  );
}

// Component to display events in either card or table format
function EventsDisplay({ events, onManageCategories }: { 
  events: Event[],
  onManageCategories: (event: Event) => void 
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
            events.map((event: Event, index: number) => (
              <EventCard key={index} event={event} onManageCategories={onManageCategories} />
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
                events.map((event: Event, index: number) => (
                  <TableRow key={index}>
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
                          <DropdownMenuItem className="flex gap-2 items-center">
                            <Eye size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center">
                            <Edit size={14} /> Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center">
                            <UserPlus size={14} /> Manage Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
                            <Award size={14} /> Manage Categories
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex gap-2 items-center text-destructive">
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
function EventCard({ event, onManageCategories }: { 
  event: Event,
  onManageCategories: (event: Event) => void 
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
              {event.categories.map((category: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" className="flex gap-1 items-center">
          <Eye size={14} /> Details
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex gap-2 items-center">
              <Edit size={14} /> Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 items-center">
              <UserPlus size={14} /> Manage Staff
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
              <Award size={14} /> Manage Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex gap-2 items-center text-destructive">
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

// Mock data with expanded fields matching the schema
const events = [
  {
    id: "1",
    name: "STI Marathon 2024",
    description: "Annual marathon event with multiple race categories.",
    date: "May 15, 2025",
    time: "6:00 AM - 12:00 PM",
    location: "City Park, Downtown",
    status: "Upcoming",
    target_audience: "All runners, professional and amateur",
    created_by: "John Smith",
    participants: 125,
    categories: ["Full Marathon", "Half Marathon", "10K"]
  },
  {
    id: "2",
    name: "Charity 5K Run",
    description: "Fundraising event for local children's hospital.",
    date: "May 22, 2025",
    time: "7:30 AM - 10:00 AM",
    location: "Riverside Park",
    status: "Upcoming",
    target_audience: "Families, Corporate Teams",
    created_by: "Emma Johnson",
    participants: 78,
    categories: ["5K Run", "Family Walk"]
  },
  {
    id: "3",
    name: "Corporate Challenge",
    description: "Team-based running event for local businesses.",
    date: "June 1, 2025",
    time: "8:00 AM - 11:30 AM",
    location: "Business District",
    status: "Upcoming",
    target_audience: "Corporate Teams",
    created_by: "Michael Brown",
    participants: 210,
    categories: ["10K Team Relay", "5K Individual"]
  },
  {
    id: "4",
    name: "Winter Fun Run",
    description: "Casual 3K run event for all ages.",
    date: "January 15, 2025",
    time: "9:00 AM - 11:00 AM",
    location: "Community Center",
    status: "Completed",
    target_audience: "Families, Beginners",
    created_by: "Sarah Miller",
    participants: 156,
    categories: ["3K Fun Run"]
  },
  {
    id: "5",
    name: "Trail Adventure Race",
    description: "Challenging off-road event through scenic trails.",
    date: "August 12, 2025",
    time: "7:00 AM - 2:00 PM",
    location: "Mountain Trails Park",
    status: "Upcoming",
    target_audience: "Experienced runners, Trail enthusiasts",
    created_by: "David Wilson",
    participants: 85,
    categories: ["15K Trail Run", "8K Trail Run"]
  },
  {
    id: "6",
    name: "Summer Sprint Series",
    description: "Weekly sprint races throughout summer.",
    date: "July 5-26, 2025",
    time: "8:00 AM - 9:30 AM",
    location: "City Track Stadium",
    status: "Upcoming",
    target_audience: "Sprinters, Youth Athletes",
    created_by: "Jennifer Lee",
    participants: 112,
    categories: ["100m", "200m", "400m"]
  }
]; 