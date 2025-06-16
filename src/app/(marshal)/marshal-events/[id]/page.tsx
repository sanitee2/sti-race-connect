"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CreditCard, 
  ArrowLeft,
  Edit,
  Share2,
  Eye,
  UserCheck,
  FileText,
  Image as ImageIcon,
  Star,
  Target,
  Trophy,
  Shield,
  Check,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { RegistrationCard } from "./components/RegistrationCard";
import { ImageViewer, useImageViewer } from "@/components/ui/image-viewer";
import { StepBasicInfo } from "../components/steps/StepBasicInfo";
import { StepCategories } from "../components/steps/StepCategories";
import { EventPaymentForm } from "../components/event-payment-form";
import { OrganizationStaffForm } from "../components/organization-staff-form";
import { SponsorsForm } from "../components/sponsors-form";
import { Event, EventFormData, eventFormSteps, EventStepType } from "../types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isOpen, images, initialIndex, openViewer, closeViewer } = useImageViewer();
  
  // Edit dialog state
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [currentEditStep, setCurrentEditStep] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [originalEventFormData, setOriginalEventFormData] = useState<EventFormData | null>(null);
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
    sponsors: [],
    organization_id: "",
    registrationStartDate: undefined,
    registrationEndDate: undefined,
    gunStartTime: undefined,
    cutOffTime: undefined
  });

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.name,
        text: `Check out this event: ${event?.name}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard');
    }
  };

  // Edit event functions
  const openEditEvent = () => {
    if (!event) return;
    
    // Parse the time string (HH:MM format) into a Date object
    let timeDate: Date | undefined;
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
    }

    // Parse gun start time if available
    let gunStartTime: Date | undefined;
    if (event.gun_start_time) {
      gunStartTime = new Date(event.gun_start_time);
    }

    // Parse cut off time if available
    let cutOffTime: Date | undefined;
    if (event.cut_off_time) {
      cutOffTime = new Date(event.cut_off_time);
    }

    // Map categories properly with all fields
    const mappedCategories = event.categories?.map((cat: any) => {
      // Parse category gun start time if available
      let categoryGunStartTime: Date | undefined;
      if (cat.gun_start_time) {
        categoryGunStartTime = new Date(cat.gun_start_time);
      }

      return {
        name: cat.name || cat.category_name || "",
        description: cat.description || "",
        targetAudience: cat.targetAudience || cat.target_audience || "",
        image: cat.image || cat.category_image || "",
        price: cat.price,
        earlyBirdPrice: cat.earlyBirdPrice || cat.early_bird_price,
        hasSlotLimit: cat.hasSlotLimit || cat.has_slot_limit || false,
        slotLimit: cat.slotLimit || cat.slot_limit,
        gunStartTime: categoryGunStartTime
      };
    }) || [];

    const formData = {
      name: event.name || event.event_name || "",
      description: event.description || "",
      date: new Date(event.date || event.event_date),
      time: timeDate,
      location: event.location || "",
      target_audience: event.target_audience || "",
      cover_image: event.cover_image || "",
      gallery_images: event.gallery_images || [],
      categories: mappedCategories,
      isFreeEvent: event.isFreeEvent || event.is_free_event || false,
      price: event.price,
      earlyBirdPrice: event.earlyBirdPrice || event.early_bird_price,
      earlyBirdEndDate: (event.earlyBirdEndDate || event.early_bird_end_date) ? new Date(event.earlyBirdEndDate || event.early_bird_end_date) : undefined,
      paymentMethods: event.paymentMethods || event.payment_methods || [],
      hasSlotLimit: event.has_slot_limit || event.hasSlotLimit || false,
      slotLimit: event.slot_limit ?? event.slotLimit ?? undefined,
      gunStartTime: gunStartTime,
      cutOffTime: cutOffTime,
      event_staff: (event.event_staff || []).map((staff: any) => ({
        user_id: staff.user_id,
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        role_in_event: staff.role_in_event,
        responsibilities: staff.responsibilities
      })),
      sponsors: event.sponsors || [],
      organization_id: event.organization_id || "",
      registrationStartDate: (event.registration_start_date || event.registrationStartDate) ? new Date(event.registration_start_date || event.registrationStartDate) : undefined,
      registrationEndDate: (event.registration_end_date || event.registrationEndDate) ? new Date(event.registration_end_date || event.registrationEndDate) : undefined
    };

    setEventFormData(formData);
    setOriginalEventFormData(JSON.parse(JSON.stringify(formData))); // Deep copy for comparison
    setCurrentEditStep(0);
    setIsEditEventOpen(true);
  };

  // Function to check if form has changes
  const hasFormChanges = (): boolean => {
    if (!originalEventFormData) return false;
    
    // Compare current form data with original
    const current = JSON.stringify(eventFormData);
    const original = JSON.stringify(originalEventFormData);
    return current !== original;
  };

  // Function to reset form data
  const resetEventFormData = () => {
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
      organization_id: "",
      registrationStartDate: undefined,
      registrationEndDate: undefined,
      gunStartTime: undefined,
      cutOffTime: undefined
    });
    setOriginalEventFormData(null);
    setCurrentEditStep(0);
  };

  const updateEvent = async (eventId: string, eventData: EventFormData) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventData.name,
        description: eventData.description,
        event_date: eventData.date ? format(eventData.date, 'yyyy-MM-dd') : '',
        time: eventData.time ? format(eventData.time, 'HH:mm') : '',
        location: eventData.location,
        target_audience: eventData.target_audience,
        cover_image: eventData.cover_image,
        gallery_images: eventData.gallery_images,
        is_free_event: eventData.isFreeEvent,
        price: eventData.price,
        early_bird_price: eventData.earlyBirdPrice,
        early_bird_end_date: eventData.earlyBirdEndDate ? format(eventData.earlyBirdEndDate, 'yyyy-MM-dd') : undefined,
        gun_start_time: eventData.gunStartTime ? eventData.gunStartTime.toISOString() : undefined,
        cut_off_time: eventData.cutOffTime ? eventData.cutOffTime.toISOString() : undefined,
        paymentMethods: eventData.paymentMethods,
        has_slot_limit: eventData.hasSlotLimit,
        slot_limit: eventData.slotLimit,
        organization_id: eventData.organization_id,
        event_staff: eventData.event_staff,
        sponsors: eventData.sponsors,
        registration_start_date: eventData.registrationStartDate ? format(eventData.registrationStartDate, 'yyyy-MM-dd') : undefined,
        registration_end_date: eventData.registrationEndDate ? format(eventData.registrationEndDate, 'yyyy-MM-dd') : undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    return response.json();
  };

  const handleEditEvent = async () => {
    if (!event) return;
    
    setIsUpdating(true);
    try {
      const updatedEvent = await updateEvent(event.id, eventFormData);
      setEvent(updatedEvent);
      setIsEditEventOpen(false);
      resetEventFormData();
      toast.success("Event Updated", {
        description: "Your event has been successfully updated.",
      });
      // Refresh the event details
      await fetchEventDetails();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Multi-step form navigation functions for edit
  const validateCurrentEditStep = async (): Promise<boolean> => {
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
    default:
        return true;
    }
  };

  const nextEditStep = async () => {
    const isValid = await validateCurrentEditStep();
    
    if (isValid) {
      if (currentEditStep === eventFormSteps.length - 1) {
        handleEditEvent();
        return;
      }
      setCurrentEditStep(prev => Math.min(prev + 1, eventFormSteps.length - 1));
    }
  };

  const prevEditStep = () => {
    setCurrentEditStep(prev => Math.max(prev - 1, 0));
  };

  const goToEditStep = (stepIndex: number) => {
    if (stepIndex <= currentEditStep) {
      setCurrentEditStep(stepIndex);
    }
  };

  // Render step indicators for edit form
  const renderEditStepIndicators = () => (
    <div className="relative flex justify-between mb-4">
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

  if (isLoading) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Event Not Found</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            onClick={openEditEvent} 
            variant="outline" 
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Event Header Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Event Image */}
            <div className="lg:w-2/5">
              {event.cover_image ? (
                <div 
                  className="aspect-[3/2] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const allImages = [event.cover_image, ...(event.gallery_images || [])].filter(Boolean);
                    openViewer(allImages, 0);
                  }}
                >
                  <img
                    src={event.cover_image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="lg:w-4/6 space-y-4 flex flex-col justify-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">{event.name}</h1>
                  {event.is_verified && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
              </Badge>
            )}
          </div>
        </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date ? format(new Date(event.date), 'EEEE, MMMM dd, yyyy') : 'Date not set'}
                    </p>
        </div>
      </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
        </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Target Audience</p>
                    <p className="text-sm text-muted-foreground">{event.target_audience}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-sm text-muted-foreground">
                      {event.isFreeEvent ? 'Free Event' : (() => {
                        // If there are categories, show price range
                        if (event.categories && event.categories.length > 0) {
                          const prices = event.categories
                            .map((cat: any) => cat.price)
                            .filter((price: any) => price !== null && price !== undefined)
                            .map((price: any) => Number(price));
                          
                          if (prices.length === 0) {
                            return 'Free Event';
                          } else if (prices.length === 1) {
                            return `₱${prices[0].toFixed(2)}`;
                          } else {
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            return minPrice === maxPrice 
                              ? `₱${minPrice.toFixed(2)}`
                              : `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;
                          }
                        }
                        // Fallback to event price
                        return event.price !== null && event.price !== undefined 
                          ? `₱${Number(event.price).toFixed(2)}` 
                          : 'Price not set';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Period */}
              {event.registrationStartDate && event.registrationEndDate && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Registration Period</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      From: {format(new Date(event.registrationStartDate), 'MMM dd, yyyy')}
                    </span>
                    <span>•</span>
                    <span>
                      To: {format(new Date(event.registrationEndDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="registration" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Registration
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Staff
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Event Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{event.participants?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Participants</p>
        </div>
                </div>
              </CardContent>
            </Card>

          <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{event.categories?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{event.event_staff?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Staff Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-purple-600" />
                    <div>
                    <p className="text-2xl font-bold">{event.sponsors?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Sponsors</p>
                    </div>
                  </div>
            </CardContent>
          </Card>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Information */}
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>

                {event.gunStartTime && (
                  <div>
                    <h4 className="font-medium mb-2">Gun Start Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.gunStartTime}</span>
                    </div>
                </div>
              )}
              
                {event.cutOffTime && (
                  <div>
                    <h4 className="font-medium mb-2">Cut-off Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.cutOffTime}</span>
                    </div>
                </div>
              )}
              
                {event.has_slot_limit && (
                  <div>
                    <h4 className="font-medium mb-2">Slot Limit</h4>
                    <Badge variant="outline">{event.slot_limit} participants</Badge>
                  </div>
              )}
            </CardContent>
          </Card>

            {/* Payment Information */}
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {event.isFreeEvent ? (
                  <div>
                    <h4 className="font-medium mb-2">Registration Fee</h4>
                    <p className="text-2xl font-bold text-green-600">Free Event</p>
                  </div>
                ) : (
                  <>
                    {/* Show category-specific pricing if categories exist */}
                    {event.categories && event.categories.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-3">Category Pricing</h4>
                        <div className="space-y-3">
                          {event.categories.map((category: any) => (
                            <div key={category.id} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">{category.name}</h5>
                                <div className="text-right">
                                  {category.price !== null && category.price !== undefined ? (
                                    <Badge variant="outline" className="text-lg px-3 py-1">
                                      ₱{Number(category.price).toFixed(2)}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Free</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {category.earlyBirdPrice && 
                               category.earlyBirdPrice !== null && 
                               category.price !== null &&
                               Number(category.earlyBirdPrice) < Number(category.price) && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600 font-medium">Early Bird Price:</span>
                                  <span className="text-green-600 font-semibold">
                                    ₱{Number(category.earlyBirdPrice).toFixed(2)}
                                  </span>
                  </div>
                )}
                              
                              {category.description && (
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{category.participants || 0} registered</span>
                                {category.has_slot_limit && category.slot_limit && (
                                  <span>• {category.slot_limit} slots available</span>
                                )}
                                {category.targetAudience && (
                                  <span>• {category.targetAudience}</span>
                                )}
                              </div>
                            </div>
                          ))}
              </div>

                        {/* Show early bird deadline if any category has early bird pricing */}
                        {event.earlyBirdEndDate && event.categories.some((cat: any) => 
                          cat.earlyBirdPrice !== null && cat.earlyBirdPrice !== undefined
                        ) && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">
                                Early Bird Pricing Available
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                              Early bird prices valid until {format(new Date(event.earlyBirdEndDate), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Show general event pricing if no categories */
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Registration Fee</h4>
                          <p className="text-2xl font-bold">
                            {event.price !== null && event.price !== undefined 
                              ? `₱${Number(event.price).toFixed(2)}` 
                              : 'Price not set'
                            }
                          </p>
                        </div>

                        {event.earlyBirdPrice && 
                         event.earlyBirdPrice !== null && 
                         event.earlyBirdEndDate && (
                          <div>
                            <h4 className="font-medium mb-2">Early Bird Price</h4>
                            <p className="text-xl font-semibold text-green-600">
                              ₱{Number(event.earlyBirdPrice).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Until {format(new Date(event.earlyBirdEndDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {event.payment_methods && event.payment_methods.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Methods</h4>
              <div className="space-y-2">
                      {event.payment_methods.map((method: any, index: number) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.value}</p>
                </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
              </div>

          {/* Gallery */}
          {event.gallery_images && event.gallery_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Event Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {event.gallery_images.map((image: string, index: number) => (
                    <div 
                      key={index} 
                      className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const allImages = [event.cover_image, ...(event.gallery_images || [])].filter(Boolean);
                        const galleryStartIndex = event.cover_image ? index + 1 : index;
                        openViewer(allImages, galleryStartIndex);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Registration Tab */}
        <TabsContent value="registration">
          <RegistrationCard eventId={eventId} />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Event Categories
                </CardTitle>
              </CardHeader>
            <CardContent>
              {event.categories && event.categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {event.categories.map((category: any) => (
                    <Card key={category.id} className="p-0">
                      <CardContent className="p-0">
                        <div className="space-y-3">
                          {/* Category Image */}
                          <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openViewer([category.image], 0)}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                          </div>
                          
                          {/* Category Content */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{category.name}</h3>
                              <div className="text-right">
                                {category.price !== null && category.price !== undefined ? (
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="text-base px-2 py-1">
                                      ₱{Number(category.price).toFixed(2)}
                                    </Badge>
                                    {category.earlyBirdPrice && 
                                     category.earlyBirdPrice !== null && 
                                     Number(category.earlyBirdPrice) < Number(category.price) && (
                                      <div className="text-xs text-green-600 font-medium">
                                        Early: ₱{Number(category.earlyBirdPrice).toFixed(2)}
                    </div>
                                    )}
                      </div>
                                ) : (
                                  <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                            </div>
                            
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm">
                              {category.targetAudience && (
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span>{category.targetAudience}</span>
                            </div>
                          )}
                              
                              {category.has_slot_limit && category.slot_limit && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>{category.slot_limit} slots</span>
                        </div>
                              )}
                    </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{category.participants || 0} participants</span>
                              </div>
                              
                              {category.has_slot_limit && category.slot_limit && (
                                <div className="text-muted-foreground">
                                  {Math.max(0, category.slot_limit - (category.participants || 0))} remaining
                  </div>
                )}
                            </div>
                          </div>
                        </div>
              </CardContent>
            </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories configured for this event</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Event Staff
              </CardTitle>
              </CardHeader>
              <CardContent>
              {event.event_staff && event.event_staff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.event_staff.map((staff: any) => (
                    <Card key={staff.user_id}  className="p-0">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{staff.user?.name}</h3>
                              <p className="text-sm text-muted-foreground">{staff.user?.email}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Badge variant="secondary">{staff.role_in_event}</Badge>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Responsibilities</h4>
                            <p className="text-sm text-muted-foreground">{staff.responsibilities}</p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Assigned: {staff.assigned_at ? format(new Date(staff.assigned_at), 'MMM dd, yyyy') : 'Date not available'}
                          </div>
                        </div>
              </CardContent>
            </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No staff members assigned to this event</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Viewer */}
      <ImageViewer
        images={images}
        initialIndex={initialIndex}
        isOpen={isOpen}
        onClose={closeViewer}
      />

      {/* Edit Event Dialog */}
      <Dialog 
        open={isEditEventOpen} 
        onOpenChange={(open) => {
          if (!open && hasFormChanges()) {
            setShowCloseConfirm(true);
          } else {
            setIsEditEventOpen(open);
            if (!open) resetEventFormData();
          }
        }}
      >
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
                      categories: prev.categories?.map((cat: any, i: number) => 
                        i === index ? { ...cat, price } : cat
                      )
                    }));
                  }}
                  onCategoryEarlyBirdPriceChange={(index: number, price: number | undefined) => {
                    setEventFormData((prev: EventFormData) => ({
                      ...prev,
                      categories: prev.categories?.map((cat: any, i: number) => 
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
                  onSponsorsChange={(sponsors) => setEventFormData((prev: EventFormData) => ({ ...prev, sponsors }))}
                />
              )}

              {/* Step 7: Media & Images */}
              {currentEditStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Featured Image
                    </Label>
                    <div className="w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-muted-foreground">Image upload functionality would go here</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload a featured image that will be displayed as the main event photo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Gallery Images
                    </Label>
                    <div className="w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-muted-foreground">Gallery upload functionality would go here</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload additional images to showcase your event venue, past events, or what participants can expect. Maximum 6 images.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Review & Update */}
              {currentEditStep === 7 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Review your event changes before updating. You can go back to any step to make changes.
                  </p>
                  
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
                    if (hasFormChanges()) {
                      setShowCloseConfirm(true);
                    } else {
                      setIsEditEventOpen(false);
                      resetEventFormData();
                    }
                  } else {
                    prevEditStep();
                  }
                }}
              >
                {currentEditStep === 0 ? "Cancel" : "Previous"}
              </Button>
              
              <Button 
                onClick={nextEditStep} 
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating && currentEditStep === eventFormSteps.length - 1 ? (
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

      {/* Close Confirmation Dialog */}
      <ConfirmationDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="Discard Changes?"
        description="Are you sure you want to close the edit dialog? All unsaved changes will be lost."
        onConfirm={() => {
          setShowCloseConfirm(false);
          setIsEditEventOpen(false);
          resetEventFormData();
        }}
        confirmText="Yes, discard changes"
        cancelText="No, keep editing"
        variant="danger"
      />
    </div>
  );
} 