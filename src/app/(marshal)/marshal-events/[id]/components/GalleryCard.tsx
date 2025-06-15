"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Event } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";
import { GalleryImage } from "../../components/gallery-image";
import { ImageUpload } from "@/components/ui/image-upload";

interface GalleryCardProps {
  event: Event;
}

export function GalleryCard({ event }: GalleryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(event.gallery_images || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gallery_images: galleryImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update gallery');
      }

      toast.success('Gallery updated successfully');
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating gallery:', error);
      toast.error('Failed to update gallery');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gallery</CardTitle>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Event Gallery Images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload up to 6 images for your event gallery. You can drag and drop images or click to select files.
              </p>
              
              <ImageUpload
                variant="gallery"
                images={galleryImages}
                onChange={(value) => setGalleryImages(value as string[])}
                maxImages={6}
                useCloud={true}
                folder="event-gallery"
              />
            </div>
          </div>
        ) : (
          // Display mode
          galleryImages && galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <GalleryImage
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No gallery images uploaded.</p>
          )
        )}
      </CardContent>
    </Card>
  );
} 