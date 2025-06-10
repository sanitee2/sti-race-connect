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
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Flag,
  Medal,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const participants = [
  {
    id: 1,
    name: 'John Doe',
    age: 28,
    gender: 'Male',
    status: 'active',
    eventsParticipated: 12,
    upcomingEvents: 2,
    location: 'New York',
    contact: {
      email: 'john.doe@example.com',
      phone: '+1 234-567-8900'
    },
    details: {
      emergencyContact: 'Jane Doe (+1 234-567-8901)',
      medicalInfo: 'No known allergies',
      experience: 'Intermediate',
      preferredEvents: ['Marathon', 'Triathlon'],
      achievements: [
        'First Place - City Marathon 2023',
        'Second Place - Triathlon Championship 2022'
      ]
    }
  },
  {
    id: 2,
    name: 'Sarah Smith',
    age: 32,
    gender: 'Female',
    status: 'active',
    eventsParticipated: 8,
    upcomingEvents: 1,
    location: 'Los Angeles',
    contact: {
      email: 'sarah.smith@example.com',
      phone: '+1 234-567-8902'
    },
    details: {
      emergencyContact: 'Mike Smith (+1 234-567-8903)',
      medicalInfo: 'Asthma',
      experience: 'Advanced',
      preferredEvents: ['Half Marathon', '10K Run'],
      achievements: [
        'Third Place - LA Marathon 2023',
        'First Place - Beach Run 2022'
      ]
    }
  },
  // Add more mock data as needed
];

export default function Participants() {
  const [selectedParticipant, setSelectedParticipant] = useState<typeof participants[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusUpdate = async (id: number, action: 'activate' | 'deactivate') => {
    try {
      // API call would go here
      toast.success(`Successfully ${action}d participant`, {
        description: `The participant has been ${action}d.`
      });
    } catch (error) {
      toast.error('Failed to update participant status', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // API call would go here
      toast.success('Participant deleted successfully', {
        description: 'The participant has been removed from the system.'
      });
    } catch (error) {
      toast.error('Failed to delete participant', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleViewDetails = (participant: typeof participants[0]) => {
    setSelectedParticipant(participant);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
        <p className="text-sm text-muted-foreground">
          Manage race participants and their information
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search participants..."
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
          Add Participant
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Events Participated</TableHead>
              <TableHead>Upcoming Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.name}</TableCell>
                <TableCell>{participant.age}</TableCell>
                <TableCell>{participant.location}</TableCell>
                <TableCell>{participant.eventsParticipated}</TableCell>
                <TableCell>{participant.upcomingEvents}</TableCell>
                <TableCell>
                  <Badge
                    variant={participant.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {participant.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(participant)}
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
                      onClick={() => handleDelete(participant.id)}
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
            <DialogTitle>Participant Details</DialogTitle>
            <DialogDescription>
              View complete participant information
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedParticipant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipant.age} years old • {selectedParticipant.gender}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span>Events Participated: {selectedParticipant.eventsParticipated}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Upcoming Events: {selectedParticipant.upcomingEvents}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location: {selectedParticipant.location}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email: {selectedParticipant.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Phone: {selectedParticipant.contact.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Emergency Contact</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipant.details.emergencyContact}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Medical Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipant.details.medicalInfo}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Experience Level</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipant.details.experience}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Preferred Events</h4>
                  <div className="flex gap-2">
                    {selectedParticipant.details.preferredEvents.map((event, index) => (
                      <Badge key={index} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Achievements</h4>
                  <div className="space-y-2">
                    {selectedParticipant.details.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm text-muted-foreground">{achievement}</p>
                      </div>
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
                  Edit Participant
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedParticipant.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Participant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 