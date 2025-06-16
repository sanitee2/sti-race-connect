"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Search, 
  Download, 
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Shirt,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Participant {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: string;
    tshirtSize?: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
  category: {
    id: string;
    name: string;
    targetAudience: string;
  };
  rfidNumber?: string;
  registrationStatus: string;
  paymentStatus: string;
  registrationDate: Date;
}

interface ParticipantsByCategory {
  [categoryName: string]: {
    category: {
      id: string;
      name: string;
      targetAudience: string;
    };
    participants: Participant[];
  };
}

interface RegistrationData {
  eventName: string;
  totalParticipants: number;
  participantsByCategory: ParticipantsByCategory;
  allParticipants: Participant[];
}

interface RegistrationCardProps {
  eventId: string;
}

export function RegistrationCard({ eventId }: RegistrationCardProps) {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/participants`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      
      const data = await response.json();
      setRegistrationData(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'registration' | 'payment') => {
    const baseClasses = "text-xs font-medium";
    
    if (type === 'registration') {
      switch (status.toLowerCase()) {
        case 'approved':
          return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800`}>Approved</Badge>;
        case 'pending':
          return <Badge variant="secondary" className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</Badge>;
        case 'rejected':
          return <Badge variant="destructive" className={`${baseClasses}`}>Rejected</Badge>;
        default:
          return <Badge variant="outline" className={`${baseClasses}`}>{status}</Badge>;
      }
    } else {
      switch (status.toLowerCase()) {
        case 'paid':
          return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800`}>Paid</Badge>;
        case 'verified':
          return <Badge variant="default" className={`${baseClasses} bg-blue-100 text-blue-800`}>Verified</Badge>;
        case 'pending':
          return <Badge variant="secondary" className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</Badge>;
        default:
          return <Badge variant="outline" className={`${baseClasses}`}>{status}</Badge>;
      }
    }
  };

  const filteredParticipants = registrationData?.allParticipants.filter(participant => {
    const matchesSearch = 
      participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || participant.category.name === selectedCategory;
    
    const matchesStatus = statusFilter === "all" || 
      participant.registrationStatus.toLowerCase() === statusFilter.toLowerCase() ||
      participant.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const exportToCSV = () => {
    if (!registrationData) return;
    
    const csvData = filteredParticipants.map(participant => ({
      'Name': participant.user.name,
      'Email': participant.user.email,
      'Phone': participant.user.phone || '',
      'Category': participant.category.name,
      'Registration Status': participant.registrationStatus,
      'Payment Status': participant.paymentStatus,
      'Registration Date': format(new Date(participant.registrationDate), 'yyyy-MM-dd HH:mm:ss'),
      'RFID Number': participant.rfidNumber || '',
      'Date of Birth': participant.user.dateOfBirth ? format(new Date(participant.user.dateOfBirth), 'yyyy-MM-dd') : '',
      'Gender': participant.user.gender || '',
      'T-shirt Size': participant.user.tshirtSize || '',
      'Address': participant.user.address || '',
      'Emergency Contact Name': participant.user.emergencyContact?.name || '',
      'Emergency Contact Phone': participant.user.emergencyContact?.phone || '',
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${registrationData.eventName}_participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!registrationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load registration data</p>
            <Button onClick={fetchParticipants} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(registrationData.participantsByCategory);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registration ({registrationData.totalParticipants} participants)
          </CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{registrationData.totalParticipants}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {registrationData.allParticipants.filter(p => p.registrationStatus.toLowerCase() === 'approved').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">
              {registrationData.allParticipants.filter(p => p.registrationStatus.toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">Paid</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {registrationData.allParticipants.filter(p => p.paymentStatus.toLowerCase() === 'paid' || p.paymentStatus.toLowerCase() === 'verified').length}
            </p>
          </div>
        </div>

        {/* Participants Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Participants</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="border rounded-lg">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>RFID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{participant.user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {participant.user.email}
                            </div>
                            {participant.user.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {participant.user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(participant.registrationStatus, 'registration')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(participant.paymentStatus, 'payment')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(participant.registrationDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {participant.rfidNumber || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="by-category" className="mt-4">
            <div className="space-y-6">
              {categories.map(categoryName => {
                const categoryData = registrationData.participantsByCategory[categoryName];
                const categoryParticipants = categoryData.participants.filter(participant => {
                  const matchesSearch = 
                    participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    participant.user.email.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const matchesStatus = statusFilter === "all" || 
                    participant.registrationStatus.toLowerCase() === statusFilter.toLowerCase() ||
                    participant.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
                  
                  return matchesSearch && matchesStatus;
                });

                if (categoryParticipants.length === 0) return null;

                return (
                  <Card key={categoryName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{categoryName}</span>
                        <Badge variant="secondary">{categoryParticipants.length} participants</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg">
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Participant</TableHead>
                                <TableHead>Registration</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>RFID</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {categoryParticipants.map((participant) => (
                                <TableRow key={participant.id}>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <p className="font-medium">{participant.user.name}</p>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Mail className="w-3 h-3" />
                                        {participant.user.email}
                                      </div>
                                      {participant.user.phone && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Phone className="w-3 h-3" />
                                          {participant.user.phone}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(participant.registrationStatus, 'registration')}
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(participant.paymentStatus, 'payment')}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(participant.registrationDate), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-sm font-mono">
                                    {participant.rfidNumber || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 