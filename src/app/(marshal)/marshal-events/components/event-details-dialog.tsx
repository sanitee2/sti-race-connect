import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import { Event } from "@/app/(marshal)/marshal-events/types/index";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function EventDetailsDialog({
  open,
  onOpenChange,
  event
}: EventDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event?.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this event.
          </DialogDescription>
        </DialogHeader>
        {event && (
          <div className="space-y-4 py-4">
            {/* Featured Image */}
            {event.cover_image && (
              <div>
                <Label className="text-sm font-medium">Featured Image</Label>
                <div className="mt-2 relative h-48 w-full rounded-md overflow-hidden">
                  <Image
                    src={event.cover_image}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 600px) 100vw, 600px"
                  />
                </div>
              </div>
            )}
            
            {/* Gallery Images */}
            {event.gallery_images && event.gallery_images.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Gallery Images ({event.gallery_images.length})</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {event.gallery_images.map((imageUrl, idx) => (
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
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Time</Label>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <StatusBadge status={event.status} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Target Audience</Label>
                <p className="text-sm text-muted-foreground">{event.target_audience}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Participants</Label>
                <p className="text-sm text-muted-foreground">{event.participants || 0}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            </div>
            {event.categories && event.categories.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.categories.map((category, idx) => (
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 