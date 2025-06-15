import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventFormData } from "../../types";

interface StepDetailsProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepDetails({ eventFormData, setEventFormData }: StepDetailsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="target-audience">
          Target Audience <span className="text-destructive">*</span>
        </Label>
        <Input
          id="target-audience"
          placeholder="e.g., All ages, Professionals, Elite runners"
          value={eventFormData.target_audience}
          onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Specify who this event is designed for
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">
          Event Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Provide a detailed description of the event, including what participants can expect, race categories, prizes, etc."
          rows={6}
          value={eventFormData.description}
          onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          A good description helps participants understand what to expect
        </p>
      </div>
    </>
  );
} 