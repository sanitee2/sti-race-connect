"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Trophy, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  Award, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  Target,
  BarChart3,
  Timer,
  Medal,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  profile: {
    name: string;
    email: string;
    profilePicture?: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    tshirtSize: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  statistics: {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    personalBests: Record<string, { time: string; event: string; date: string }>;
    registrationSummary: {
      pending: number;
      approved: number;
      rejected: number;
    };
    paymentSummary: {
      pending: number;
      paid: number;
      verified: number;
    };
  };
  events: {
    upcoming: any[];
    completed: any[];
    recent: any[];
  };
  performance: {
    trends: any[];
    recentResults: any[];
  };
}

export default function RunnerDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/runner/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h1>
          <p className="text-muted-foreground mb-6">Unable to fetch your dashboard data.</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { profile, statistics, events, performance } = dashboardData;

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Registration status data for pie chart
  const registrationData = [
    { name: 'Approved', value: statistics.registrationSummary.approved, color: '#10B981' },
    { name: 'Pending', value: statistics.registrationSummary.pending, color: '#F59E0B' },
    { name: 'Rejected', value: statistics.registrationSummary.rejected, color: '#EF4444' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarImage src={profile.profilePicture} alt={profile.name} />
              <AvatarFallback className="text-2xl font-bold bg-white/20">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name.split(' ')[0]}!</h1>
              <p className="text-white/80 text-lg">Ready for your next running challenge?</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <User className="w-4 h-4 mr-2" />
                  Runner
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Trophy className="w-4 h-4 mr-2" />
                  {statistics.completedEvents} Events Completed
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14">
            <TabsTrigger value="overview" className="text-base font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="events" className="text-base font-semibold">My Events</TabsTrigger>
            <TabsTrigger value="performance" className="text-base font-semibold">Performance</TabsTrigger>
            <TabsTrigger value="profile" className="text-base font-semibold">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{statistics.totalEvents}</div>
                  <p className="text-sm text-blue-600 mt-1">All time registrations</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{statistics.completedEvents}</div>
                  <p className="text-sm text-green-600 mt-1">Events finished</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{statistics.upcomingEvents}</div>
                  <p className="text-sm text-orange-600 mt-1">Events registered</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Personal Bests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{Object.keys(statistics.personalBests).length}</div>
                  <p className="text-sm text-purple-600 mt-1">Categories achieved</p>
                </CardContent>
              </Card>
            </div>

            {/* Registration & Payment Status */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Registration Status
                  </CardTitle>
                  <CardDescription>Current status of your event registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Approved</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{statistics.registrationSummary.approved}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Pending</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">{statistics.registrationSummary.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Rejected</span>
                      </div>
                      <Badge className="bg-red-100 text-red-800">{statistics.registrationSummary.rejected}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Status
                  </CardTitle>
                  <CardDescription>Payment status for your registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>Verified</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{statistics.paymentSummary.verified}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Paid</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{statistics.paymentSummary.paid}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Pending</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">{statistics.paymentSummary.pending}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Bests */}
            {Object.keys(statistics.personalBests).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    Personal Best Times
                  </CardTitle>
                  <CardDescription>Your fastest times in each category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statistics.personalBests).map(([category, best]) => (
                      <div key={category} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-900">{category}</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-900 mb-1">{best.time}</div>
                        <div className="text-sm text-yellow-700">
                          <div>{best.event}</div>
                          <div>{formatDate(best.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/events">
                    <Button className="w-full h-16 flex flex-col gap-2" variant="outline">
                      <Plus className="w-5 h-5" />
                      <span>Browse Events</span>
                    </Button>
                  </Link>
                  <Link href="/runner/my-events">
                    <Button className="w-full h-16 flex flex-col gap-2" variant="outline">
                      <Calendar className="w-5 h-5" />
                      <span>My Events</span>
                    </Button>
                  </Link>
                  <Link href="/runner/profile">
                    <Button className="w-full h-16 flex flex-col gap-2" variant="outline">
                      <User className="w-5 h-5" />
                      <span>Update Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Upcoming Events ({events.upcoming.length})
                  </CardTitle>
                  <CardDescription>Events you're registered for</CardDescription>
                </CardHeader>
                <CardContent>
                  {events.upcoming.length > 0 ? (
                    <div className="space-y-4">
                      {events.upcoming.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{event.name}</h4>
                            <Badge className={getStatusColor(event.registrationStatus)}>
                              {getStatusIcon(event.registrationStatus)}
                              <span className="ml-1">{event.registrationStatus}</span>
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              {event.category}
                            </div>
                          </div>
                        </div>
                      ))}
                      {events.upcoming.length > 5 && (
                        <Link href="/runner/my-events">
                          <Button variant="outline" className="w-full">
                            View All Upcoming Events
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                      <Link href="/events">
                        <Button className="mt-4">Browse Events</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Recent Results
                  </CardTitle>
                  <CardDescription>Your latest race performances</CardDescription>
                </CardHeader>
                <CardContent>
                  {performance.recentResults.length > 0 ? (
                    <div className="space-y-4">
                      {performance.recentResults.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{event.name}</h4>
                            {event.result?.ranking && (
                              <Badge variant="outline">
                                <Medal className="w-4 h-4 mr-1" />
                                #{event.result.ranking}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4" />
                              {event.result?.completionTime || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              {event.category}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.date)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No race results yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Complete your first event to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-8">
            {performance.trends.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Trends
                    </CardTitle>
                    <CardDescription>Your average ranking over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performance.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="averageRanking" 
                          stroke="#2563eb" 
                          name="Average Ranking"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Monthly Activity
                    </CardTitle>
                    <CardDescription>Events completed per month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performance.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="eventsCount" fill="#16a34a" name="Events" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Performance Data</h3>
                  <p className="text-muted-foreground mb-6">Complete more events to see your performance trends</p>
                  <Link href="/events">
                    <Button>Find Events to Join</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-lg">{formatDate(profile.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-lg">{profile.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">T-Shirt Size</label>
                    <p className="text-lg">{profile.tshirtSize}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg">{profile.emergencyContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{profile.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                    <p className="text-lg">{profile.emergencyContact.relationship}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-lg">{profile.address}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 