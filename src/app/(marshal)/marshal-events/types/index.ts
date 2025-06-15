// Base interfaces for shared fields
interface BaseEventFields {
  name: string;
  description: string;
  location: string;
  target_audience: string;
  cover_image?: string;
  gallery_images?: string[];
  isFreeEvent?: boolean;
  price?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  paymentMethods?: PaymentMethod[];
  hasSlotLimit?: boolean;
  slotLimit?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'account_number' | 'image';
  value: string;
}

interface BaseCategory {
  name: string;
  description: string;
  targetAudience: string;
  image?: string;
  price?: number;
  earlyBirdPrice?: number;
  hasSlotLimit?: boolean;
  slotLimit?: number;
}

// API Data Models
export interface EventCategory extends BaseCategory {
  id: string;
  participants: number;
  has_slot_limit: boolean;
  slot_limit: number | null;
  price?: number;
  earlyBirdPrice?: number;
}

export interface EventStepType {
  name: string;
  fields: string[];
}

export interface Event extends BaseEventFields {
  id: string;
  date: string;
  time: string;
  status: string;
  created_by: string;
  participants?: number;
  has_slot_limit: boolean;
  slot_limit: number | null;
  cutOffTime?: Date;
  gunStartTime?: Date;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  categories?: EventCategory[];
  organization_id?: string;
  event_staff: {
    user_id: string;
    role_in_event: StaffRole;
    responsibilities: string;
    user?: {
      name?: string;
      email?: string;
    };
  }[];
  sponsors: {
    name: string;
    logo_url?: string;
    website?: string;
  }[];
}

// Form Data Models
interface BaseEventFormFields {
  name: string;
  description: string;
  location: string;
  target_audience: string;
  cover_image?: string;
  gallery_images?: string[];
  isFreeEvent?: boolean;
  price?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: Date;
  paymentMethods?: PaymentMethod[];
  hasSlotLimit?: boolean;
  slotLimit?: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  targetAudience: string;
  image?: string;
  hasSlotLimit?: boolean;
  slotLimit?: number;
  hasCutOffTime?: boolean;
  cutOffTime?: Date;
  gunStartTime?: Date;
  price?: number;
  earlyBirdPrice?: number;
}

export enum StaffRole {
  RACE_DIRECTOR = "RACE_DIRECTOR",
  MARSHAL = "MARSHAL",
  VOLUNTEER = "VOLUNTEER",
  MEDICAL_STAFF = "MEDICAL_STAFF",
  SECURITY = "SECURITY",
  OTHER = "OTHER"
}

export interface EventFormData extends BaseEventFormFields {
  date: Date | undefined;
  time: Date | undefined;
  categories?: CategoryFormData[];
  organization_id?: string;
  event_staff: {
    user_id: string;
    name: string;
    email: string;
    role_in_event: StaffRole;
    responsibilities: string;
  }[];
  sponsors: {
    name: string;
    logo_url?: string;
    website?: string;
  }[];
  cutOffTime?: Date;
  gunStartTime?: Date;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
}

export const eventFormSteps: EventStepType[] = [
  { 
    name: "Basic Information", 
    fields: ["name", "location", "date", "time"] 
  },
  { 
    name: "Details & Description", 
    fields: ["description", "target_audience"] 
  },
  { 
    name: "Organization & Staff", 
    fields: ["organization_id", "event_staff"] 
  },
  { 
    name: "Categories", 
    fields: ["categories"] 
  },
  { 
    name: "Payment", 
    fields: ["isFreeEvent", "price", "earlyBirdPrice", "earlyBirdEndDate"] 
  },
  { 
    name: "Sponsors", 
    fields: ["sponsors"] 
  },
  { 
    name: "Media & Images", 
    fields: ["cover_image", "gallery_images"] 
  },
  { 
    name: "Review & Create", 
    fields: [] 
  }
]; 