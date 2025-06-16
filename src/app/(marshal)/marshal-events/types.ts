export interface PaymentMethod {
  id: string;
  name: string;
  type: 'account_number' | 'image';
  value: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  targetAudience?: string;
  participants: number;
  has_slot_limit: boolean;
  slot_limit: number | null;
  price?: number;
  earlyBirdPrice?: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  target_audience?: string;
  description?: string;
  cover_image?: string;
  gallery_images?: string[];
  categories?: EventCategory[];
  registrationStartDate?: string;
  registrationEndDate?: string;
  created_by: string;
  participants?: number;
  has_slot_limit: boolean;
  slot_limit: number | null;
  cutOffTime?: Date;
  gunStartTime?: Date;
  organization_id?: string;
  isFreeEvent?: boolean;
  price?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  paymentMethods?: PaymentMethod[];
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

export interface EventFormData {
  name: string;
  description: string;
  location: string;
  target_audience: string;
  cover_image?: string;
  gallery_images?: string[];
  date: Date | undefined;
  time: Date | undefined;
  categories?: CategoryFormData[];
  organization_id?: string;
  isFreeEvent?: boolean;
  price?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: Date;
  paymentMethods?: PaymentMethod[];
  hasSlotLimit?: boolean;
  slotLimit?: number;
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

export interface EventStepType {
  name: string;
  fields: string[];
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

// Import and re-export everything from types/index
import * as TypesIndex from './types/index';
export * from './types/index'; 