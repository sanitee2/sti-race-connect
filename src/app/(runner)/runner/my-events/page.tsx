"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, TrophyIcon, ClockIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data - Replace with API call
const mockEvents = {
  upcoming: [
    {
      id: 1,
      title: "City Marathon 2024",
      date: "2024-06-15",
      location: "Downtown City",
      distance: "42km",
      status: "approved",
      startTime: "06:00 AM",
    },
    {
      id: 2,
      title: "Trail Run Challenge",
      date: "2024-07-01",
      location: "Mountain Park",
      distance: "21km",
      status: "pending",
      startTime: "07:00 AM",
    },
  ],
  past: [
    {
      id: 3,
      title: "Beach Run 2023",
      date: "2023-12-10",
      location: "Coastal Beach",
      distance: "10km",
      ranking: 45,
      totalParticipants: 200,
      finishTime: "00:48:23",
      pace: "4:50",
    },
    {
      id: 4,
      title: "City Half Marathon",
      date: "2023-11-15",
      location: "City Park",
      distance: "21km",
      ranking: 120,
      totalParticipants: 500,
      finishTime: "1:45:30",
      pace: "5:00",
    },
  ],
  applied: [
    {
      id: 5,
      title: "Forest Trail Run",
      date: "2024-08-20",
      location: "National Forest",
      distance: "15km",
      status: "pending",
      appliedDate: "2024-02-01",
    },
  ],
};

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return variants[status] || "";
  };

  const calculateProgress = (ranking: number, total: number) => {
    return 100 - ((ranking - 1) / total) * 100;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Events</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="upcoming">
            Upcoming ({mockEvents.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({mockEvents.past.length})
          </TabsTrigger>
          <TabsTrigger value="applied">
            Applied ({mockEvents.applied.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-6 md:grid-cols-2">
            {mockEvents.upcoming.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadge(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Start Time: {event.startTime}</span>
                    </div>
                    <Badge variant="outline">{event.distance}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid gap-6 md:grid-cols-2">
            {mockEvents.past.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="h-4 w-4" />
                      <span>Rank: {event.ranking} of {event.totalParticipants}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{Math.round(calculateProgress(event.ranking, event.totalParticipants))}%</span>
                      </div>
                      <Progress value={calculateProgress(event.ranking, event.totalParticipants)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{event.distance}</Badge>
                      <div className="text-right">
                        <div className="font-medium">Finish Time: {event.finishTime}</div>
                        <div className="text-sm text-muted-foreground">Pace: {event.pace} min/km</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applied">
          <div className="grid gap-6 md:grid-cols-2">
            {mockEvents.applied.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadge(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{event.distance}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Applied on {new Date(event.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 