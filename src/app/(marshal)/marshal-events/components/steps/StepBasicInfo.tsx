import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Flag, MapPin, Users } from "lucide-react";
import { EventFormData } from "../../types";

interface StepBasicInfoProps {
  eventFormData: EventFormData;
  setEventFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
}

export function StepBasicInfo({ eventFormData, setEventFormData }: StepBasicInfoProps) {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Function to check if a date is before today
  const isBeforeToday = (date: Date | undefined) => {
    if (!date) return false;
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Function to check if end date is before start date
  const isEndBeforeStart = (endDate: Date | undefined) => {
    if (!endDate || !eventFormData.registrationStartDate) return false;
    const compareEndDate = new Date(endDate);
    const compareStartDate = new Date(eventFormData.registrationStartDate);
    compareEndDate.setHours(0, 0, 0, 0);
    compareStartDate.setHours(0, 0, 0, 0);
    return compareEndDate < compareStartDate;
  };

  // Function to check if date is on or after event date
  const isOnOrAfterEventDate = (date: Date | undefined) => {
    if (!date || !eventFormData.date) return false;
    const compareDate = new Date(date);
    const eventDate = new Date(eventFormData.date);
    compareDate.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return compareDate >= eventDate;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-name">
            Event Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event-name"
            placeholder="Enter event name"
            value={eventFormData.name}
            onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            placeholder="Enter event location"
            value={eventFormData.location}
            onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-date">
            Event Date <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            date={eventFormData.date}
            onSelect={(date) => {
              // If the selected date is before today, don't update
              if (isBeforeToday(date)) return;
              setEventFormData(prev => ({ 
                ...prev, 
                date,
                // Reset registration dates when event date changes
                registrationStartDate: undefined,
                registrationEndDate: undefined
              }));
            }}
            disabled={(date) => isBeforeToday(date)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-time">
            Event Time <span className="text-destructive">*</span>
          </Label>
          <TimePicker
            date={eventFormData.time}
            onChange={(time) => setEventFormData(prev => ({ ...prev, time }))}
          />
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registration-start-date">
              Registration Start <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              date={eventFormData.registrationStartDate}
              onSelect={(date) => {
                // If the selected date is before today or after event date, don't update
                if (isBeforeToday(date) || isOnOrAfterEventDate(date)) return;
                
                setEventFormData(prev => ({ 
                  ...prev, 
                  registrationStartDate: date,
                  // Clear end date if it's before the new start date
                  registrationEndDate: isEndBeforeStart(prev.registrationEndDate) ? undefined : prev.registrationEndDate
                }));
              }}
              disabled={(date) => {
                // Disable if date is before today or on/after event date
                return isBeforeToday(date) || isOnOrAfterEventDate(date);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-end-date">
              Registration End <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <DatePicker
              date={eventFormData.registrationEndDate}
              onSelect={(date) => {
                // If the selected date is before start date or on/after event date, don't update
                if (isEndBeforeStart(date) || isOnOrAfterEventDate(date)) return;
                setEventFormData(prev => ({ ...prev, registrationEndDate: date }));
              }}
              disabled={(date) => {
                // Disable if no start date is selected, if date is before start date, or if date is on/after event date
                if (!eventFormData.registrationStartDate) return true;
                return isEndBeforeStart(date) || isOnOrAfterEventDate(date);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 