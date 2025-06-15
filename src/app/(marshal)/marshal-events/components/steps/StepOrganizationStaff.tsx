import { EventFormData } from "../../types";
import { OrganizationStaffForm } from "../organization-staff-form";

interface StepOrganizationStaffProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepOrganizationStaff({ eventFormData, setEventFormData }: StepOrganizationStaffProps) {
  return (
    <OrganizationStaffForm
      organizationId={eventFormData.organization_id}
      eventStaff={eventFormData.event_staff || []}
      onOrganizationChange={(value) => setEventFormData(prev => ({ ...prev, organization_id: value }))}
      onStaffChange={(staff) => setEventFormData(prev => ({ ...prev, event_staff: staff }))}
    />
  );
} 