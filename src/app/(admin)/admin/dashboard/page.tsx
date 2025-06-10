"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Flag,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Activity,
} from 'lucide-react';

// Mock data - replace with actual API calls
const stats = {
  totalUsers: 1250,
  activeEvents: 8,
  upcomingEvents: 15,
  totalParticipants: 3500,
  verifiedMarshals: 120,
  pendingVerifications: 25,
  recentRegistrations: 45,
  activeOrganizations: 30,
};

const recentActivity = [
  {
    id: 1,
    type: 'event_created',
    title: 'New Event Created',
    description: 'City Marathon 2024 has been created',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'marshal_verified',
    title: 'Marshal Verified',
    description: 'John Doe has been verified as a marshal',
    time: '3 hours ago',
  },
  {
    id: 3,
    type: 'participant_registered',
    title: 'New Registration',
    description: '15 new participants registered for Triathlon Event',
    time: '5 hours ago',
  },
  {
    id: 4,
    type: 'organization_joined',
    title: 'New Organization',
    description: 'Sports Club C joined the platform',
    time: '1 day ago',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of the platform's performance and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-semibold">{stats.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Events</p>
              <h3 className="text-2xl font-semibold">{stats.activeEvents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Flag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
              <h3 className="text-2xl font-semibold">{stats.upcomingEvents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
              <h3 className="text-2xl font-semibold">{stats.totalParticipants}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified Marshals</p>
              <h3 className="text-2xl font-semibold">{stats.verifiedMarshals}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
              <h3 className="text-2xl font-semibold">{stats.pendingVerifications}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Registrations</p>
              <h3 className="text-2xl font-semibold">{stats.recentRegistrations}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Organizations</p>
              <h3 className="text-2xl font-semibold">{stats.activeOrganizations}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="rounded-lg bg-primary/10 p-2">
                  {activity.type === 'event_created' && <Calendar className="h-5 w-5 text-primary" />}
                  {activity.type === 'marshal_verified' && <CheckCircle className="h-5 w-5 text-primary" />}
                  {activity.type === 'participant_registered' && <Users className="h-5 w-5 text-primary" />}
                  {activity.type === 'organization_joined' && <Award className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 