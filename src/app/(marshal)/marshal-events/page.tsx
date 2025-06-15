"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryManagementDialog } from "./components/category-management-dialog";
import { EventDetailsDialog } from "./components/event-details-dialog";
import { EventPaymentForm } from "./components/event-payment-form";
import { OrganizationStaffForm } from "./components/organization-staff-form";
import { SponsorsForm } from "./components/sponsors-form";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EventCard } from "./components/event-card";
import { EventsDisplay } from "./components/events-display";
import { Event, EventFormData, EventCategory, CategoryFormData, StaffRole, EventStepType, eventFormSteps } from "@/app/(marshal)/marshal-events/types";
import { StepBasicInfo } from "./components/steps/StepBasicInfo";
import { StepCategories } from "./components/steps/StepCategories";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Eye,
  Edit,
  UserPlus,
  Award,
  Flag,
  Images,
  MapPin,
  Clock,
  Users,
  Calendar as CalendarIcon
} from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [currentEditStep, setCurrentEditStep] = useState(0);
  
  // Form states
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    name: "",
    description: "",
    date: undefined,
    time: undefined,
    location: "",
    target_audience: "",
    cover_image: "",
    gallery_images: [],
    categories: [],
    paymentMethods: [],
    event_staff: [],
    sponsors: []
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    targetAudience: "",
    image: ""
  });

  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const router = useRouter();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // API Functions
  const fetchEvents = async () => {
    try {
      setIsPageLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const eventsData = await response.json();
      console.log('Raw API Response:', eventsData);

      // Transform the data to match the Event interface
      const transformedEvents = eventsData.map((event: any) => {
        console.log('Raw event data:', event);
        console.log('Processing event:', event.name, {
          has_slot_limit: event.has_slot_limit,
          slot_limit: event.slot_limit,
          categories: event.categories?.map((cat: any) => ({
            name: cat.name,
            has_slot_limit: cat.has_slot_limit,
            slot_limit: cat.slot_limit,
            participants: cat.participants
          }))
        });

        return {
          ...event,
          has_slot_limit: event.has_slot_limit ?? false,
          slot_limit: event.slot_limit ?? null,
          categories: event.categories?.map((cat: any) => ({
            ...cat,
            has_slot_limit: cat.has_slot_limit ?? false,
            slot_limit: cat.slot_limit ?? null
          }))
        };
      });

      console.log('Transformed Events:', transformedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsPageLoading(false);
    }
  };

  const createEvent = async (eventData: EventFormData) => {
    console.log('Creating event with data:', eventData);
    
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date ? format(eventData.date, 'yyyy-MM-dd') : '',
        time: eventData.time ? format(eventData.time, 'HH:mm') : '',
        location: eventData.location,
        target_audience: eventData.target_audience,
        cover_image: eventData.cover_image,
        gallery_images: eventData.gallery_images,
        isFreeEvent: eventData.isFreeEvent,
        price: eventData.price,
        earlyBirdPrice: eventData.earlyBirdPrice,
        earlyBirdEndDate: eventData.earlyBirdEndDate ? format(eventData.earlyBirdEndDate, 'yyyy-MM-dd') : undefined,
        paymentMethods: eventData.paymentMethods,
        hasSlotLimit: eventData.hasSlotLimit,
        slotLimit: eventData.slotLimit,
        event_staff: eventData.event_staff,
        sponsors: eventData.sponsors,
        registrationStartDate: eventData.registrationStartDate ? format(eventData.registrationStartDate, 'yyyy-MM-dd') : undefined,
        registrationEndDate: eventData.registrationEndDate ? format(eventData.registrationEndDate, 'yyyy-MM-dd') : undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    const createdEvent = await response.json();
    console.log('Event created successfully:', createdEvent);

    // Create categories if any exist
    if (eventData.categories && eventData.categories.length > 0) {
      console.log('Creating categories:', eventData.categories);
      
      const categoryPromises = [];
      
      for (const category of eventData.categories) {
        if (category.name.trim()) { // Only create categories with names
          console.log('Creating category:', category);
          
          const categoryPromise = fetch(`/api/events/${createdEvent.id}/categories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: category.name,
              description: category.description,
              targetAudience: category.targetAudience,
              image: category.image,
              hasSlotLimit: category.hasSlotLimit,
              slotLimit: category.slotLimit,
              price: category.price,
              earlyBirdPrice: category.earlyBirdPrice
            }),
          }).then(async (categoryResponse) => {
            if (!categoryResponse.ok) {
              const categoryError = await categoryResponse.json();
              console.error('Error creating category:', categoryError);
              throw new Error(`Failed to create category "${category.name}": ${categoryError.error}`);
            }
            const createdCategory = await categoryResponse.json();
            console.log('Category created successfully:', createdCategory);
            return createdCategory;
          });
          
          categoryPromises.push(categoryPromise);
        }
      }
      
      // Wait for all categories to be created
      try {
        const createdCategories = await Promise.all(categoryPromises);
        console.log('All categories created:', createdCategories);
        
        // Fetch the updated event with categories
        const updatedResponse = await fetch(`/api/events/${createdEvent.id}`);
        if (updatedResponse.ok) {
          const updatedEvent = await updatedResponse.json();
          console.log('Updated event with categories:', updatedEvent);
          return updatedEvent;
        } else {
          console.warn('Failed to fetch updated event, returning original event');
          return createdEvent;
        }
      } catch (categoryError) {
        console.error('Error creating categories:', categoryError);
        // Don't fail the entire event creation if categories fail
        const errorMessage = categoryError instanceof Error ? categoryError.message : 'Unknown error occurred';
        toast.error(`Event created but some categories failed: ${errorMessage}`);
        return createdEvent;
      }
    }

    console.log('No categories to create, returning event');
    return createdEvent;
  };

  const updateEvent = async (eventId: string, eventData: EventFormData) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date ? format(eventData.date, 'yyyy-MM-dd') : '',
        time: eventData.time ? format(eventData.time, 'HH:mm') : '',
        location: eventData.location,
        target_audience: eventData.target_audience,
        cover_image: eventData.cover_image,
        gallery_images: eventData.gallery_images,
        isFreeEvent: eventData.isFreeEvent,
        price: eventData.price,
        earlyBirdPrice: eventData.earlyBirdPrice,
        earlyBirdEndDate: eventData.earlyBirdEndDate ? format(eventData.earlyBirdEndDate, 'yyyy-MM-dd') : undefined,
        paymentMethods: eventData.paymentMethods,
        hasSlotLimit: eventData.hasSlotLimit,
        slotLimit: eventData.slotLimit,
        event_staff: eventData.event_staff,
        sponsors: eventData.sponsors,
        registrationStartDate: eventData.registrationStartDate ? format(eventData.registrationStartDate, 'yyyy-MM-dd') : undefined,
        registrationEndDate: eventData.registrationEndDate ? format(eventData.registrationEndDate, 'yyyy-MM-dd') : undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    const updatedEvent = await response.json();

    // Note: For now, we're not updating categories during event edit
    // Categories should be managed separately through the category management dialog
    // This prevents accidental deletion of categories with participants

    return updatedEvent;
  };

  const deleteEvent = async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }

    return response.json();
  };

  const addCategoryToEvent = async (eventId: string, categoryData: CategoryFormData) => {
    const response = await fetch(`/api/events/${eventId}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        targetAudience: categoryData.targetAudience,
        image: categoryData.image,
        hasSlotLimit: categoryData.hasSlotLimit,
        slotLimit: categoryData.slotLimit,
        price: categoryData.price,
        earlyBirdPrice: categoryData.earlyBirdPrice
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add category');
    }

    return response.json();
  };

  const updateCategory = async (eventId: string, categoryId: string, categoryData: CategoryFormData) => {
    const response = await fetch(`/api/events/${eventId}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        targetAudience: categoryData.targetAudience,
        image: categoryData.image,
        hasSlotLimit: categoryData.hasSlotLimit,
        slotLimit: categoryData.slotLimit,
        price: categoryData.price,
        earlyBirdPrice: categoryData.earlyBirdPrice
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    return response.json();
  };

  const deleteCategoryFromEvent = async (eventId: string, categoryId: string) => {
    const response = await fetch(`/api/events/${eventId}/categories/${categoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }

    return response.json();
  };

  // Filter events based on search query, tab, and filter status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter based on active tab
    const matchesTab = 
      (activeTab === "upcoming" && new Date(event.date) >= new Date()) || 
      (activeTab === "past" && new Date(event.date) < new Date()) ||
      (activeTab === "all");
    
    // Filter based on status
    const matchesStatus = filterStatus === "all" || event.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  // Multi-step form navigation functions for create
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepFields = eventFormSteps[currentStep].fields;
    
    switch (currentStep) {
      case 0: // Basic Information
        if (!eventFormData.name.trim()) {
          toast.error("Event name is required");
          return false;
        }
        if (!eventFormData.location.trim()) {
          toast.error("Location is required");
          return false;
        }
        if (!eventFormData.date) {
          toast.error("Event date is required");
          return false;
        }
        if (!eventFormData.time) {
          toast.error("Event time is required");
          return false;
        }
        // Validate that event date is in the future
        const eventDateTime = new Date(eventFormData.date);
        eventDateTime.setHours(eventFormData.time.getHours());
        eventDateTime.setMinutes(eventFormData.time.getMinutes());
        if (eventDateTime <= new Date()) {
          toast.error("Event date and time must be in the future");
          return false;
        }
        return true;
      
      case 1: // Details & Description
        if (!eventFormData.description.trim()) {
          toast.error("Event description is required");
          return false;
        }
        if (!eventFormData.target_audience.trim()) {
          toast.error("Target audience is required");
          return false;
        }
        return true;
      
      case 2: // Organization & Staff
        // Both organization and staff are optional
        return true;
      
      case 3: // Categories
        // If categories exist, validate each category
        if (eventFormData.categories && eventFormData.categories.length > 0) {
          for (const category of eventFormData.categories) {
            if (!category.name.trim()) {
              toast.error("Category name is required");
              return false;
            }
            if (!category.description.trim()) {
              toast.error("Category description is required");
              return false;
            }
            if (!category.targetAudience.trim()) {
              toast.error("Category target audience is required");
              return false;
            }
            // Validate slot limit if enabled
            if (category.hasSlotLimit && (!category.slotLimit || category.slotLimit <= 0)) {
              toast.error(`Please specify a valid slot limit for category "${category.name}"`);
              return false;
            }
          }
        }
        return true;
      
      case 4: // Payment
        if (!eventFormData.isFreeEvent) {
          // Validate payment methods
          if (!eventFormData.paymentMethods || eventFormData.paymentMethods.length === 0) {
            toast.error("Please add at least one payment method");
            return false;
          }
          // Validate each payment method
          for (const method of eventFormData.paymentMethods) {
            if (!method.name.trim()) {
              toast.error("Payment method name is required");
              return false;
            }
            if (!method.value) {
              toast.error(`Please provide the ${method.type === 'account_number' ? 'account number' : 'QR code'} for ${method.name}`);
              return false;
            }
          }

          // Validate category prices if categories exist
          if (eventFormData.categories && eventFormData.categories.length > 0) {
            for (const category of eventFormData.categories) {
              if (category.price === undefined || category.price < 0) {
                toast.error(`Please specify a valid price for category "${category.name}"`);
                return false;
              }
              // Validate early bird price if specified
              if (category.earlyBirdPrice !== undefined) {
                if (category.earlyBirdPrice < 0) {
                  toast.error(`Early bird price cannot be negative for category "${category.name}"`);
                  return false;
                }
                if (category.earlyBirdPrice >= category.price!) {
                  toast.error(`Early bird price must be less than regular price for category "${category.name}"`);
                  return false;
                }
              }
            }
          }

          // Validate early bird settings
          if (eventFormData.earlyBirdPrice !== undefined) {
            if (eventFormData.earlyBirdPrice < 0) {
              toast.error("Early bird price cannot be negative");
              return false;
            }
            if (!eventFormData.earlyBirdEndDate) {
              toast.error("Early bird end date is required when early bird price is set");
              return false;
            }
            if (eventFormData.earlyBirdEndDate <= new Date()) {
              toast.error("Early bird end date must be in the future");
              return false;
            }
            if (eventFormData.earlyBirdEndDate >= eventFormData.date!) {
              toast.error("Early bird end date must be before the event date");
              return false;
            }
          }
        }
        return true;
      
      case 5: // Sponsors
        if (!eventFormData.sponsors || eventFormData.sponsors.length === 0) {
          toast.error("Please add at least one sponsor");
          return false;
        }
        return true;
      
      case 6: // Media & Images
        // Cover image is optional
        if (eventFormData.gallery_images && eventFormData.gallery_images.length > 6) {
          toast.error("Maximum of 6 gallery images allowed");
          return false;
        }
        return true;
      
      case 7: // Review & Create
        return validateEventForm();
      
      default:
        return true;
    }
  };

  const validateEventForm = (): boolean => {
    // Basic Information
    if (!eventFormData.name.trim()) return false;
    if (!eventFormData.location.trim()) return false;
    if (!eventFormData.date) return false;
    if (!eventFormData.time) return false;

    // Details & Description
    if (!eventFormData.description.trim()) return false;
    if (!eventFormData.target_audience.trim()) return false;

    // Categories (if any)
    if (eventFormData.categories && eventFormData.categories.length > 0) {
      for (const category of eventFormData.categories) {
        if (!category.name.trim()) return false;
        if (!category.description.trim()) return false;
        if (!category.targetAudience.trim()) return false;
        if (category.hasSlotLimit && (!category.slotLimit || category.slotLimit <= 0)) return false;
        if (!eventFormData.isFreeEvent) {
          if (category.price === undefined || category.price < 0) return false;
          if (category.earlyBirdPrice !== undefined) {
            if (category.earlyBirdPrice < 0) return false;
            if (category.earlyBirdPrice >= category.price!) return false;
          }
        }
      }
    }

    // Payment
    if (!eventFormData.isFreeEvent) {
      if (!eventFormData.paymentMethods || eventFormData.paymentMethods.length === 0) return false;
      for (const method of eventFormData.paymentMethods) {
        if (!method.name.trim()) return false;
        if (!method.value) return false;
      }
      if (eventFormData.earlyBirdPrice !== undefined) {
        if (eventFormData.earlyBirdPrice < 0) return false;
        if (!eventFormData.earlyBirdEndDate) return false;
        if (eventFormData.earlyBirdEndDate <= new Date()) return false;
        if (eventFormData.earlyBirdEndDate >= eventFormData.date!) return false;
      }
    }

    // Gallery images validation
    if (eventFormData.gallery_images && eventFormData.gallery_images.length > 6) return false;

    return true;
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      // If we're on the last step, submit the form
      if (currentStep === eventFormSteps.length - 1) {
        handleCreateEvent();
        return;
      }
      
      // Otherwise move to next step
      setCurrentStep(prev => Math.min(prev + 1, eventFormSteps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Function to check if a step is complete
  const isStepComplete = (stepIndex: number): boolean => {
    if (stepIndex >= currentStep) return false;
    
    const stepFields = eventFormSteps[stepIndex].fields;
    return stepFields.every((field: string) => {
      switch (field) {
        case 'name':
          return eventFormData.name.trim() !== '';
        case 'location':
          return eventFormData.location.trim() !== '';
        case 'date':
          return eventFormData.date !== undefined;
        case 'time':
          return eventFormData.time !== undefined;
        case 'description':
          return true; // Optional field
        case 'target_audience':
          return true; // Optional field
        case 'categories':
          return true; // Optional field
        case 'cover_image':
          return true; // Optional field
        case 'gallery_images':
          return true; // Optional field
        default:
          return true;
      }
    });
  };

  // Function to navigate to a specific step if it's a previous completed step
  const goToStep = (stepIndex: number) => {
    // Allow going to previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Multi-step form navigation functions for edit
  const validateCurrentEditStep = async (): Promise<boolean> => {
    const currentStepFields = eventFormSteps[currentEditStep].fields;
    
    switch (currentEditStep) {
      case 0: // Basic Information
        if (!eventFormData.name.trim()) {
          toast.error("Event name is required");
          return false;
        }
        if (!eventFormData.location.trim()) {
          toast.error("Location is required");
          return false;
        }
        if (!eventFormData.date) {
          toast.error("Event date is required");
          return false;
        }
        if (!eventFormData.time) {
          toast.error("Event time is required");
          return false;
        }
        return true;
      
      case 1: // Details & Description
        // Description and target audience are optional, so always valid
        return true;
      
      case 2: // Organization & Staff
        if (!eventFormData.organization_id?.trim()) {
          toast.error("Organization ID is required");
          return false;
        }
        if (!eventFormData.event_staff || eventFormData.event_staff.length === 0) {
          toast.error("At least one staff member is required");
          return false;
        }
        return true;
      
      case 3: // Categories
        // Categories are optional, so always valid
        return true;
      
      case 4: // Payment
        // Payment details are optional, so always valid
        return true;
      
      case 5: // Sponsors
        if (!eventFormData.sponsors || eventFormData.sponsors.length === 0) {
          toast.error("Please add at least one sponsor");
          return false;
        }
        return true;
      
      case 6: // Media & Images
        // Images are optional, so always valid
        return true;
      
      case 7: // Review & Update
        // Final validation before submission
        return validateEventForm();
      
      default:
        return true;
    }
  };

  const nextEditStep = async () => {
    // Validate current step before proceeding
    const isValid = await validateCurrentEditStep();
    
    if (isValid) {
      // If we're on the last step, submit the form
      if (currentEditStep === eventFormSteps.length - 1) {
        handleEditEvent();
        return;
      }
      
      // Otherwise move to next step
      setCurrentEditStep(prev => Math.min(prev + 1, eventFormSteps.length - 1));
    }
  };

  const prevEditStep = () => {
    setCurrentEditStep(prev => Math.max(prev - 1, 0));
  };

  // Function to check if an edit step is complete
  const isEditStepComplete = (stepIndex: number): boolean => {
    if (stepIndex >= currentEditStep) return false;
    
    const stepFields = eventFormSteps[stepIndex].fields;
    return stepFields.every((field: string) => {
      switch (field) {
        case 'name':
          return eventFormData.name.trim() !== '';
        case 'location':
          return eventFormData.location.trim() !== '';
        case 'date':
          return eventFormData.date !== undefined;
        case 'time':
          return eventFormData.time !== undefined;
        case 'description':
          return true; // Optional field
        case 'target_audience':
          return true; // Optional field
        case 'categories':
          return true; // Optional field
        case 'cover_image':
          return true; // Optional field
        case 'gallery_images':
          return true; // Optional field
        default:
          return true;
      }
    });
  };

  // Function to navigate to a specific edit step if it's a previous completed step
  const goToEditStep = (stepIndex: number) => {
    // Allow going to previous steps or current step
    if (stepIndex <= currentEditStep) {
      setCurrentEditStep(stepIndex);
    }
  };

  // Render step indicators for create form
  const renderStepIndicators = () => (
    <div className="relative flex justify-between mb-4">
      {/* Connecting lines - positioned to align with the center of the circles */}
      <div className="absolute top-[14px] left-[16px] right-[16px] flex items-center">
        <div className="w-full h-[2px] bg-muted-foreground/20">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${Math.max(((currentStep) / (eventFormSteps.length - 1)) * 100, 0)}%` 
            }}
          />
        </div>
      </div>
      
      {/* Step circles */}
      <div className="w-full flex justify-between z-10">
        {eventFormSteps.map((step: EventStepType, index: number) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const canNavigate = index < currentStep;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center ${canNavigate ? 'cursor-pointer' : ''}`}
              onClick={() => canNavigate && goToStep(index)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-0'
                    : isActive
                    ? 'bg-background text-primary ring-2 ring-primary'
                    : 'bg-background border border-muted-foreground/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors text-center max-w-[80px] leading-tight ${
                isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render step indicators for edit form
  const renderEditStepIndicators = () => (
    <div className="relative flex justify-between mb-4">
      {/* Connecting lines - positioned to align with the center of the circles */}
      <div className="absolute top-[14px] left-[16px] right-[16px] flex items-center">
        <div className="w-full h-[2px] bg-muted-foreground/20">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${Math.max(((currentEditStep) / (eventFormSteps.length - 1)) * 100, 0)}%` 
            }}
          />
        </div>
      </div>
      
      {/* Step circles */}
      <div className="w-full flex justify-between z-10">
        {eventFormSteps.map((step: EventStepType, index: number) => {
          const isCompleted = index < currentEditStep;
          const isActive = index === currentEditStep;
          const canNavigate = index < currentEditStep;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center ${canNavigate ? 'cursor-pointer' : ''}`}
              onClick={() => canNavigate && goToEditStep(index)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-0'
                    : isActive
                    ? 'bg-background text-primary ring-2 ring-primary'
                    : 'bg-background border border-muted-foreground/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors text-center max-w-[80px] leading-tight ${
                isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const resetEventForm = () => {
    setEventFormData({
      name: "",
      description: "",
      date: undefined,
      time: undefined,
      location: "",
      target_audience: "",
      cover_image: "",
      gallery_images: [],
      categories: [],
      paymentMethods: [],
      event_staff: [],
      sponsors: [],
      registrationStartDate: undefined,
      registrationEndDate: undefined
    });
    setCurrentStep(0); // Reset to first step
    setCurrentEditStep(0); // Reset edit step too
  };

  // Event CRUD Functions
  const handleCreateEvent = async () => {
    console.log('handleCreateEvent called');
    console.log('Current eventFormData:', eventFormData);
    
    if (!validateEventForm()) {
      console.log('Event form validation failed');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Calling createEvent function...');
      const newEvent = await createEvent(eventFormData);

      console.log('Event creation completed, result:', newEvent);
      
      setEvents(prev => {
        const updatedEvents = [...prev, newEvent];
        console.log('Updated events list:', updatedEvents);
        return updatedEvents;
      });
      

      await fetchEvents();

      resetEventForm();
      setIsCreateEventOpen(false);
      toast.success("Event Created", {
        description: "Your event has been successfully created.",
      });
    } catch (error: any) {
      console.error('Error in handleCreateEvent:', error);
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !validateEventForm()) return;
    
    setIsLoading(true);
    try {
      const updatedEvent = await updateEvent(selectedEvent.id, eventFormData);
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      ));

      resetEventForm();
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      toast.success("Event Updated", {
        description: "Your event has been successfully updated.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      await deleteEvent(selectedEvent.id);
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsDeleteEventOpen(false);
      setSelectedEvent(null);
      toast.success("Event Deleted", {
        description: "The event has been successfully deleted.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Category CRUD Functions
  const handleAddCategory = async () => {
    if (!selectedEvent || !validateCategoryForm()) return;
    
    setIsLoading(true);
    try {
      const newCategory = await addCategoryToEvent(selectedEvent.id, categoryFormData);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: [...(event.categories || []), newCategory]
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: [...(prev.categories || []), newCategory]
      } : prev);

      resetCategoryForm();
      toast.success("Category Added", {
        description: "New category has been successfully added.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedEvent || !editingCategory || !validateCategoryForm()) return;
    
    setIsLoading(true);
    try {
      const updatedCategory = await updateCategory(selectedEvent.id, editingCategory.id, categoryFormData);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: event.categories?.map((cat: EventCategory) => 
                cat.id === editingCategory.id ? updatedCategory : cat
              )
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.map((cat: EventCategory) => 
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      } : prev);

      resetCategoryForm();
      setEditingCategory(null);
      toast.success("Category Updated", {
        description: "Category has been successfully updated.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedEvent || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      await deleteCategoryFromEvent(selectedEvent.id, selectedCategory.id);

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              categories: event.categories?.filter((cat: EventCategory) => cat.id !== selectedCategory.id)
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.filter((cat: EventCategory) => cat.id !== selectedCategory.id)
      } : prev);

      setIsDeleteCategoryOpen(false);
      setSelectedCategory(null);
      toast.success("Category Deleted", {
        description: "Category has been successfully deleted.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const validateCategoryForm = (): boolean => {
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required.");
      return false;
    }
    return true;
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      targetAudience: "",
      image: ""
    });
  };

  const openCreateEvent = () => {
    resetEventForm();
    setIsCreateEventOpen(true);
  };

  const openEditEvent = (event: Event) => {
    // Parse the time string (HH:MM format) into a Date object
    let timeDate: Date | undefined;
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
    }

    // Map categories properly
    const mappedCategories = event.categories?.map(cat => ({
      name: cat.name,
      description: cat.description || "",  // Ensure description is not undefined
      targetAudience: cat.targetAudience || "",  // Ensure targetAudience is not undefined
      image: cat.image || "",
      price: (cat as any).price,  // Use type assertion for properties not in the interface
      earlyBirdPrice: (cat as any).earlyBirdPrice
    })) || [];

    setEventFormData({
      name: event.name,
      description: event.description || "",
      date: new Date(event.date),
      time: timeDate,
      location: event.location,
      target_audience: event.target_audience || "",
      cover_image: event.cover_image || "",
      gallery_images: event.gallery_images || [],
      categories: mappedCategories,
      isFreeEvent: (event as any).isFreeEvent,
      price: (event as any).price,
      earlyBirdPrice: (event as any).earlyBirdPrice,
      earlyBirdEndDate: (event as any).earlyBirdEndDate ? new Date((event as any).earlyBirdEndDate) : undefined,
      paymentMethods: (event as any).paymentMethods || [],
      hasSlotLimit: (event as any).has_slot_limit,
      slotLimit: (event as any).slot_limit ?? undefined,
      event_staff: ((event as any).event_staff || []).map((staff: any) => ({
        user_id: staff.user_id,
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        role_in_event: staff.role_in_event,
        responsibilities: staff.responsibilities
      })),
      sponsors: (event as any).sponsors || []
    });
    setSelectedEvent(event);
    setCurrentEditStep(0); // Reset to first step
    setIsEditEventOpen(true);
  };

  const openDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteEventOpen(true);
  };

  const openEventDetails = (event: Event) => {
    // Use window.location.href instead of router.push to avoid URL parsing issues
    window.location.href = `/marshal-events/${event.id}`;
  };

  const openCategoryManagement = (event: Event) => {
    setSelectedEvent(event);
    setIsCategoryManagementOpen(true);
    resetCategoryForm();
    setEditingCategory(null);
  };

  const openEditCategory = (category: EventCategory) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      targetAudience: category.targetAudience || "",
      image: category.image || ""
    });
    setEditingCategory(category);
  };

  const openDeleteCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleManageStaff = (event: Event) => {
    // This would open a staff management dialog
    toast.info("Staff management feature coming soon.");
  };

  const handleCategoryFormChange = (data: Partial<CategoryFormData>) => {
    setCategoryFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const hasEventFormProgress = () => {
    // Check if any field in eventFormData is filled (customize as needed)
    return Object.values(eventFormData).some(
      (value) =>
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === "string" && value.trim() !== "") ||
        (typeof value === "number" && value !== 0) ||
        (typeof value === "object" && value !== null && !(value instanceof Date))
    );
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Create, view and manage race events for STI Race Connect.
          </p>
        </div>
        <Button onClick={openCreateEvent} className="flex gap-2">
          <Plus size={16} /> Create Event
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter size={16} /> 
                {filterStatus === "all" ? "All Statuses" : 
                 filterStatus === "upcoming" ? "Upcoming" : 
                 filterStatus === "active" ? "Active" : 
                 filterStatus === "completed" ? "Completed" : "Filter"}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("upcoming")}>
                Upcoming
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          <EventsDisplay 
            events={filteredEvents as any} 
            onManageCategories={openCategoryManagement as any}
            onEditEvent={openEditEvent as any}
            onDeleteEvent={openDeleteEvent as any}
            onViewDetails={openEventDetails as any}
            onManageStaff={handleManageStaff as any}
          />
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <EventsDisplay 
            events={filteredEvents as any} 
            onManageCategories={openCategoryManagement as any}
            onEditEvent={openEditEvent as any}
            onDeleteEvent={openDeleteEvent as any}
            onViewDetails={openEventDetails as any}
            onManageStaff={handleManageStaff as any}
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <EventsDisplay 
            events={filteredEvents as any} 
            onManageCategories={openCategoryManagement as any}
            onEditEvent={openEditEvent as any}
            onDeleteEvent={openDeleteEvent as any}
            onViewDetails={openEventDetails as any}
            onManageStaff={handleManageStaff as any}
          />
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog - Multi-step */}
      <Dialog
        open={isCreateEventOpen}
        onOpenChange={(open) => {
          if (!open && hasEventFormProgress()) {
            setShowCloseConfirm(true);
          } else {
            setIsCreateEventOpen(open);
            if (!open) resetEventForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col z-50">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              {eventFormSteps[currentStep].name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicators */}
          <div className="px-6 pb-4">
            {renderStepIndicators()}
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 py-2">
              {/* Step 1: Basic Information */}
              {currentStep === 0 && (
                <StepBasicInfo 
                  eventFormData={eventFormData}
                  setEventFormData={setEventFormData}
                />
              )}

              {/* Step 2: Details & Description */}
              {currentStep === 1 && (
                <>
              <div className="space-y-2">
                <Label htmlFor="target-audience">
                  Target Audience <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="target-audience" 
                      placeholder="e.g., All ages, Professionals, Elite runners" 
                  value={eventFormData.target_audience}
                  onChange={(e) => setEventFormData((prev: EventFormData) => ({ ...prev, target_audience: e.target.value }))}
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
                  onChange={(e) => setEventFormData((prev: EventFormData) => ({ ...prev, description: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      A good description helps participants understand what to expect
                    </p>
              </div>
                </>
              )}

              {/* Step 3: Organization & Staff */}
              {currentStep === 2 && (
                <OrganizationStaffForm
                  organizationId={eventFormData.organization_id}
                  eventStaff={eventFormData.event_staff || []}
                  onOrganizationChange={(value) => setEventFormData((prev: EventFormData) => ({ ...prev, organization_id: value }))}
                  onStaffChange={(staff) => setEventFormData((prev: EventFormData) => ({ ...prev, event_staff: staff }))}
                                  />
              )}

              {/* Step 4: Categories */}
              {currentStep === 3 && (
                <StepCategories
                  eventFormData={eventFormData}
                  setEventFormData={setEventFormData}
                />
              )}

              {/* Step 5: Payment */}
              {currentStep === 4 && (
                <EventPaymentForm
                  isFreeEvent={eventFormData.isFreeEvent || false}
                  price={eventFormData.price}
                  earlyBirdPrice={eventFormData.earlyBirdPrice}
                  earlyBirdEndDate={eventFormData.earlyBirdEndDate}
                  categories={eventFormData.categories}
                  paymentMethods={eventFormData.paymentMethods}
                  onFreeEventChange={(value: boolean) => setEventFormData((prev: EventFormData) => ({ ...prev, isFreeEvent: value }))}
                  onPriceChange={(value: number | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, price: value }))}
                  onEarlyBirdPriceChange={(value: number | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, earlyBirdPrice: value }))}
                  onEarlyBirdEndDateChange={(date: Date | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, earlyBirdEndDate: date }))}
                  onCategoryPriceChange={(index: number, price: number | undefined) => {
                    setEventFormData((prev: EventFormData) => ({
                      ...prev,
                      categories: prev.categories?.map((cat: CategoryFormData, i: number) => 
                        i === index ? { ...cat, price } : cat
                      )
                    }));
                  }}
                  onCategoryEarlyBirdPriceChange={(index: number, price: number | undefined) => {
                    setEventFormData((prev: EventFormData) => ({
                      ...prev,
                      categories: prev.categories?.map((cat: CategoryFormData, i: number) => 
                        i === index ? { ...cat, earlyBirdPrice: price } : cat
                      )
                    }));
                  }}
                  onPaymentMethodsChange={(methods) => setEventFormData((prev: EventFormData) => ({ ...prev, paymentMethods: methods }))}
                />
              )}

              {/* Step 6: Sponsors */}
              {currentStep === 5 && (
                <SponsorsForm
                  sponsors={eventFormData.sponsors || []}
                  onSponsorsChange={(sponsors) => setEventFormData((prev: EventFormData) => ({ ...prev, sponsors }))}
                />
              )}

              {/* Step 7: Media & Images */}
              {currentStep === 6 && (
                <>
                  <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Featured Image <span className="text-destructive">*</span>
                </Label>
                <div className="w-full">
                  <ImageUpload 
                    variant="featured"
                    onChange={(value) => setEventFormData((prev: EventFormData) => ({ ...prev, cover_image: value as string }))}
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
                    onChange={(value) => setEventFormData((prev: EventFormData) => ({ ...prev, gallery_images: value as string[] }))}
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
                </>
              )}

              {/* Step 8: Review & Create */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Review your event details before creating. You can go back to any step to make changes.
                  </p>
                  
                  {/* Basic Information Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Event Name</h4>
                        <p className="text-sm">{eventFormData.name || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Location</h4>
                        <p className="text-sm">{eventFormData.location || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Date</h4>
                        <p className="text-sm">
                          {eventFormData.date ? format(eventFormData.date, 'PPP') : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Time</h4>
                        <p className="text-sm">
                          {eventFormData.time ? format(eventFormData.time, 'p') : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Registration Start</h4>
                        <p className="text-sm">
                          {eventFormData.registrationStartDate ? format(eventFormData.registrationStartDate, 'PPP') : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Registration End</h4>
                        <p className="text-sm">
                          {eventFormData.registrationEndDate ? format(eventFormData.registrationEndDate, 'PPP') : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>
                    <div>
                      <h4 className="text-sm font-medium">Target Audience</h4>
                      <p className="text-sm">{eventFormData.target_audience || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm line-clamp-3">{eventFormData.description || "No description provided"}</p>
                    </div>
                  </div>
                  
                  {/* Categories Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Categories</h3>
                    {eventFormData.categories && eventFormData.categories.length > 0 ? (
                      <div className="space-y-3">
                        {eventFormData.categories.map((category: CategoryFormData, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <h4 className="text-sm font-medium">Category Name</h4>
                                <p className="text-sm">{category.name || "Unnamed category"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Target Audience</h4>
                                <p className="text-sm">{category.targetAudience || "Not specified"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="text-sm font-medium">Description</h4>
                                <p className="text-sm">{category.description || "No description"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Image</h4>
                                <p className="text-sm">{category.image ? "Uploaded" : "Not provided"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">No categories added</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Categories will be created and linked to the event after the event is successfully created.
                    </p>
                  </div>
                  
                  {/* Payment Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Information</h3>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Event Type</h4>
                        <Badge variant={eventFormData.isFreeEvent ? "secondary" : "default"}>
                          {eventFormData.isFreeEvent ? "Free Event" : "Paid Event"}
                        </Badge>
                      </div>

                      {!eventFormData.isFreeEvent && (
                        <>
                          {eventFormData.categories && eventFormData.categories.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Category Prices</h4>
                              <div className="grid gap-3">
                                {eventFormData.categories.map((category: CategoryFormData, index: number) => (
                                  <div key={index} className="grid grid-cols-2 gap-2 border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                      <p className="text-sm font-medium">{category.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Regular Price:</span>
                                        <span className="font-medium">₱{category.price?.toFixed(2) || "0.00"}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Early Bird Price:</span>
                                        <span className="font-medium">₱{category.earlyBirdPrice?.toFixed(2) || "0.00"}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Regular Price:</span>
                                  <span className="font-medium">₱{eventFormData.price?.toFixed(2) || "0.00"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Early Bird Price:</span>
                                  <span className="font-medium">₱{eventFormData.earlyBirdPrice?.toFixed(2) || "0.00"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {eventFormData.earlyBirdEndDate && (
                            <div className="pt-2">
                              <h4 className="text-sm font-medium mb-1">Early Bird Deadline</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(eventFormData.earlyBirdEndDate, 'PPP')}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Sponsors Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Sponsors</h3>
                    {eventFormData.sponsors && eventFormData.sponsors.length > 0 ? (
                      <div className="space-y-3">
                        {eventFormData.sponsors.map((sponsor: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <h4 className="text-sm font-medium">Sponsor Name</h4>
                                <p className="text-sm">{sponsor.name || "Unnamed sponsor"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Sponsor Image</h4>
                                <p className="text-sm">{sponsor.logo_url ? "Uploaded" : "Not provided"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">No sponsors added</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Sponsors will be added and linked to the event after the event is successfully created.
                    </p>
                  </div>
                  
                  {/* Media Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Featured Image</h4>
                        <p className="text-sm">{eventFormData.cover_image ? "Uploaded" : "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Gallery Images</h4>
                        <p className="text-sm">
                          {eventFormData.gallery_images && eventFormData.gallery_images.length > 0 
                            ? `${eventFormData.gallery_images.length} image(s) uploaded` 
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Methods Summary */}
                  {!eventFormData.isFreeEvent && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Methods</h3>
                      <div className="space-y-3">
                        {eventFormData.paymentMethods && eventFormData.paymentMethods.length > 0 ? (
                          eventFormData.paymentMethods.map((method: any) => (
                            <div key={method.id} className="border rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <h4 className="text-sm font-medium">Method Name</h4>
                                  <p className="text-sm">{method.name || "Unnamed method"}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Type</h4>
                                  <p className="text-sm capitalize">{method.type.replace('_', ' ')}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-medium">
                                    {method.type === 'account_number' ? 'Account Number' : 'Payment Image'}
                                  </h4>
                                  {method.type === 'account_number' ? (
                                    <p className="text-sm font-mono">{method.value || "Not provided"}</p>
                                  ) : (
                                    <p className="text-sm">{method.value ? "Uploaded" : "Not provided"}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">No payment methods added</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (currentStep === 0) {
                    setIsCreateEventOpen(false);
                  } else {
                    prevStep();
                  }
                }}
              >
                {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>
              
              <Button 
                onClick={nextStep} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && currentStep === eventFormSteps.length - 1 ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : currentStep === eventFormSteps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Create Event
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog - Multi-step */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              {eventFormSteps[currentEditStep].name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicators */}
          <div className="px-6 pb-4">
            {renderEditStepIndicators()}
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 py-2">
              {/* Step 1: Basic Information */}
              {currentEditStep === 0 && (
                <StepBasicInfo 
                  eventFormData={eventFormData}
                  setEventFormData={setEventFormData}
                />
              )}

              {/* Step 2: Details & Description */}
              {currentEditStep === 1 && (
                <>
              <div className="space-y-2">
                <Label htmlFor="edit-target-audience">
                  Target Audience
                </Label>
                <Input 
                  id="edit-target-audience" 
                      placeholder="e.g., All ages, Professionals, Elite runners" 
                  value={eventFormData.target_audience}
                  onChange={(e) => setEventFormData((prev: EventFormData) => ({ ...prev, target_audience: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      Specify who this event is designed for (optional)
                    </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">
                      Event Description
                </Label>
                <Textarea
                  id="edit-description"
                      placeholder="Provide a detailed description of the event, including what participants can expect, race categories, prizes, etc."
                      rows={6}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData((prev: EventFormData) => ({ ...prev, description: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      A good description helps participants understand what to expect (optional)
                    </p>
              </div>
                </>
              )}

              {/* Step 3: Organization & Staff */}
              {currentEditStep === 2 && (
                <OrganizationStaffForm
                  organizationId={eventFormData.organization_id}
                  eventStaff={eventFormData.event_staff || []}
                  onOrganizationChange={(value) => setEventFormData((prev: EventFormData) => ({ ...prev, organization_id: value }))}
                  onStaffChange={(staff) => setEventFormData((prev: EventFormData) => ({ ...prev, event_staff: staff }))}
                                  />
              )}

              {/* Step 4: Categories */}
              {currentEditStep === 3 && (
                <StepCategories
                  eventFormData={eventFormData}
                  setEventFormData={setEventFormData}
                />
              )}

              {/* Step 5: Payment */}
              {currentEditStep === 4 && (
                <EventPaymentForm
                  isFreeEvent={eventFormData.isFreeEvent || false}
                  price={eventFormData.price}
                  earlyBirdPrice={eventFormData.earlyBirdPrice}
                  earlyBirdEndDate={eventFormData.earlyBirdEndDate}
                  categories={eventFormData.categories}
                  paymentMethods={eventFormData.paymentMethods}
                  onFreeEventChange={(value: boolean) => setEventFormData((prev: EventFormData) => ({ ...prev, isFreeEvent: value }))}
                  onPriceChange={(value: number | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, price: value }))}
                  onEarlyBirdPriceChange={(value: number | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, earlyBirdPrice: value }))}
                  onEarlyBirdEndDateChange={(date: Date | undefined) => setEventFormData((prev: EventFormData) => ({ ...prev, earlyBirdEndDate: date }))}
                  onCategoryPriceChange={(index: number, price: number | undefined) => {
                    setEventFormData((prev: EventFormData) => ({
                      ...prev,
                      categories: prev.categories?.map((cat: CategoryFormData, i: number) => 
                        i === index ? { ...cat, price } : cat
                      )
                    }));
                  }}
                  onCategoryEarlyBirdPriceChange={(index: number, price: number | undefined) => {
                    setEventFormData((prev: EventFormData) => ({
                      ...prev,
                      categories: prev.categories?.map((cat: CategoryFormData, i: number) => 
                        i === index ? { ...cat, earlyBirdPrice: price } : cat
                      )
                    }));
                  }}
                  onPaymentMethodsChange={(methods) => setEventFormData((prev: EventFormData) => ({ ...prev, paymentMethods: methods }))}
                />
              )}

              {/* Step 6: Sponsors */}
              {currentEditStep === 5 && (
                <SponsorsForm
                  sponsors={eventFormData.sponsors || []}
                  onSponsorsChange={(sponsors) => setEventFormData(prev => ({ ...prev, sponsors }))}
                />
              )}

              {/* Step 7: Media & Images */}
              {currentEditStep === 6 && (
                <>
                  <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Featured Image
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
                          Upload a featured image that will be displayed as the main event photo. This helps make your event more attractive to participants.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Gallery Images
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
                </>
              )}

              {/* Step 8: Review & Update */}
              {currentEditStep === 7 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Review your event changes before updating. You can go back to any step to make changes.
                  </p>
                  
                  {/* Basic Information Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Event Name</h4>
                        <p className="text-sm">{eventFormData.name || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Location</h4>
                        <p className="text-sm">{eventFormData.location || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Date</h4>
                        <p className="text-sm">
                          {eventFormData.date ? format(eventFormData.date, 'PPP') : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Time</h4>
                        <p className="text-sm">
                          {eventFormData.time ? format(eventFormData.time, 'p') : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Registration Start</h4>
                        <p className="text-sm">
                          {eventFormData.registrationStartDate ? format(eventFormData.registrationStartDate, 'PPP') : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Registration End</h4>
                        <p className="text-sm">
                          {eventFormData.registrationEndDate ? format(eventFormData.registrationEndDate, 'PPP') : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>
                    <div>
                      <h4 className="text-sm font-medium">Target Audience</h4>
                      <p className="text-sm">{eventFormData.target_audience || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm line-clamp-3">{eventFormData.description || "No description provided"}</p>
                    </div>
                  </div>
                  
                  {/* Categories Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Categories</h3>
                    {eventFormData.categories && eventFormData.categories.length > 0 ? (
                      <div className="space-y-3">
                        {eventFormData.categories.map((category, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <h4 className="text-sm font-medium">Category Name</h4>
                                <p className="text-sm">{category.name || "Unnamed category"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Target Audience</h4>
                                <p className="text-sm">{category.targetAudience || "Not specified"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="text-sm font-medium">Description</h4>
                                <p className="text-sm">{category.description || "No description"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Image</h4>
                                <p className="text-sm">{category.image ? "Uploaded" : "Not provided"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">No categories added</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Note: Categories are managed separately and will not be updated during event editing. Use the "Manage Categories" option to add, edit, or remove categories.
                    </p>
                  </div>
                  
                  {/* Media Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Featured Image</h4>
                        <p className="text-sm">{eventFormData.cover_image ? "Uploaded" : "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Gallery Images</h4>
                        <p className="text-sm">
                          {eventFormData.gallery_images && eventFormData.gallery_images.length > 0 
                            ? `${eventFormData.gallery_images.length} image(s) uploaded` 
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Methods Summary */}
                  {!eventFormData.isFreeEvent && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Methods</h3>
                      <div className="space-y-3">
                        {eventFormData.paymentMethods && eventFormData.paymentMethods.length > 0 ? (
                          eventFormData.paymentMethods.map((method) => (
                            <div key={method.id} className="border rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <h4 className="text-sm font-medium">Method Name</h4>
                                  <p className="text-sm">{method.name || "Unnamed method"}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Type</h4>
                                  <p className="text-sm capitalize">{method.type.replace('_', ' ')}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-medium">
                                    {method.type === 'account_number' ? 'Account Number' : 'Payment Image'}
                                  </h4>
                                  {method.type === 'account_number' ? (
                                    <p className="text-sm font-mono">{method.value || "Not provided"}</p>
                                  ) : (
                                    <p className="text-sm">{method.value ? "Uploaded" : "Not provided"}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">No payment methods added</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (currentEditStep === 0) {
                    setIsEditEventOpen(false);
                  } else {
                    prevEditStep();
                  }
                }}
              >
                {currentEditStep === 0 ? "Cancel" : "Previous"}
            </Button>
              
              <Button 
                onClick={nextEditStep} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && currentEditStep === eventFormSteps.length - 1 ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : currentEditStep === eventFormSteps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Update Event
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
            </Button>
            </div>
          </DialogFooter>
                    </DialogContent>
                  </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteEventOpen}
        onOpenChange={setIsDeleteEventOpen}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the event "${selectedEvent?.name}" and all its associated data.`}
        onConfirm={handleDeleteEvent}
        confirmText={isLoading ? "Deleting..." : "Delete Event"}
        variant="danger"
        isConfirmLoading={isLoading}
      />

      {/* Event Details Dialog */}
      <EventDetailsDialog
        open={isEventDetailsOpen}
        onOpenChange={setIsEventDetailsOpen}
        event={selectedEvent as any}
      />

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={isCategoryManagementOpen}
        onOpenChange={setIsCategoryManagementOpen}
        event={selectedEvent as any}
        categoryFormData={categoryFormData}
        editingCategory={editingCategory as any}
        isLoading={isLoading}
        onCategoryFormChange={handleCategoryFormChange}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onStartEditCategory={openEditCategory}
        onCancelEdit={resetCategoryForm}
      />

      {/* Delete Category Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteCategoryOpen}
        onOpenChange={setIsDeleteCategoryOpen}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteCategory}
        confirmText={isLoading ? "Deleting..." : "Delete Category"}
        variant="danger"
        isConfirmLoading={isLoading}
      />

      <ConfirmationDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="Discard Event Creation?"
        description="Are you sure you want to close the event creation dialog? All progress will be lost."
        onConfirm={() => {
          setShowCloseConfirm(false);
          setIsCreateEventOpen(false);
          resetEventForm();
        }}
        confirmText="Yes, discard progress"
        cancelText="No, I want to continue"
        variant="danger"
      />
                </div>
  );
} 