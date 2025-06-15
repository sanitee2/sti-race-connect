import { EventFormData } from "../../types";

interface StepReviewProps {
  eventFormData: EventFormData;
}

export function StepReview({ eventFormData }: StepReviewProps) {
  // TODO: Render a summary of all event data for review
  return (
    <div>
      {/* Render a summary of all event data here */}
      <pre>{JSON.stringify(eventFormData, null, 2)}</pre>
    </div>
  );
} 