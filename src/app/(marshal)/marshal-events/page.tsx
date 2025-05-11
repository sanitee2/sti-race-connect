import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          View and manage your assigned events.
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{event.name}</CardTitle>
                <Badge variant={event.status === "Upcoming" ? "default" : 
                              event.status === "Completed" ? "secondary" : "outline"}>
                  {event.status}
                </Badge>
              </div>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const events = [
  {
    name: "STI Marathon 2024",
    description: "Annual marathon event with multiple race categories.",
    date: "May 15, 2025",
    time: "6:00 AM - 12:00 PM",
    location: "City Park, Downtown",
    status: "Upcoming"
  },
  {
    name: "Charity 5K Run",
    description: "Fundraising event for local children's hospital.",
    date: "May 22, 2025",
    time: "7:30 AM - 10:00 AM",
    location: "Riverside Park",
    status: "Upcoming"
  },
  {
    name: "Corporate Challenge",
    description: "Team-based running event for local businesses.",
    date: "June 1, 2025",
    time: "8:00 AM - 11:30 AM",
    location: "Business District",
    status: "Upcoming"
  },
  {
    name: "Winter Fun Run",
    description: "Casual 3K run event for all ages.",
    date: "January 15, 2025",
    time: "9:00 AM - 11:00 AM",
    location: "Community Center",
    status: "Completed"
  }
]; 