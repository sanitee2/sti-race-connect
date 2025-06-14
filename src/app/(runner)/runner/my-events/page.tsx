"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, TrophyIcon, ClockIcon, Loader2, Eye, Calendar, User, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface EventRegistration {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'scheduled' | 'completed';
  organizer: string;
  totalParticipants: number;
  cover_image?: string;
  registration: {
    id: string;
    categoryId: string;
    categoryName: string;
    registrationStatus: string;
    paymentStatus: string;
    registeredAt: string;
  };
  event_date: string;
}

export default function MyEvents() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState<{
    upcoming: EventRegistration[];
    completed: EventRegistration[];
    all: EventRegistration[];
  }>({
    upcoming: [],
    completed: [],
    all: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMyEvents();
    }
  }, [session]);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/runner/my-events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents({
        upcoming: data.upcoming || [],
        completed: data.completed || [],
        all: data.all || [],
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load your events');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return variants[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getPaymentBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Verified: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return variants[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Events</h1>
          <p className="text-muted-foreground">Please sign in to view your events.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">My Events</h1>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Events</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">
            Upcoming Events ({events.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({events.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {events.upcoming.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground mb-6">You haven't registered for any upcoming events yet.</p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.upcoming.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.cover_image && (
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={event.cover_image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {event.date} at {event.time}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Organized by {event.organizer}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Category:</span>
                          <Badge variant="outline">{event.registration.categoryName}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Registration:</span>
                          <Badge className={getStatusBadge(event.registration.registrationStatus)}>
                            {event.registration.registrationStatus}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Payment:</span>
                          <Badge className={getPaymentBadge(event.registration.paymentStatus)}>
                            {event.registration.paymentStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Link href={`/events/${event.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {events.completed.length === 0 ? (
            <div className="text-center py-12">
              <TrophyIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Past Events</h3>
              <p className="text-muted-foreground mb-6">You haven't participated in any events yet.</p>
              <Link href="/events">
                <Button>Find Events to Join</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.completed.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.cover_image && (
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={event.cover_image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gray-900/80 text-white">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {event.date}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Organized by {event.organizer}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Category:</span>
                          <Badge variant="outline">{event.registration.categoryName}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Participants:</span>
                          <span className="text-sm">{event.totalParticipants} runners</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Registered:</span>
                          <span className="text-sm">
                            {new Date(event.registration.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Link href={`/events/${event.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Event
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>


      </Tabs>
    </div>
  );
} 