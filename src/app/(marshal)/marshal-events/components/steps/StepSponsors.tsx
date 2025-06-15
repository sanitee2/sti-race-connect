import { EventFormData } from "../../types";
import { SponsorsForm } from "../sponsors-form";

interface StepSponsorsProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepSponsors({ eventFormData, setEventFormData }: StepSponsorsProps) {
  return (
    <SponsorsForm
      sponsors={eventFormData.sponsors || []}
      onSponsorsChange={(sponsors) => setEventFormData(prev => ({ ...prev, sponsors }))}
    />
  );
} 