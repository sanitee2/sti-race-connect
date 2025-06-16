"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  Trophy,
  Target,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  Tag,
  Timer,
  DollarSign,
  Building,
  AlertCircle,
  Images
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageViewer, useImageViewer } from '@/components/ui/image-viewer';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
  image?: string;
  hasSlotLimit?: boolean;
  slotLimit?: number;
  availableSlots?: number;
  price?: number;
  earlyBirdPrice?: number;
  priceDisplay?: string;
  gunStartTime?: string;
  formattedGunStartTime?: string;
  cutOffTime?: string;
  formattedCutOffTime?: string;
  distance?: string;
}

interface EventDetails {
  id: string;
  event_name: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  categories: string[];
  type: string;
  organizer: string;
  price: string;
  status: string;
  target_audience: string;
  participants: number;
  event_date: string;
  cover_image?: string;
  gallery_images?: string[];
  eventCategories?: EventCategory[];

  // Enhanced fields from API
  registrationStartDate?: string;
  registrationEndDate?: string;
  registrationOpen?: boolean;
  gunStartTime?: string;
  cutOffTime?: string;
  formattedGunStartTime?: string;
  formattedCutOffTime?: string;
  isFreeEvent?: boolean;
  eventPrice?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  earlyBirdActive?: boolean;
  priceRange?: string;
  hasSlotLimit?: boolean;
  slotLimit?: number;
  availableSlots?: number;
  organization?: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    website?: string;
    isVerified?: boolean;
  };
  sponsors?: Array<{
    id: string;
    name: string;
    logo_url?: string;
    website?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  daysUntilEvent?: number;
  formattedDate?: string;
  formattedTime?: string;
  registrationStatus?: string;
  totalParticipants?: number;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredCategories, setRegisteredCategories] = useState<string[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<any>(null);
  const [registeringCategory, setRegisteringCategory] = useState<string | null>(null);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Registration dialog state
  const [selectedCategoryForRegistration, setSelectedCategoryForRegistration] = useState<EventCategory | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    tshirtSize: 'M',
    dateOfBirth: '',
    gender: '',
    proofOfPayment: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Image viewer hook
  const { isOpen: isImageViewerOpen, images: viewerImages, initialIndex, openViewer, closeViewer } = useImageViewer();

  // Fetch event details only when the ID changes
  useEffect(() => {
    if (params?.id) {
      fetchEventDetails();
    }
  }, [params?.id]);

  // Check registration status only when session becomes available or ID changes
  useEffect(() => {
    if (params?.id && session?.user?.id) {
      checkRegistrationStatus();
    }
  }, [params?.id, session?.user?.id]);

  // Auto-refresh when user is registered to show status updates
  useEffect(() => {
    if (registrationStatus?.isRegistered && session?.user?.role === 'Runner') {
      // Check if registration is still pending
      const isPending = registrationStatus.registrations?.some(
        (reg: any) => reg.registrationStatus === 'Pending' || reg.paymentStatus === 'Pending'
      );
      
      if (isPending) {
        // Refresh every 30 seconds when pending
        const interval = setInterval(() => {
          checkRegistrationStatus();
          fetchEventDetails();
        }, 30000);
        
        setRefreshInterval(interval);
        
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
      } else {
        // Clear interval if no longer pending
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [registrationStatus, session]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/public/events/${params?.id}`);
      if (!response.ok) {
        throw new Error('Event not found');
      }
      const eventData = await response.json();
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/events/${params?.id}/register`);
      if (response.ok) {
        const data = await response.json();
        const registeredCategoryIds = data.registrations?.map((reg: any) => reg.categoryId) || [];
        setRegisteredCategories(registeredCategoryIds);
        setRegistrationStatus(data);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Reset registration form
  const resetRegistrationForm = () => {
    setRegistrationDetails({
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      tshirtSize: 'M',
      dateOfBirth: '',
      gender: '',
      proofOfPayment: ''
    });
  };

  const handleRegisterForCategory = async (categoryId: string, categoryName: string) => {
    const category = event?.eventCategories?.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryForRegistration(category);

      // Reset form first
      resetRegistrationForm();

      // Fetch user's runner profile to pre-populate emergency contact fields
      await fetchUserProfile();

      setIsRegistrationDialogOpen(true);
    }
  };

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    setLoadingProfile(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profileData = await response.json();
        
        let hasPrefilledData = false;
        
        // Pre-populate with runner profile data if available
        if (profileData.runnerProfile) {
          const newDetails = {
            emergencyContactName: profileData.runnerProfile.emergency_contact_name || '',
            emergencyContactPhone: profileData.runnerProfile.emergency_contact_phone || '',
            emergencyContactRelationship: profileData.runnerProfile.emergency_contact_relationship || '',
            tshirtSize: profileData.runnerProfile.tshirt_size || 'M',
            dateOfBirth: profileData.runnerProfile.date_of_birth ?
              new Date(profileData.runnerProfile.date_of_birth).toISOString().split('T')[0] : '',
            gender: profileData.runnerProfile.gender || ''
          };
          
          setRegistrationDetails(prev => ({
            ...prev,
            ...newDetails
          }));
          hasPrefilledData = true;
        }
        
        // Pre-populate with basic user data if runner profile is incomplete
        if (profileData && !profileData.runnerProfile) {
          setRegistrationDetails(prev => ({
            ...prev,
            emergencyContactName: prev.emergencyContactName || profileData.name || '',
            emergencyContactPhone: prev.emergencyContactPhone || profileData.phone || '',
            dateOfBirth: prev.dateOfBirth || '',
            gender: prev.gender || ''
          }));
          if (profileData.name || profileData.phone) {
            hasPrefilledData = true;
          }
        }
        
        // Show success message if we pre-filled any data
        if (hasPrefilledData) {
          toast.success('Form pre-filled with your profile information', {
            description: 'Please review and update as needed'
          });
        }
      } else {
        console.error('Failed to fetch profile data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedCategoryForRegistration || !session?.user?.id) return;

    setRegisteringCategory(selectedCategoryForRegistration.id);

    try {
      const response = await fetch(`/api/events/${params?.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedCategoryForRegistration.id,
          registrationDetails: {
            emergencyContactName: registrationDetails.emergencyContactName,
            emergencyContactPhone: registrationDetails.emergencyContactPhone,
            emergencyContactRelationship: registrationDetails.emergencyContactRelationship,
            tshirtSize: registrationDetails.tshirtSize,
            dateOfBirth: registrationDetails.dateOfBirth,
            gender: registrationDetails.gender,
            proofOfPayment: registrationDetails.proofOfPayment
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();

      toast.success("Registration Successful!", {
        description: `You have been registered for ${selectedCategoryForRegistration.name}`,
      });

      // Update local state
      setRegisteredCategories(prev => [...prev, selectedCategoryForRegistration.id]);

      // Close dialog and reset form
      setIsRegistrationDialogOpen(false);
      setSelectedCategoryForRegistration(null);
      resetRegistrationForm();

      // Refresh registration status
      await checkRegistrationStatus();

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error("Registration Failed", {
        description: error.message,
      });
    } finally {
      setRegisteringCategory(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.event_name,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle dialog close
  const handleCloseRegistrationDialog = () => {
    setIsRegistrationDialogOpen(false);
    setSelectedCategoryForRegistration(null);
    resetRegistrationForm();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-20">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = event.status === 'upcoming' || event.status === 'scheduled';
  const isRunner = session?.user?.role === 'Runner';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-16 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>
            <div className="flex items-center gap-2">
              {registrationStatus?.isRegistered && session?.user?.role === 'Runner' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    checkRegistrationStatus();
                    fetchEventDetails();
                    toast.success('Registration status refreshed');
                  }}
                  className="flex items-center gap-2 hover:bg-muted"
                >
                  <Clock className="w-4 h-4" />
                  Refresh Status
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 hover:bg-muted"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh notification for pending registrations */}
      {registrationStatus?.isRegistered && session?.user?.role === 'Runner' && 
       registrationStatus.registrations?.some((reg: any) => 
         reg.registrationStatus === 'Pending' || reg.paymentStatus === 'Pending'
       ) && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center gap-3 text-yellow-800">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm">
                Your registration is pending verification. This page will auto-refresh every 30 seconds to show status updates.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        {/* Event Image Background */}
        {(event.cover_image || event.image_url) && (
          <div className="relative h-[500px] bg-gray-100 dark:bg-gray-800">
            <Image
              src={event.cover_image || event.image_url}
              alt={event.event_name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}

        {/* Event Header Content */}
        <div className={`${(event.cover_image || event.image_url) ? 'absolute bottom-0 left-0 right-0' : 'bg-gradient-to-r from-primary to-primary/80'} text-white`}>
          <div className="container mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-3 gap-8 items-end">
              <div className="lg:col-span-2">
                {/* Event Badges */}
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-semibold">
                    {event.type}
                  </Badge>
                  <Badge
                    variant={isUpcoming ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm font-semibold ${isUpcoming
                        ? "bg-green-500/90 backdrop-blur-sm text-white border-green-400/30"
                        : "bg-gray-500/90 backdrop-blur-sm text-white border-gray-400/30"
                      }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>

                {/* Event Title */}
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {event.event_name}
                </h1>

                {/* Event Meta Info */}
                <div className="grid md:grid-cols-2 gap-6 text-white/90">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Event Date</p>
                      <p className="text-lg font-semibold">{event.formattedDate || formatDate(event.event_date)}</p>
                      <p className="text-sm text-white/80">{event.formattedTime || formatTime(event.event_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Location</p>
                      <p className="text-lg font-semibold">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Participants</p>
                      <p className="text-lg font-semibold">{event.totalParticipants || event.participants} Registered</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Organizer</p>
                      <p className="text-lg font-semibold">{event.organization?.name || event.organizer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Card */}
              <div className="lg:col-span-1">
                <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">Registration</CardTitle>
                    <div className="text-3xl font-bold text-green-600">
                      {event.isFreeEvent ? 'FREE' : (() => {
                        // For price ranges, show only early bird range when active
                        if (event.eventCategories && event.eventCategories.length > 1) {
                          if (event.earlyBirdActive) {
                            // Calculate early bird price range
                            const earlyBirdPrices = event.eventCategories
                              .map(cat => cat.earlyBirdPrice)
                              .filter(price => price !== null && price !== undefined);
                            
                            if (earlyBirdPrices.length > 0) {
                              const minEarlyBird = Math.min(...earlyBirdPrices);
                              const maxEarlyBird = Math.max(...earlyBirdPrices);
                              return minEarlyBird === maxEarlyBird 
                                ? `₱${minEarlyBird.toFixed(0)}`
                                : `₱${minEarlyBird.toFixed(0)} - ₱${maxEarlyBird.toFixed(0)}`;
                            }
                          }
                          // Fallback to regular price range
                          return event.priceRange || event.price;
                        }
                        // Single category or fallback
                        return event.priceRange || event.price;
                      })()}
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.isFreeEvent ? 'Free registration' :
                        (event.eventCategories && event.eventCategories.length > 1 ? 
                          (event.earlyBirdActive ? 'early bird price range across categories' : 'price range across categories') : 
                          'per category')}
                    </p>
                    {event.daysUntilEvent !== undefined && event.daysUntilEvent >= 0 && (
                      <div className="mt-2 p-2 bg-blue-100 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          {event.daysUntilEvent === 0 ? 'Event is today!' :
                            event.daysUntilEvent === 1 ? 'Event is tomorrow!' :
                              `${event.daysUntilEvent} days until event`}
                        </p>
                      </div>
                    )}

                    {/* Early Bird Indicator */}
                    {event.earlyBirdActive && event.earlyBirdEndDate && (
                      <div className="mt-2 p-2 bg-orange-100 rounded-lg">
                        <p className="text-sm font-medium text-orange-800">
                          🎯 Early Bird pricing ends {formatDate(event.earlyBirdEndDate)}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!session ? (
                      <div className="text-center space-y-4">
                        <p className="text-gray-600">Sign in to register for this event</p>
                        <Link href="/auth/login">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold">
                            Sign In to Register
                          </Button>
                        </Link>
                      </div>
                    ) : !isUpcoming ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <XCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600">This event has ended</p>
                      </div>
                    ) : !isRunner ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <User className="w-10 h-10 text-blue-600" />
                        </div>
                        <p className="text-gray-600">Only runners can register for events</p>
                        <p className="text-sm text-gray-500">Please create a runner profile to participate</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-center text-gray-600 mb-4">
                          Register for specific categories in the Categories tab
                        </p>
                        {registeredCategories.length > 0 && (() => {
                          const userRegistration = registrationStatus?.registrations?.[0];
                          
                          if (!userRegistration) return null;
                          
                          const isApproved = userRegistration.registrationStatus === 'Approved' && userRegistration.paymentStatus === 'Verified';
                          const isRejected = userRegistration.registrationStatus === 'Rejected' || userRegistration.paymentStatus === 'Rejected';
                          const isPending = userRegistration.registrationStatus === 'Pending' || userRegistration.paymentStatus === 'Pending';
                          
                          if (isApproved) {
                            return (
                              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                  <span className="text-green-800 font-medium">
                                    Registered for {registeredCategories.length} categor{registeredCategories.length === 1 ? 'y' : 'ies'}
                                  </span>
                                </div>
                                <p className="text-green-700 text-sm">Status: Registration Approved</p>
                              </div>
                            );
                          } else if (isRejected) {
                            return (
                              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                  <span className="text-red-800 font-medium">
                                    Registration Rejected
                                  </span>
                                </div>
                                <p className="text-red-700 text-sm">
                                  {userRegistration.rejectionReason || 'Please contact the organizer for details'}
                                </p>
                              </div>
                            );
                          } else if (isPending) {
                            return (
                              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <Clock className="w-5 h-5 text-yellow-600 mr-2 animate-pulse" />
                                  <span className="text-yellow-800 font-medium">
                                    Registered for {registeredCategories.length} categor{registeredCategories.length === 1 ? 'y' : 'ies'}
                                  </span>
                                </div>
                                <p className="text-yellow-700 text-sm">Status: Pending Verification</p>
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 h-14">
            <TabsTrigger value="details" className="text-lg font-semibold">Event Details</TabsTrigger>
            <TabsTrigger value="rankings" className="text-lg font-semibold">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-primary" />
                      </div>
                      About This Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-lg max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {event.description}
                    </p>

                    {event.target_audience && (
                      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                        <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary">
                          <Target className="w-5 h-5" />
                          Target Audience
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-lg">{event.target_audience}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Event Categories Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      Event Categories
                    </CardTitle>
                    <CardDescription>
                      Choose your race category and join the competition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {event.eventCategories && event.eventCategories.length > 0 ? (
                        event.eventCategories.map((category) => (
                          <Card key={category.id} className="border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors duration-200 p-0 overflow-hidden">
                            {/* Category Image */}
                            {category.image && (
                              <div
                                className="relative h-32 w-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openViewer([category.image!], 0)}
                              >
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {/* Overlay gradient for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                {/* Click indicator */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}

                            <CardContent className="p-4">
                              {/* Category Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{category.name}</h3>
                                  {category.distance && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.distance}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  {category.participants} registered
                                </Badge>
                              </div>

                              {/* Category Details - Compact Grid */}
                              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                {category.formattedGunStartTime && (
                                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                    <Clock className="w-3 h-3" />
                                    <span>Start: {category.formattedGunStartTime}</span>
                                  </div>
                                )}

                                {category.formattedCutOffTime && (
                                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Cut-off: {category.formattedCutOffTime}</span>
                                  </div>
                                )}

                                {(category.price !== null || category.earlyBirdPrice !== null) && !event.isFreeEvent && (
                                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <span>
                                      {event.earlyBirdActive && category.earlyBirdPrice && category.price ? (
                                        <>
                                          ₱{category.earlyBirdPrice.toFixed(0)}{' '}
                                          <span className="line-through text-gray-400">₱{category.price.toFixed(0)}</span>
                                        </>
                                      ) : (
                                        category.priceDisplay || 'Free'
                                      )}
                                    </span>
                                  </div>
                                )}

                                {category.hasSlotLimit && category.slotLimit && (
                                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Users className="w-3 h-3" />
                                    <span>{category.availableSlots || 0}/{category.slotLimit} slots</span>
                                  </div>
                                )}
                              </div>

                              {/* Early Bird Indicator */}
                              {event.earlyBirdActive && category.earlyBirdPrice && (
                                <div className="mb-3 px-2 py-1 bg-orange-50 dark:bg-orange-950/20 rounded text-xs text-orange-700 dark:text-orange-300">
                                  🎯 Early bird pricing active
                                </div>
                              )}

                              {/* Registration Status/Button */}
                              {session?.user?.role === 'Runner' && isUpcoming ? (
                                registeredCategories.includes(category.id) ? (
                                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-green-700 dark:text-green-300">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Registered</span>
                                  </div>
                                ) : registeredCategories.length > 0 ? (
                                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-amber-700 dark:text-amber-300">
                                    <Info className="w-4 h-4" />
                                    <span className="text-sm">Already registered for another category</span>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleRegisterForCategory(category.id, category.name)}
                                    disabled={registeringCategory === category.id}
                                    className="w-full h-9 text-sm"
                                    size="sm"
                                  >
                                    {registeringCategory === category.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        Registering...
                                      </>
                                    ) : (
                                      'Register'
                                    )}
                                  </Button>
                                )
                              ) : !session ? (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-blue-700 dark:text-blue-300">
                                  <User className="w-4 h-4" />
                                  <span className="text-sm">Sign in to register</span>
                                </div>
                              ) : session?.user?.role !== 'Runner' ? (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-950/20 rounded text-gray-600 dark:text-gray-400">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-sm">Runners only</span>
                                </div>
                              ) : !isUpcoming ? (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-950/20 rounded text-gray-600 dark:text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">Registration closed</span>
                                </div>
                              ) : null}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        event.categories.map((category, index) => (
                          <Card key={index} className="border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{category}</h3>
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  {category}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Race category for {category} distance
                              </p>

                              {/* Registration Status */}
                              {session?.user?.role === 'Runner' && isUpcoming ? (
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-blue-700 dark:text-blue-300">
                                  <span className="text-sm">Category registration not available</span>
                                </div>
                              ) : !session ? (
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-blue-700 dark:text-blue-300">
                                  <span className="text-sm">Sign in to register</span>
                                </div>
                              ) : session?.user?.role !== 'Runner' ? (
                                <div className="p-2 bg-gray-50 dark:bg-gray-950/20 rounded text-gray-600 dark:text-gray-400">
                                  <span className="text-sm">Only runners can register</span>
                                </div>
                              ) : !isUpcoming ? (
                                <div className="p-2 bg-gray-50 dark:bg-gray-950/20 rounded text-gray-600 dark:text-gray-400">
                                  <span className="text-sm">Registration closed</span>
                                </div>
                              ) : null}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Gallery Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Images className="w-5 h-5 text-primary" />
                      </div>
                      Event Gallery
                    </CardTitle>
                    <CardDescription>
                      Photos and highlights from this event
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.gallery_images && Array.isArray(event.gallery_images) && event.gallery_images.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {event.gallery_images.map((image, index) => (
                          <div
                            key={index}
                            className="group relative h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => openViewer(event.gallery_images!, index)}
                          >
                            <Image
                              src={image}
                              alt={`${event.event_name} gallery ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <Images className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : event.image_url ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                          className="group relative h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => openViewer([event.image_url!], 0)}
                        >
                          <Image
                            src={event.image_url}
                            alt={`${event.event_name} main image`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Images className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Images className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Gallery Images</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Gallery images will be available once the event organizer uploads them.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-45">
                  <CardHeader>
                    <CardTitle className="text-xl">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                        <p className="font-semibold text-lg">{event.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={isUpcoming ? "default" : "secondary"} className="text-sm px-3 py-1">
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Registration Fee</p>
                        <p className="font-bold text-xl text-green-600">
                          {event.isFreeEvent ? 'FREE' : (() => {
                            // For price ranges, show only early bird range when active
                            if (event.eventCategories && event.eventCategories.length > 1) {
                              if (event.earlyBirdActive) {
                                // Calculate early bird price range
                                const earlyBirdPrices = event.eventCategories
                                  .map(cat => cat.earlyBirdPrice)
                                  .filter(price => price !== null && price !== undefined);
                                
                                if (earlyBirdPrices.length > 0) {
                                  const minEarlyBird = Math.min(...earlyBirdPrices);
                                  const maxEarlyBird = Math.max(...earlyBirdPrices);
                                  return minEarlyBird === maxEarlyBird 
                                    ? `₱${minEarlyBird.toFixed(0)}`
                                    : `₱${minEarlyBird.toFixed(0)} - ₱${maxEarlyBird.toFixed(0)}`;
                                }
                              }
                              // Fallback to regular price range
                              return event.priceRange || event.price;
                            }
                            // Single category or fallback
                            return event.priceRange || event.price;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Participants</p>
                        <p className="font-semibold text-lg">{event.totalParticipants || event.participants} registered</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                        <p className="font-semibold text-lg">{event.formattedDate || formatDate(event.event_date)}</p>
                        <p className="text-sm text-muted-foreground">{event.formattedTime || formatTime(event.event_date)}</p>
                      </div>
                    </div>

                    {event.gunStartTime && (
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Timer className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gun Start Time</p>
                          <p className="font-semibold text-lg">{event.gunStartTime}</p>
                        </div>
                      </div>
                    )}

                    {event.cutOffTime && (
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cut-off Time</p>
                          <p className="font-semibold text-lg">{event.cutOffTime}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="font-semibold text-lg">{event.location}</p>
                      </div>
                    </div>

                    {event.organization && (
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Organized by</p>
                          <div className="flex items-center gap-2">
                            {event.organization.logo_url && (
                              <Image
                                src={event.organization.logo_url}
                                alt={event.organization.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                                unoptimized
                              />
                            )}
                            <p className="font-semibold text-lg">{event.organization.name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(event.registrationStartDate || event.registrationEndDate) && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Registration Period
                        </h4>
                        {event.registrationStartDate && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-medium">Opens:</span> {formatDate(event.registrationStartDate)}
                          </p>
                        )}
                        {event.registrationEndDate && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-medium">Closes:</span> {formatDate(event.registrationEndDate)}
                          </p>
                        )}
                        {event.registrationStatus && (
                          <Badge
                            variant={event.registrationStatus === 'open' ? 'default' : 'secondary'}
                            className="mt-2"
                          >
                            Registration {event.registrationStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">{event.event_name}</h1>
                    <p className="text-xl text-muted-foreground mt-1">
                      {event.formattedDate} • {event.formattedTime}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{event.totalParticipants} Participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-semibold">
                      {event.isFreeEvent ? (
                        <Badge variant="secondary" className="text-lg px-3 py-1">Free Event</Badge>
                      ) : (
                        event.price
                      )}
                    </span>
                  </div>
                  {event.daysUntilEvent !== undefined && event.daysUntilEvent > 0 && (
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-primary" />
                      <span>{event.daysUntilEvent} {event.daysUntilEvent === 1 ? 'day' : 'days'} to go</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rankings content */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    Overall Rankings
                  </CardTitle>
                  <CardDescription>
                    Current standings and results for all categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.status === 'completed' ? (
                    <div className="space-y-6">
                      {/* Category-wise rankings */}
                      {event.eventCategories && event.eventCategories.length > 0 ? (
                        event.eventCategories.map((category) => (
                          <div key={category.id} className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b">
                              <Trophy className="w-5 h-5 text-primary" />
                              <h3 className="text-xl font-semibold">{category.name}</h3>
                              <Badge variant="outline">{category.participants} participants</Badge>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold">Rank</th>
                                    <th className="text-left py-3 px-4 font-semibold">Runner</th>
                                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                                    <th className="text-left py-3 px-4 font-semibold">Pace</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                          <span className="text-yellow-600 font-bold text-sm">1</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div>
                                        <p className="font-semibold">Results will be available</p>
                                        <p className="text-sm text-muted-foreground">after event completion</p>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">--:--:--</td>
                                    <td className="py-3 px-4 text-muted-foreground">--:--</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Rankings Available Soon</h3>
                          <p className="text-muted-foreground">
                            Final rankings will be published after the event is completed.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : event.status === 'upcoming' || event.status === 'scheduled' ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Rankings Not Available Yet</h3>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">
                        Rankings will be available during and after the event. Check back on race day for live updates!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Event Date: {formatDate(event.event_date)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Event In Progress</h3>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        The event is currently in progress. Rankings will be updated as results come in.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={viewerImages}
        initialIndex={initialIndex}
        isOpen={isImageViewerOpen}
        onClose={closeViewer}
        showDownload={true}
        showRotate={true}
      />

      {/* Registration Dialog */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseRegistrationDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Registration</DialogTitle>
            <DialogDescription>
              Please provide additional details for your registration to {selectedCategoryForRegistration?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingProfile && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm text-muted-foreground">Pre-filling form with your profile information...</span>
              </div>
            )}

            {!loadingProfile && (registrationDetails.emergencyContactName || registrationDetails.dateOfBirth || registrationDetails.gender) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Form Pre-filled</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  We've filled in your information from your profile. Please review and update as needed.
                </p>
              </div>
            )}

            {/* Category Summary */}
            {selectedCategoryForRegistration && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Registration Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Category:</span> {selectedCategoryForRegistration.name}</p>
                  {selectedCategoryForRegistration.formattedGunStartTime && (
                    <p><span className="font-medium">Gun Start:</span> {selectedCategoryForRegistration.formattedGunStartTime}</p>
                  )}
                  {selectedCategoryForRegistration.formattedCutOffTime && (
                    <p><span className="font-medium">Cut Off:</span> {selectedCategoryForRegistration.formattedCutOffTime}</p>
                  )}
                  {selectedCategoryForRegistration.priceDisplay && !event?.isFreeEvent && (
                    <p><span className="font-medium">Price:</span> {selectedCategoryForRegistration.priceDisplay}</p>
                  )}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Personal Information</h4>
                <p className="text-xs text-muted-foreground">
                  This information is pre-filled from your profile. You can update it if needed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-of-birth">Date of Birth</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={registrationDetails.dateOfBirth}
                    onChange={(e) => setRegistrationDetails(prev => ({
                      ...prev,
                      dateOfBirth: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={registrationDetails.gender}
                    onValueChange={(value) => setRegistrationDetails(prev => ({
                      ...prev,
                      gender: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tshirt-size">T-Shirt Size</Label>
                <Select
                  value={registrationDetails.tshirtSize}
                  onValueChange={(value) => setRegistrationDetails(prev => ({
                    ...prev,
                    tshirtSize: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select t-shirt size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                    <SelectItem value="XXXL">XXXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Emergency Contact Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Emergency Contact Information</h4>
                <p className="text-xs text-muted-foreground">
                  This information is pre-filled from your profile. You can update it if needed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-contact-name">
                    Emergency Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="emergency-contact-name"
                    value={registrationDetails.emergencyContactName}
                    onChange={(e) => setRegistrationDetails(prev => ({
                      ...prev,
                      emergencyContactName: e.target.value
                    }))}
                    placeholder="Full name of emergency contact"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="emergency-contact-phone"
                      value={registrationDetails.emergencyContactPhone}
                      onChange={(e) => setRegistrationDetails(prev => ({
                        ...prev,
                        emergencyContactPhone: e.target.value
                      }))}
                      placeholder="Contact phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact-relationship">Relationship</Label>
                    <Input
                      id="emergency-contact-relationship"
                      value={registrationDetails.emergencyContactRelationship}
                      onChange={(e) => setRegistrationDetails(prev => ({
                        ...prev,
                        emergencyContactRelationship: e.target.value
                      }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Payment */}
            {selectedCategoryForRegistration?.priceDisplay && !event?.isFreeEvent && (
              <div className="space-y-2">
                <Label htmlFor="proof-of-payment">
                  Proof of Payment <span className="text-destructive">*</span>
                </Label>
                <ImageUpload
                  variant="featured"
                  onChange={(value) => setRegistrationDetails(prev => ({
                    ...prev,
                    proofOfPayment: Array.isArray(value) ? value[0] || '' : value || ''
                  }))}
                  images={registrationDetails.proofOfPayment ? [registrationDetails.proofOfPayment] : []}
                  useCloud={true}
                  folder="payment-proofs"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot or photo of your payment confirmation. This helps us verify your registration quickly.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseRegistrationDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRegistration}
              disabled={Boolean(
                registeringCategory === selectedCategoryForRegistration?.id ||
                !registrationDetails.emergencyContactName.trim() ||
                !registrationDetails.emergencyContactPhone.trim() ||
                (selectedCategoryForRegistration?.priceDisplay && !event?.isFreeEvent && !registrationDetails.proofOfPayment.trim())
              )}
            >
              {registeringCategory === selectedCategoryForRegistration?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Confirm Registration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
} 