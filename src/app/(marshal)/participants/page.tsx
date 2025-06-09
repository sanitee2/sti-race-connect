"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Participant {
  id: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    name: string;
  };
  category: {
    category_name: string;
  };
  rfid_number: string | null;
  registration_status: string;
  payment_status: string;
}

interface Event {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    description: string;
    targetAudience: string;
    participants: number;
    image?: string;
  }[];
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; name: string; email: string; }[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<{ id: string; category_name: string; }[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    fetchParticipants();
    fetchEvents();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const event = events.find(e => e.id === selectedEvent);
      setFilteredCategories(
        event?.categories?.map(category => ({
          id: category.id,
          category_name: category.name
        })) || []
      );
    } else {
      setFilteredCategories([]);
    }
  }, [selectedEvent, events]);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersError(null);
      setIsUsersLoading(true);
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError(error instanceof Error ? error.message : 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUser || !selectedEvent || !selectedCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser,
          event_id: selectedEvent,
          category_id: selectedCategory,
        }),
      });

      if (!response.ok) throw new Error('Failed to add participant');
      
      await fetchParticipants();
      setIsAddParticipantOpen(false);
      resetForm();
      toast.success('Participant added successfully');
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setSelectedEvent("");
    setSelectedCategory("");
  };

  const filteredParticipants = participants.filter(participant => 
    participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          Manage runners participating in your events.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search participants..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddParticipantOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
          <Button variant="outline">Export List</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>RFID Number</TableHead>
              <TableHead>Registration Status</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading participants...</TableCell>
              </TableRow>
            ) : filteredParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No participants found</TableCell>
              </TableRow>
            ) : (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.user.name}</TableCell>
                  <TableCell>{participant.user.email}</TableCell>
                  <TableCell>{participant.event.name}</TableCell>
                  <TableCell>{participant.category.category_name}</TableCell>
                  <TableCell>{participant.rfid_number || "Not assigned"}</TableCell>
                  <TableCell>
                    <Badge variant={
                      participant.registration_status === "Approved" ? "default" :
                      participant.registration_status === "Rejected" ? "destructive" : "outline"
                    }>
                      {participant.registration_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      participant.payment_status === "Paid" ? "default" :
                      participant.payment_status === "Verified" ? "secondary" : "outline"
                    }>
                      {participant.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Add a new participant to an event. Select the user, event, and category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select 
                value={selectedUser} 
                onValueChange={setSelectedUser}
                disabled={isUsersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isUsersLoading 
                      ? "Loading users..." 
                      : usersError 
                      ? "Error loading users" 
                      : "Select a user"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {usersError ? (
                    <SelectItem value="error" disabled>
                      Error: {usersError}
                    </SelectItem>
                  ) : isUsersLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No runners found
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event</label>
              <Select 
                value={selectedEvent} 
                onValueChange={setSelectedEvent}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoading 
                      ? "Loading events..." 
                      : "Select an event"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : events.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No events found
                    </SelectItem>
                  ) : (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={!selectedEvent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddParticipantOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddParticipant}>
              Add Participant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 