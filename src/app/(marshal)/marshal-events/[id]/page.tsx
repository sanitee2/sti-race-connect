import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/app/(marshal)/marshal-events/components/status-badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock4, 
  Ticket,
  CalendarRange,
  Info
} from "lucide-react";
import Link from "next/link";
import { Event, EventCategory, StaffRole } from "@/app/(marshal)/marshal-events/types";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { GalleryImage } from "../components/gallery-image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventDetailsCard } from "./components/EventDetailsCard";
import { CategoriesCard } from "./components/CategoriesCard";
import { GalleryCard } from "./components/GalleryCard";
import { SponsorsCard } from "./components/SponsorsCard";
import { AboutCard } from "./components/AboutCard";
import { StaffCard } from "./components/StaffCard";
import { EventPageParams } from "@/types/pageParams";

// Helper function to determine event status
function getEventStatus(eventDate: Date): 'upcoming' | 'active' | 'completed' | 'cancelled' {
  const now = new Date();
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDay > today) {
    return 'upcoming';
  } else if (eventDay.getTime() === today.getTime()) {
    return 'active';
  } else {
    return 'completed';
  }
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    // Use Prisma directly instead of fetch
    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event_categories: {
          include: {
            category: {
              include: {
                participants: true,
              },
            },
          },
        },
        event_staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        sponsors: true,
        payment_methods: true,
      },
    });

    if (!event) {
      return null;
    }

    // Transform the data to match frontend expectations
    const transformedEvent: Event = {
      id: event.id,
      name: event.event_name,
      description: event.description,
      date: event.event_date.toISOString().split('T')[0],
      time: event.event_date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location: event.location,
      status: getEventStatus(event.event_date),
      target_audience: event.target_audience,
      created_by: event.creator.name,
      has_slot_limit: event.has_slot_limit,
      slot_limit: event.slot_limit,
      cutOffTime: event.cut_off_time || undefined,
      gunStartTime: event.gun_start_time || undefined,
      registrationStartDate: event.registration_start_date ? event.registration_start_date.toISOString() : undefined,
      registrationEndDate: event.registration_end_date ? event.registration_end_date.toISOString() : undefined,
      categories: event.event_categories.map(eventCategory => ({
        id: eventCategory.category.id,
        name: eventCategory.category.category_name,
        description: eventCategory.category.description,
        targetAudience: eventCategory.category.target_audience,
        participants: eventCategory.category.participants.length,
        image: eventCategory.category.category_image || undefined,
        has_slot_limit: eventCategory.category.has_slot_limit,
        slot_limit: eventCategory.category.slot_limit || null
      })),
      cover_image: event.cover_image || undefined,
      gallery_images: event.gallery_images,
      isFreeEvent: event.is_free_event,
      price: event.price || undefined,
      earlyBirdPrice: event.early_bird_price || undefined,
      earlyBirdEndDate: event.early_bird_end_date ? event.early_bird_end_date.toISOString() : undefined,
      organization_id: event.organization_id || undefined,
      event_staff: event.event_staff.map(staff => ({
        user_id: staff.user_id,
        role_in_event: mapStaffRole(staff.role_in_event),
        responsibilities: staff.responsibilities,
        user: {
          name: staff.user.name,
          email: staff.user.email
        }
      })),
      sponsors: event.sponsors.map(sponsor => ({
        name: sponsor.name,
        logo_url: sponsor.logo_url || undefined,
        website: sponsor.website || undefined
      })),
      paymentMethods: event.payment_methods.map(method => ({
        id: method.id,
        name: method.name,
        type: method.type as 'account_number' | 'image',
        value: method.value
      })),
    };

    return transformedEvent;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Add this helper function to map Prisma StaffRole enum to our StaffRole enum
function mapStaffRole(role: any): StaffRole {
  switch (role) {
    case 'EventMarshal':
      return StaffRole.MARSHAL;
    case 'Coordinator':
      return StaffRole.OTHER;
    case 'SubMarshal':
      return StaffRole.OTHER;
    default:
      return StaffRole.OTHER;
  }
}

