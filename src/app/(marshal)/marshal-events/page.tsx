"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Search, Plus, Filter, ChevronDown, Eye, Edit, Trash2, UserPlus, Award, Check, X, Images, Flag, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { TimePicker } from "@/components/ui/time-picker";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";

// Define types for our data
interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
  image?: string; // Category image URL
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  target_audience: string;
  created_by: string;
  participants?: number;
  categories?: EventCategory[];
  cover_image?: string; // Event cover/featured image URL
  gallery_images?: string[]; // Event gallery images URLs
}

interface EventFormData {
  name: string;
  description: string;
  date: Date | undefined;
  time: Date | undefined;
  location: string;
  target_audience: string;
  cover_image?: string; // Featured image for the event
  gallery_images?: string[]; // Gallery images for the event
  categories?: CategoryFormData[]; // Event categories
}

interface CategoryFormData {
  name: string;
  description: string;
  targetAudience: string;
  image?: string; // Category image
}

// Define form steps for event creation with proper structure
interface EventStepType {
  name: string;
  fields: string[];
}

const eventFormSteps: EventStepType[] = [
  { 
    name: "Basic Information", 
    fields: ["name", "location", "date", "time"] 
  },
  { 
    name: "Details & Description", 
    fields: ["description", "target_audience"] 
  },
  { 
    name: "Categories", 
    fields: ["categories"] 
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
    categories: []
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    targetAudience: "",
    image: ""
  });

  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);

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
      setEvents(eventsData);
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
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        return true;
      
      case 1: // Details & Description
        // Description and target audience are optional, so always valid
        return true;
      
      case 2: // Categories
        // Categories are optional, so always valid
        return true;
      
      case 3: // Media & Images
        // Images are optional, so always valid
        return true;
      
      case 4: // Review & Create
        // Final validation before submission
        return validateEventForm();
      
      default:
        return true;
    }
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
    return stepFields.every(field => {
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
      
      case 2: // Categories
        // Categories are optional, so always valid
        return true;
      
      case 3: // Media & Images
        // Images are optional, so always valid
        return true;
      
      case 4: // Review & Update
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
    return stepFields.every(field => {
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
      categories: []
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
              categories: event.categories?.map(cat => 
                cat.id === editingCategory.id ? updatedCategory : cat
              )
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.map(cat => 
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
              categories: event.categories?.filter(cat => cat.id !== selectedCategory.id)
            }
          : event
      ));

      // Update selected event for immediate UI update
      setSelectedEvent(prev => prev ? {
        ...prev,
        categories: prev.categories?.filter(cat => cat.id !== selectedCategory.id)
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
  const validateEventForm = (): boolean => {
    if (!eventFormData.name.trim()) {
      toast.error("Event name is required.");
      return false;
    }
    if (!eventFormData.location.trim()) {
      toast.error("Event location is required.");
      return false;
    }
    if (!eventFormData.date) {
      toast.error("Event date is required.");
      return false;
    }
    if (!eventFormData.time) {
      toast.error("Event time is required.");
      return false;
    }
    return true;
  };

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
      description: cat.description,
      targetAudience: cat.targetAudience,
      image: cat.image || ""
    })) || [];

    setEventFormData({
      name: event.name,
      description: event.description,
      date: new Date(event.date),
      time: timeDate,
      location: event.location,
      target_audience: event.target_audience,
      cover_image: event.cover_image || "",
      gallery_images: event.gallery_images || [],
      categories: mappedCategories
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
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
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
      description: category.description,
      targetAudience: category.targetAudience,
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
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <EventsDisplay 
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <EventsDisplay 
            events={filteredEvents} 
            onManageCategories={openCategoryManagement}
            onEditEvent={openEditEvent}
            onDeleteEvent={openDeleteEvent}
            onViewDetails={openEventDetails}
            onManageStaff={handleManageStaff}
          />
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog - Multi-step */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">
                    Event Name *
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
                    Location *
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
                    Event Date *
                  </Label>
                  <DatePicker 
                    date={eventFormData.date}
                    onSelect={(date) => setEventFormData(prev => ({ ...prev, date }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">
                    Event Time *
                  </Label>
                  <TimePicker
                    date={eventFormData.time}
                    onChange={(time) => setEventFormData(prev => ({ ...prev, time }))}
                    hourCycle={12}
                    placeholder="Select time"
                  />
                </div>
              </div>
                </>
              )}

              {/* Step 2: Details & Description */}
              {currentStep === 1 && (
                <>
              <div className="space-y-2">
                <Label htmlFor="target-audience">
                  Target Audience
                </Label>
                <Input 
                  id="target-audience" 
                      placeholder="e.g., All ages, Professionals, Elite runners" 
                  value={eventFormData.target_audience}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      Specify who this event is designed for (optional)
                    </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                      Event Description
                </Label>
                <Textarea
                  id="description"
                      placeholder="Provide a detailed description of the event, including what participants can expect, race categories, prizes, etc."
                      rows={6}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      A good description helps participants understand what to expect (optional)
                    </p>
              </div>
                </>
              )}

              {/* Step 3: Categories */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Event Categories</h3>
                        <p className="text-sm text-muted-foreground">
                          Add categories for your event (e.g., 5K Run, Marathon, Kids Race)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCategory: CategoryFormData = {
                            name: "",
                            description: "",
                            targetAudience: "",
                            image: ""
                          };
                          setEventFormData(prev => ({
                            ...prev,
                            categories: [...(prev.categories || []), newCategory]
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>

                    {eventFormData.categories && eventFormData.categories.length > 0 ? (
                      <div className="space-y-4">
                        {eventFormData.categories.map((category, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Category {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`category-name-${index}`}>
                                  Category Name *
                                </Label>
                                <Input
                                  id={`category-name-${index}`}
                                  placeholder="e.g., 5K Run, Marathon"
                                  value={category.name}
                                  onChange={(e) => {
                                    setEventFormData(prev => ({
                                      ...prev,
                                      categories: prev.categories?.map((cat, i) => 
                                        i === index ? { ...cat, name: e.target.value } : cat
                                      )
                                    }));
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`category-target-audience-${index}`}>
                                  Target Audience
                                </Label>
                                <Input
                                  id={`category-target-audience-${index}`}
                                  placeholder="e.g., Adults, Children, Elite runners"
                                  value={category.targetAudience}
                                  onChange={(e) => {
                                    setEventFormData(prev => ({
                                      ...prev,
                                      categories: prev.categories?.map((cat, i) => 
                                        i === index ? { ...cat, targetAudience: e.target.value } : cat
                                      )
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`category-description-${index}`}>
                                Description
                              </Label>
                              <Textarea
                                id={`category-description-${index}`}
                                placeholder="Brief description of this category"
                                rows={2}
                                value={category.description}
                                onChange={(e) => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.map((cat, i) => 
                                      i === index ? { ...cat, description: e.target.value } : cat
                                    )
                                  }));
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Category Image</Label>
                              <ImageUpload
                                key={`category-${index}`}
                                variant="featured"
                                onChange={(value) => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.map((cat, i) => 
                                      i === index ? { ...cat, image: value as string } : cat
                                    )
                                  }));
                                }}
                                images={category.image ? [category.image] : []}
                                useCloud={true}
                                folder="category-images"
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload an image for this category (optional)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Flag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No categories added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newCategory: CategoryFormData = {
                              name: "",
                              description: "",
                              targetAudience: "",
                              image: ""
                            };
                            setEventFormData(prev => ({
                              ...prev,
                              categories: [...(prev.categories || []), newCategory]
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Category
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Media & Images */}
              {currentStep === 3 && (
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

              {/* Step 5: Review & Create */}
              {currentStep === 4 && (
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
                      Categories will be created and linked to the event after the event is successfully created.
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-name">
                    Event Name *
                  </Label>
                  <Input 
                    id="edit-event-name" 
                    placeholder="Enter event name" 
                    value={eventFormData.name}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">
                    Location *
                  </Label>
                  <Input 
                    id="edit-location" 
                    placeholder="Enter event location" 
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-date">
                    Event Date *
                  </Label>
                  <DatePicker 
                    date={eventFormData.date}
                    onSelect={(date) => setEventFormData(prev => ({ ...prev, date }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-event-time">
                    Event Time *
                  </Label>
                  <TimePicker
                    date={eventFormData.time}
                    onChange={(time) => setEventFormData(prev => ({ ...prev, time }))}
                    hourCycle={12}
                    placeholder="Select time"
                  />
                </div>
              </div>
                </>
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
                  onChange={(e) => setEventFormData(prev => ({ ...prev, target_audience: e.target.value }))}
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
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                    <p className="text-xs text-muted-foreground">
                      A good description helps participants understand what to expect (optional)
                    </p>
              </div>
                </>
              )}

              {/* Step 3: Categories */}
              {currentEditStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Event Categories</h3>
                        <p className="text-sm text-muted-foreground">
                          Add categories for your event (e.g., 5K Run, Marathon, Kids Race)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCategory: CategoryFormData = {
                            name: "",
                            description: "",
                            targetAudience: "",
                            image: ""
                          };
                          setEventFormData(prev => ({
                            ...prev,
                            categories: [...(prev.categories || []), newCategory]
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>

                    {eventFormData.categories && eventFormData.categories.length > 0 ? (
                      <div className="space-y-4">
                        {eventFormData.categories.map((category, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Category {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`category-name-${index}`}>
                                  Category Name *
                                </Label>
                                <Input
                                  id={`category-name-${index}`}
                                  placeholder="e.g., 5K Run, Marathon"
                                  value={category.name}
                                  onChange={(e) => {
                                    setEventFormData(prev => ({
                                      ...prev,
                                      categories: prev.categories?.map((cat, i) => 
                                        i === index ? { ...cat, name: e.target.value } : cat
                                      )
                                    }));
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`category-target-audience-${index}`}>
                                  Target Audience
                                </Label>
                                <Input
                                  id={`category-target-audience-${index}`}
                                  placeholder="e.g., Adults, Children, Elite runners"
                                  value={category.targetAudience}
                                  onChange={(e) => {
                                    setEventFormData(prev => ({
                                      ...prev,
                                      categories: prev.categories?.map((cat, i) => 
                                        i === index ? { ...cat, targetAudience: e.target.value } : cat
                                      )
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`category-description-${index}`}>
                                Description
                              </Label>
                              <Textarea
                                id={`category-description-${index}`}
                                placeholder="Brief description of this category"
                                rows={2}
                                value={category.description}
                                onChange={(e) => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.map((cat, i) => 
                                      i === index ? { ...cat, description: e.target.value } : cat
                                    )
                                  }));
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Category Image</Label>
                              <ImageUpload
                                key={`category-${index}`}
                                variant="featured"
                                onChange={(value) => {
                                  setEventFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories?.map((cat, i) => 
                                      i === index ? { ...cat, image: value as string } : cat
                                    )
                                  }));
                                }}
                                images={category.image ? [category.image] : []}
                                useCloud={true}
                                folder="category-images"
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload an image for this category (optional)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Flag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No categories added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newCategory: CategoryFormData = {
                              name: "",
                              description: "",
                              targetAudience: "",
                              image: ""
                            };
                            setEventFormData(prev => ({
                              ...prev,
                              categories: [...(prev.categories || []), newCategory]
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Category
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Media & Images */}
              {currentEditStep === 3 && (
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

              {/* Step 5: Review & Update */}
              {currentEditStep === 4 && (
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
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this event.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              {/* Featured Image */}
              {selectedEvent.cover_image && (
                <div>
                  <Label className="text-sm font-medium">Featured Image</Label>
                  <div className="mt-2 relative h-48 w-full rounded-md overflow-hidden">
                    <Image
                      src={selectedEvent.cover_image}
                      alt={selectedEvent.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 600px) 100vw, 600px"
                    />
                  </div>
                </div>
              )}
              
              {/* Gallery Images */}
              {selectedEvent.gallery_images && selectedEvent.gallery_images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Gallery Images ({selectedEvent.gallery_images.length})</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedEvent.gallery_images.map((imageUrl, idx) => (
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
                  <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedEvent.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.target_audience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Participants</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.participants || 0}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
              </div>
              {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.categories.map((category, idx) => (
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
            <Button variant="outline" onClick={() => setIsEventDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryManagementOpen} onOpenChange={setIsCategoryManagementOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Event Categories</DialogTitle>
            <DialogDescription>
              {selectedEvent ? `Create and manage categories for ${selectedEvent.name}` : 'Create and manage event categories'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Categories</h3>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent.categories && selectedEvent.categories.length > 0 ? (
                      selectedEvent.categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            {category.image ? (
                              <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                <Flag className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>{category.targetAudience}</TableCell>
                          <TableCell>{category.participants}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => openEditCategory(category)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => openDeleteCategory(category)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No categories added to this event yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-muted/50 rounded-md p-4 mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="text-right">
                      Category Name *
                    </Label>
                    <Input 
                      id="category-name" 
                      placeholder="e.g., 5K Run, Marathon" 
                      className="col-span-3"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-description" className="text-right">
                      Description
                    </Label>
                    <Input 
                      id="category-description" 
                      placeholder="Brief description of this category" 
                      className="col-span-3"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-target-audience" className="text-right">
                      Target Audience
                    </Label>
                    <Input 
                      id="category-target-audience" 
                      placeholder="e.g., Adults, Children, Elite runners" 
                      className="col-span-3"
                      value={categoryFormData.targetAudience}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                  
                  {/* Category Image Upload */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">
                      Category Image
                    </Label>
                    <div className="col-span-3">
                      <ImageUpload 
                        key={editingCategory ? `edit-${editingCategory.id}` : 'add-new'}
                        variant="featured"
                        onChange={(value) => setCategoryFormData(prev => ({ ...prev, image: value as string }))}
                        images={categoryFormData.image ? [categoryFormData.image] : []}
                        useCloud={true}
                        folder="category-images"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload an image for this category (optional)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    {editingCategory && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingCategory(null);
                          resetCategoryForm();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      onClick={editingCategory ? handleEditCategory : handleAddCategory}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryManagementOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

// Component to display events in either card or table format
function EventsDisplay({ 
  events, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: { 
  events: Event[],
  onManageCategories: (event: Event) => void,
  onEditEvent: (event: Event) => void,
  onDeleteEvent: (event: Event) => void,
  onViewDetails: (event: Event) => void,
  onManageStaff: (event: Event) => void
}) {
  const [viewMode, setViewMode] = useState("cards");
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="border rounded-md overflow-hidden flex">
          <Button 
            variant={viewMode === "cards" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("cards")}
            className="rounded-none"
          >
            Cards
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("table")}
            className="rounded-none"
          >
            Table
          </Button>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((event: Event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onManageCategories={onManageCategories}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onViewDetails={onViewDetails}
                onManageStaff={onManageStaff}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event: Event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell>{event.categories?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onViewDetails(event)}>
                            <Eye size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEditEvent(event)}>
                            <Edit size={14} /> Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageStaff(event)}>
                            <UserPlus size={14} /> Manage Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
                            <Award size={14} /> Manage Categories
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex gap-2 items-center text-destructive cursor-pointer" onClick={() => onDeleteEvent(event)}>
                            <Trash2 size={14} /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No events found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: { 
  event: Event,
  onManageCategories: (event: Event) => void,
  onEditEvent: (event: Event) => void,
  onDeleteEvent: (event: Event) => void,
  onViewDetails: (event: Event) => void,
  onManageStaff: (event: Event) => void
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 p-0">
      {/* Background Image */}
      <div className="relative h-64 overflow-hidden">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-primary/40" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Featured Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Featured
          </div>
        </div>
        
        {/* Category Badges */}
        {event.categories && event.categories.length > 0 && (
          <div className="absolute top-4 right-4 flex gap-2">
            {event.categories.slice(0, 3).map((category, idx) => (
              <div key={idx} className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {category.name}
              </div>
            ))}
            {event.categories.length > 3 && (
              <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                +{event.categories.length - 3}
              </div>
            )}
          </div>
        )}
        
        {/* Gallery indicator */}
        {event.gallery_images && event.gallery_images.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <Images className="h-3 w-3" />
            <span>{event.gallery_images.length}</span>
          </div>
        )}
        
        {/* Date and Location */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{event.location}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Event Title and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide">
              {event.created_by}
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>
        
        {/* Description */}
        {event.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        {/* Event Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{event.participants || 0} Participants</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
            onClick={() => onViewDetails(event)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Actions
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="flex gap-2 items-center cursor-pointer" 
                onClick={() => onEditEvent(event)}
              >
                <Edit size={14} /> 
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex gap-2 items-center cursor-pointer" 
                onClick={() => onManageStaff(event)}
              >
                <UserPlus size={14} /> 
                Manage Staff
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex gap-2 items-center cursor-pointer" 
                onClick={() => onManageCategories(event)}
              >
                <Award size={14} /> 
                Manage Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex gap-2 items-center text-destructive cursor-pointer" 
                onClick={() => onDeleteEvent(event)}
              >
                <Trash2 size={14} /> 
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let badgeClass = "";
  let icon = null;

  switch (status.toLowerCase()) {
    case "upcoming":
      badgeClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      icon = <Calendar className="w-3 h-3" />;
      break;
    case "active":
      badgeClass = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      icon = <Check className="w-3 h-3" />;
      break;
    case "completed":
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      icon = <Check className="w-3 h-3" />;
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      icon = <X className="w-3 h-3" />;
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
      {icon}
      <span className="capitalize">{status}</span>
    </div>
  );
} 