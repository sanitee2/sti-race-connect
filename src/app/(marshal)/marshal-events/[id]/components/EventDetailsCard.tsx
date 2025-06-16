"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Event } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";

interface EventDetailsCardProps {
  event: Event;
  eventDate: string;
  cutOffTime: string | null;
  gunStartTime: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
}

export function EventDetailsCard({ 
  event, 
  eventDate, 
  cutOffTime, 
  gunStartTime, 
  registrationStartDate, 
  registrationEndDate 
}: EventDetailsCardProps) {
  const [editingEventDetails, setEditingEventDetails] = useState(false);
  const [eventDetailsForm, setEventDetailsForm] = useState({
    name: event.name || "",
    location: event.location || "",
    date: event.date ? new Date(event.date) : undefined,
    time: event.time ? event.time : "",
    hasSlotLimit: event.has_slot_limit || false,
    slotLimit: event.slot_limit || "",
    cutOffTime: event.cutOffTime ? new Date(event.cutOffTime) : undefined,
    gunStartTime: event.gunStartTime ? new Date(event.gunStartTime) : undefined,
    registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate) : undefined,
    registrationEndDate: event.registrationEndDate ? new Date(event.registrationEndDate) : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call API to update event details
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventDetailsForm.name,
          location: eventDetailsForm.location,
          date: eventDetailsForm.date ? eventDetailsForm.date.toISOString().split('T')[0] : undefined,
          time: eventDetailsForm.time,
          hasSlotLimit: eventDetailsForm.hasSlotLimit,
          slotLimit: eventDetailsForm.slotLimit ? Number(eventDetailsForm.slotLimit) : undefined,
          cutOffTime: eventDetailsForm.cutOffTime?.toISOString(),
          gunStartTime: eventDetailsForm.gunStartTime?.toISOString(),
          registrationStartDate: eventDetailsForm.registrationStartDate?.toISOString(),
          registrationEndDate: eventDetailsForm.registrationEndDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event details');
      }

      toast.success('Event details updated successfully');
      setEditingEventDetails(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating event details:', error);
      toast.error('Failed to update event details');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Details</CardTitle>
        {!editingEventDetails && (
          <Button size="sm" variant="outline" onClick={() => setEditingEventDetails(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editingEventDetails ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={eventDetailsForm.name}
                  onChange={e => setEventDetailsForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={eventDetailsForm.location}
                  onChange={e => setEventDetailsForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={eventDetailsForm.date ? eventDetailsForm.date.toISOString().split('T')[0] : ""}
                  onChange={e => setEventDetailsForm(f => ({ ...f, date: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={eventDetailsForm.time}
                  onChange={e => setEventDetailsForm(f => ({ ...f, time: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventDetailsForm.hasSlotLimit}
                    onChange={e => setEventDetailsForm(f => ({ ...f, hasSlotLimit: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  Has Slot Limit
                </Label>
              </div>
              <div>
                <Label>Slot Limit</Label>
                <Input
                  type="number"
                  value={eventDetailsForm.slotLimit}
                  onChange={e => setEventDetailsForm(f => ({ ...f, slotLimit: e.target.value }))}
                  disabled={!eventDetailsForm.hasSlotLimit}
                />
              </div>
              <div>
                <Label>Cut-off Time</Label>
                <Input
                  type="datetime-local"
                  value={eventDetailsForm.cutOffTime ? eventDetailsForm.cutOffTime.toISOString().slice(0, 16) : ""}
                  onChange={e => setEventDetailsForm(f => ({ ...f, cutOffTime: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Gun Start Time</Label>
                <Input
                  type="datetime-local"
                  value={eventDetailsForm.gunStartTime ? eventDetailsForm.gunStartTime.toISOString().slice(0, 16) : ""}
                  onChange={e => setEventDetailsForm(f => ({ ...f, gunStartTime: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Registration Start Date</Label>
                <Input
                  type="date"
                  value={eventDetailsForm.registrationStartDate ? eventDetailsForm.registrationStartDate.toISOString().split('T')[0] : ""}
                  onChange={e => setEventDetailsForm(f => ({ ...f, registrationStartDate: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Registration End Date</Label>
                <Input
                  type="date"
                  value={eventDetailsForm.registrationEndDate ? eventDetailsForm.registrationEndDate.toISOString().split('T')[0] : ""}
                  onChange={e => setEventDetailsForm(f => ({ ...f, registrationEndDate: new Date(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditingEventDetails(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            {/* Display all fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Event Name:</span> {event.name || <span className="text-muted-foreground">Not provided</span>}
              </div>
              <div>
                <span className="font-medium">Location:</span> {event.location || <span className="text-muted-foreground">Not provided</span>}
              </div>
              <div>
                <span className="font-medium">Date:</span> {eventDate || <span className="text-muted-foreground">Not provided</span>}
              </div>
              <div>
                <span className="font-medium">Time:</span> {event.time || <span className="text-muted-foreground">Not provided</span>}
              </div>
              <div>
                <span className="font-medium">Has Slot Limit:</span> {event.has_slot_limit ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Slot Limit:</span> {event.slot_limit ?? <span className="text-muted-foreground">Not set</span>}
              </div>
              <div>
                <span className="font-medium">Cut-off Time:</span> {cutOffTime || <span className="text-muted-foreground">Not set</span>}
              </div>
              <div>
                <span className="font-medium">Gun Start Time:</span> {gunStartTime || <span className="text-muted-foreground">Not set</span>}
              </div>
              <div>
                <span className="font-medium">Registration Start:</span> {registrationStartDate || <span className="text-muted-foreground">Not set</span>}
              </div>
              <div>
                <span className="font-medium">Registration End:</span> {registrationEndDate || <span className="text-muted-foreground">Not set</span>}
              </div>
              <div>
                <span className="font-medium">Verified:</span> {(event as any)['is_verified'] ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Created By:</span> {event.created_by || <span className="text-muted-foreground">Unknown</span>}
              </div>
              <div>
                <span className="font-medium">Created At:</span> {(event as any)['created_at'] ? new Date((event as any)['created_at']).toLocaleString() : <span className="text-muted-foreground">Unknown</span>}
              </div>
              <div>
                <span className="font-medium">Updated At:</span> {(event as any)['updated_at'] ? new Date((event as any)['updated_at']).toLocaleString() : <span className="text-muted-foreground">Unknown</span>}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 