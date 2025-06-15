import { EventFormData } from "../../types";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";

interface StepMediaProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepMedia({ eventFormData, setEventFormData }: StepMediaProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Featured Image <span className="text-destructive">*</span>
        </Label>
        <div className="w-full">
          <ImageUpload
            variant="featured"
            onChange={(value) => setEventFormData(prev => ({ ...prev, cover_image: value as string }))}
            images={eventFormData.cover_image ? [eventFormData.cover_image] : []}
            useCloud={true}
            folder="event-covers"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Upload a featured image that will be displayed as the main event photo
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Gallery Images <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <div className="w-full">
          <ImageUpload
            variant="gallery"
            onChange={(value) => setEventFormData(prev => ({ ...prev, gallery_images: value as string[] }))}
            images={eventFormData.gallery_images || []}
            maxImages={6}
            useCloud={true}
            folder="event-gallery"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Upload additional images to showcase your event venue, past events, or what participants can expect. Maximum 6 images.
          </p>
        </div>
      </div>
    </div>
  );
} 