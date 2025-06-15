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
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventRegistrationDialog } from '@/components/event-registration-dialog';

interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
  image?: string;
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

  useEffect(() => {
    if (params.id) {
      fetchEventDetails();
      if (session) {
        checkRegistrationStatus();
      }
    }
  }, [params.id, session]);

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
      const response = await fetch(`/api/public/events/${params.id}`);
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
      const response = await fetch(`/api/events/${params.id}/register`);
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

  const handleRegisterForCategory = (category: EventCategory) => {
    if (!session) {
      toast.error("Please sign in to register for events");
      return;
    }

    // Check if user is already registered for this event (any category)
    if (registrationStatus && registrationStatus.isRegistered) {
      setSelectedCategory(category);
      setIsRegistrationDialogOpen(true);
      return;
    }

    setSelectedCategory(category);
    setIsRegistrationDialogOpen(true);
  };

  const handleRegistrationSuccess = () => {
    checkRegistrationStatus();
    fetchEventDetails(); // Refresh to update participant count
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
      <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-50">
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
                    className={`px-4 py-2 text-sm font-semibold ${
                      isUpcoming 
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
                      <p className="text-lg font-semibold">{formatDate(event.event_date)}</p>
                      <p className="text-sm text-white/80">{formatTime(event.event_date)}</p>
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
                      <p className="text-lg font-semibold">{event.participants} Registered</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Organizer</p>
                      <p className="text-lg font-semibold">{event.organizer}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Registration Card */}
              <div className="lg:col-span-1">
                <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">Registration</CardTitle>
                    <div className="text-3xl font-bold text-green-600">{event.price}</div>
                    <p className="text-sm text-gray-600">per category</p>
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
          <TabsList className="grid w-full grid-cols-3 mb-12 h-14">
            <TabsTrigger value="details" className="text-lg font-semibold">Event Details</TabsTrigger>
            <TabsTrigger value="categories" className="text-lg font-semibold">Categories</TabsTrigger>
            <TabsTrigger value="gallery" className="text-lg font-semibold">Gallery</TabsTrigger>
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
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
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
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-24">
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
                        <Tag className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Registration Fee</p>
                        <p className="font-bold text-xl text-green-600">{event.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Participants</p>
                        <p className="font-semibold text-lg">{event.participants} registered</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                        <p className="font-semibold text-lg">{formatDate(event.event_date)}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(event.event_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="font-semibold text-lg">{event.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Event Categories</h2>
                <p className="text-muted-foreground text-lg">Choose your race category and join the competition</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {event.eventCategories && event.eventCategories.length > 0 ? (
                  event.eventCategories.map((category) => (
                    <Card key={category.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {category.description || `Race category for ${category.name} distance`}
                        </p>
                        
                        {category.targetAudience && (
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold text-primary mb-1">Target Audience</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{category.targetAudience}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-lg">{category.participants}</span>
                            <span className="text-muted-foreground">registered</span>
                          </div>
                          <Badge variant="outline" className="px-3 py-1">
                            {category.name}
                          </Badge>
                        </div>
                        
                        {/* Registration Button for Category */}
                        {session?.user?.role === 'Runner' && isUpcoming ? (
                          registeredCategories.includes(category.id) ? (
                            (() => {
                              const userRegistration = registrationStatus?.registrations?.find(
                                (reg: any) => reg.categoryId === category.id
                              );
                              
                              if (!userRegistration) return null;
                              
                              const isApproved = userRegistration.registrationStatus === 'Approved' && userRegistration.paymentStatus === 'Verified';
                              const isRejected = userRegistration.registrationStatus === 'Rejected' || userRegistration.paymentStatus === 'Rejected';
                              const isPending = userRegistration.registrationStatus === 'Pending' || userRegistration.paymentStatus === 'Pending';
                              
                              if (isApproved) {
                                return (
                                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                      <span className="text-green-800 font-medium text-sm">Registration Approved</span>
                                    </div>
                                    <p className="text-green-700 text-xs">Payment verified • Registration confirmed</p>
                                  </div>
                                );
                              } else if (isRejected) {
                                return (
                                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                      <XCircle className="w-4 h-4 text-red-600 mr-2" />
                                      <span className="text-red-800 font-medium text-sm">Registration Rejected</span>
                                    </div>
                                    <p className="text-red-700 text-xs">
                                      {userRegistration.rejectionReason || 'Please contact the organizer for details'}
                                    </p>
                                  </div>
                                );
                              } else if (isPending) {
                                return (
                                  <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                      <Clock className="w-4 h-4 text-yellow-600 mr-2 animate-pulse" />
                                      <span className="text-yellow-800 font-medium text-sm">Pending Verification</span>
                                    </div>
                                    <p className="text-yellow-700 text-xs">
                                      {userRegistration.paymentStatus === 'Pending' 
                                        ? 'Payment receipt is being verified by the organizer'
                                        : 'Registration is being processed'
                                      }
                                    </p>
                                  </div>
                                );
                              }
                              
                              return null;
                            })()
                          ) : (
                            <Button
                              onClick={() => handleRegisterForCategory(category)}
                              disabled={registeringCategory === category.id}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 text-sm"
                            >
                              Register for this Category
                            </Button>
                          )
                        ) : !session ? (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 text-sm">Sign in to register</p>
                          </div>
                        ) : session?.user?.role !== 'Runner' ? (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 text-sm">Only runners can register</p>
                          </div>
                        ) : !isUpcoming ? (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 text-sm">Registration closed</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  event.categories.map((category, index) => (
                    <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Race category for {category} distance
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border mt-4 mb-4">
                          <Badge variant="outline" className="px-3 py-1">
                            {category}
                          </Badge>
                        </div>
                        
                        {/* Registration Button for Category */}
                        {session?.user?.role === 'Runner' && isUpcoming ? (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 text-sm">Category registration not available</p>
                          </div>
                        ) : !session ? (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 text-sm">Sign in to register</p>
                          </div>
                        ) : session?.user?.role !== 'Runner' ? (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 text-sm">Only runners can register</p>
                          </div>
                        ) : !isUpcoming ? (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 text-sm">Registration closed</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Event Gallery</h2>
                <p className="text-muted-foreground text-lg">Photos and highlights from this event</p>
              </div>
              
              {event.gallery_images && Array.isArray(event.gallery_images) && event.gallery_images.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {event.gallery_images.map((image, index) => (
                    <div key={index} className="group relative h-80 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <Image
                        src={image}
                        alt={`${event.event_name} gallery ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              ) : event.image_url ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="group relative h-80 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <Image
                      src={event.image_url}
                      alt={`${event.event_name} main image`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No Gallery Images</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Gallery images will be available once the event organizer uploads them.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          

        </Tabs>
      </div>

      {/* Registration Dialog */}
      {selectedCategory && event && (
        <EventRegistrationDialog
          isOpen={isRegistrationDialogOpen}
          onClose={() => {
            setIsRegistrationDialogOpen(false);
            setSelectedCategory(null);
          }}
          eventId={event.id}
          eventName={event.event_name}
          category={selectedCategory}
          onRegistrationSuccess={handleRegistrationSuccess}
          isAlreadyRegistered={registrationStatus?.isRegistered || false}
          registeredCategoryName={registrationStatus?.registrations?.[0]?.categoryName}
        />
      )}
    </div>
  );
} 