export default async function MarshalEventDetailsPage({ params }: EventPageParams) {
  // Resolve params promise
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.id);
  
  if (!event) {
    notFound();
  }

  // Format dates for display
  const eventDate = event.date ? new Date(event.date).toLocaleDateString() : "Not specified";
  const eventTime = event.time || "Not specified";
  const registrationStartDate = event.registrationStartDate ? new Date(event.registrationStartDate).toLocaleDateString() : null;
  const registrationEndDate = event.registrationEndDate ? new Date(event.registrationEndDate).toLocaleDateString() : null;
  const earlyBirdEndDate = event.earlyBirdEndDate ? new Date(event.earlyBirdEndDate).toLocaleDateString() : null;
  const cutOffTime = event.cutOffTime ? new Date(event.cutOffTime).toLocaleString() : null;
  const gunStartTime = event.gunStartTime ? new Date(event.gunStartTime).toLocaleString() : null;

  // Calculate total participants
  const totalParticipants = event.categories?.reduce((sum, cat) => sum + cat.participants, 0) || 0;
  
  // Check if categories exist
  const hasCategories = event.categories && event.categories.length > 0;

  return (
    <div className="w-full px-6 py-6 space-y-8 max-w-none">
      {/* Back Button */}
      <div>
        <Link href="/marshal-events">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={event.status} />
            {!event.isFreeEvent && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {event.price ? `₱${event.price}` : "Paid Event"}
              </Badge>
            )}
            {event.isFreeEvent && (
              <Badge variant="outline" className="bg-green-50">Free Event</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* Marshal-only controls */}
          <Link href={`/marshal-events/${event.id}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
          <Link href={`/marshal-events/${event.id}/categories`}>
            <Button>Manage Categories</Button>
          </Link>
        </div>
      </div>

      {/* Featured Image */}
      {event.cover_image && (
        <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden">
          <Image
            src={event.cover_image}
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs for main content */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {/* Description */}
              <AboutCard event={event} />

              {/* Categories */}
              <CategoriesCard event={event} />

              {/* Gallery Images */}
              <GalleryCard event={event} />

              {/* Sponsors */}
              <SponsorsCard event={event} />
            </TabsContent>
            
            <TabsContent value="staff" className="space-y-6">
              {/* Event Staff */}
              <StaffCard event={event} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Basic Event Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Date & Time</h3>
                    <p className="text-sm">{eventDate} at {eventTime}</p>
                  </div>
                </div>
                
                {event.target_audience && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Target Audience</h3>
                      <p className="text-sm">{event.target_audience}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Link href={`/marshal-events/${event.id}/edit`}>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Timing Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Event Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gun Start Time */}
              {gunStartTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gun Start:</span>
                  <span>{gunStartTime}</span>
                </div>
              )}
              
              {/* Cut-off Time */}
              {cutOffTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cut-off Time:</span>
                  <span>{cutOffTime}</span>
                </div>
              )}
              
              {!gunStartTime && !cutOffTime && (
                <p className="text-sm text-muted-foreground text-center py-2">No schedule details specified</p>
              )}
            </CardContent>
          </Card>

          {/* Registration Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4" />
                Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Registration Period */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Registration Period</h3>
                {registrationStartDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{registrationStartDate}</span>
                  </div>
                )}
                {registrationEndDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{registrationEndDate}</span>
                  </div>
                )}
                {!registrationStartDate && !registrationEndDate && (
                  <p className="text-sm text-muted-foreground">No registration period specified</p>
                )}
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Participants</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Registered:</span>
                  <span>{totalParticipants}</span>
                </div>
                {event.has_slot_limit && event.slot_limit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slots Available:</span>
                    <span>{event.slot_limit - totalParticipants} of {event.slot_limit}</span>
                  </div>
                )}
              </div>

              {/* Registration Button */}
              <Button className="w-full mt-2">
                <Ticket className="w-4 h-4 mr-2" />
                Manage Registrations
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {!event.isFreeEvent && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Regular Price */}
                {event.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Regular Price:</span>
                    <span className="font-medium">₱{event.price}</span>
                  </div>
                )}

                {/* Early Bird Price */}
                {event.earlyBirdPrice && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Early Bird Price:</span>
                      <span className="font-medium">₱{event.earlyBirdPrice}</span>
                    </div>
                    {earlyBirdEndDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Early Bird Ends:</span>
                        <span>{earlyBirdEndDate}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Methods */}
                {event.paymentMethods && event.paymentMethods.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium">Payment Methods</h3>
                    <div className="space-y-2">
                      {event.paymentMethods.map((method) => (
                        <div key={method.id} className="border rounded-md p-2">
                          <p className="text-sm font-medium">{method.name}</p>
                          {method.type === 'account_number' ? (
                            <p className="text-xs text-muted-foreground font-mono">{method.value}</p>
                          ) : (
                            <div className="relative h-24 w-full mt-2">
                              <Image
                                src={method.value}
                                alt={`Payment QR for ${method.name}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 300px"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Organization Info */}
          {event.organization_id && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This event is organized by an organization.</p>
                <Button variant="outline" className="w-full mt-4">
                  View Organization
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 