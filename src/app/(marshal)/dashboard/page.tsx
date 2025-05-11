"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Flag, Clock, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarshalDashboard() {
  const [greeting, setGreeting] = useState("Good day");
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // If no user, this would be handled by auth protection in a real app
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}, {user.name}!</h1>
        <p className="text-muted-foreground">
          Welcome to your marshal dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats?.upcomingEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats?.totalParticipants || 0}</div>
            <p className="text-xs text-muted-foreground">
              +42 from last event
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marshal Points</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              +20 this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming events */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Events you're assigned to marshal in the next 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{event.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={event.status === "Confirmed" ? "default" : "outline"}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent activities */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Your recent actions and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className={`mr-4 flex h-2 w-2 rounded-full mt-2 ${
                    activity.type === "important" ? "bg-destructive" : 
                    activity.type === "update" ? "bg-blue-500" : "bg-green-500"
                  }`} />
                  <div className="space-y-1">
                    <p className="text-sm leading-none">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Activities <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-start">
                    <Skeleton className="h-12 w-12 mr-4 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Sample data
const upcomingEvents = [
  {
    name: "STI Marathon 2024",
    date: "May 15, 2025",
    time: "6:00 AM",
    location: "City Park, Downtown",
    status: "Confirmed"
  },
  {
    name: "Charity 5K Run",
    date: "May 22, 2025",
    time: "7:30 AM",
    location: "Riverside Park",
    status: "Pending"
  },
  {
    name: "Corporate Challenge",
    date: "June 1, 2025",
    time: "8:00 AM",
    location: "Business District",
    status: "Confirmed"
  }
];

const recentActivities = [
  {
    message: "You were assigned to STI Marathon 2024 as a route marshal",
    time: "1 hour ago",
    type: "update"
  },
  {
    message: "Your marshal training certification expires in 3 days",
    time: "3 hours ago",
    type: "important"
  },
  {
    message: "You approved 12 participants for the Corporate Challenge",
    time: "Yesterday",
    type: "success"
  },
  {
    message: "Route map updated for Charity 5K Run",
    time: "2 days ago",
    type: "update"
  }
]; 