"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from "react";

// Mock data - Replace with API call
const mockData = {
  paceHistory: [
    { date: "2023-01", avgPace: 5.5, bestPace: 5.2, event: "City Run" },
    { date: "2023-03", avgPace: 5.3, bestPace: 5.0, event: "Park Marathon" },
    { date: "2023-06", avgPace: 5.2, bestPace: 4.9, event: "Beach Run" },
    { date: "2023-09", avgPace: 5.0, bestPace: 4.7, event: "Trail Challenge" },
    { date: "2023-12", avgPace: 4.8, bestPace: 4.5, event: "Winter Race" },
  ],
  distanceByMonth: [
    { month: "Jan", distance: 120 },
    { month: "Feb", distance: 150 },
    { month: "Mar", distance: 180 },
    { month: "Apr", distance: 200 },
    { month: "May", distance: 220 },
  ],
  rankings: [
    { event: "City Run", rank: 45, totalParticipants: 200 },
    { event: "Park Marathon", rank: 30, totalParticipants: 150 },
    { event: "Beach Run", rank: 25, totalParticipants: 180 },
    { event: "Trail Challenge", rank: 15, totalParticipants: 120 },
    { event: "Winter Race", rank: 10, totalParticipants: 100 },
  ],
  personalBests: {
    "5km": "22:30",
    "10km": "48:15",
    "21km": "1:45:30",
    "42km": "3:55:00"
  }
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6m");

  const calculatePercentile = (rank: number, total: number) => {
    return ((total - rank) / total) * 100;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Object.entries(mockData.personalBests).map(([distance, time]) => (
          <Card key={distance}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best {distance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{time}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pace Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pace Trends</CardTitle>
            <CardDescription>Average and best pace per event</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.paceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgPace" 
                  stroke="#2563eb" 
                  name="Average Pace"
                />
                <Line 
                  type="monotone" 
                  dataKey="bestPace" 
                  stroke="#16a34a" 
                  name="Best Pace"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Distance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Distance</CardTitle>
            <CardDescription>Total kilometers per month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.distanceByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="distance" fill="#2563eb" name="Distance (km)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Rankings</CardTitle>
            <CardDescription>Your position in recent events</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.rankings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}th percentile`}
                />
                <Bar 
                  dataKey={(data) => calculatePercentile(data.rank, data.totalParticipants)} 
                  fill="#16a34a"
                  name="Percentile"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 