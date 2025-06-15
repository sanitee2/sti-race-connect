"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";

interface AboutCardProps {
  event: Event;
}

export function AboutCard({ event }: AboutCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(event.description || "");

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event description');
      }

      toast.success('Description updated successfully');
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>About the Event</CardTitle>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveChanges}>
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of your event..."
            className="min-h-[200px]"
          />
        ) : (
          description ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="text-muted-foreground text-center py-8">No description available.</p>
          )
        )}
      </CardContent>
    </Card>
  );
} 