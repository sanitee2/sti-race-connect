"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Building2, Users, Calendar, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MarshalApplication {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  verification_status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  marshal_profile: {
    date_of_birth: string;
    gender: string;
    address?: string;
    organization_name: string;
    role_position: string;
    social_media_links?: string;
    responsibilities: string;
  };
}

export default function MarshalVerificationPage() {
  const [pendingApplications, setPendingApplications] = useState<MarshalApplication[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<MarshalApplication[]>([]);
  const [rejectedApplications, setRejectedApplications] = useState<MarshalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/marshal-applications');
      if (response.ok) {
        const data = await response.json();
        setPendingApplications(data.pending || []);
        setApprovedApplications(data.approved || []);
        setRejectedApplications(data.rejected || []);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch marshal applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleVerification = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingId(userId);
    try {
      const response = await fetch(`/api/admin/marshal-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Marshal application ${action}d successfully.`,
        });
        // Refresh the applications
        await fetchApplications();
      } else {
        throw new Error(`Failed to ${action} application`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} marshal application. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const ApplicationCard = ({ application, showActions = false }: { application: MarshalApplication; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.profile_picture} />
              <AvatarFallback>
                {application.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{application.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Applied on {formatDate(application.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(application.verification_status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{application.email}</span>
            </div>
            {application.phone_number && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{application.phone_number}</span>
              </div>
            )}
            {application.marshal_profile.address && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{application.marshal_profile.address}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Born: {formatDate(application.marshal_profile.date_of_birth)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span>{application.marshal_profile.organization_name}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>{application.marshal_profile.role_position}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{application.marshal_profile.gender}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Responsibilities</h4>
          <p className="text-sm text-muted-foreground">{application.marshal_profile.responsibilities}</p>
        </div>

        {application.marshal_profile.social_media_links && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Social Media</h4>
            <p className="text-sm text-muted-foreground">{application.marshal_profile.social_media_links}</p>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                  disabled={processingId === application.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Marshal Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve {application.name}'s marshal application? 
                    They will be able to access the marshal dashboard and participate in events.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleVerification(application.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  disabled={processingId === application.id}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Marshal Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject {application.name}'s marshal application? 
                    This action cannot be undone and they will need to reapply.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleVerification(application.id, 'reject')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject Application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marshal Verification</h1>
          <p className="text-sm text-muted-foreground">
            Review and verify marshal applications
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marshal Verification</h1>
        <p className="text-sm text-muted-foreground">
          Review and verify marshal applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Applications
            {pendingApplications.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Applications</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                <p className="text-muted-foreground">All marshal applications have been reviewed.</p>
              </Card>
            ) : (
              pendingApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  showActions={true}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Approved Applications</h3>
                <p className="text-muted-foreground">No marshal applications have been approved yet.</p>
              </Card>
            ) : (
              approvedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {rejectedApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rejected Applications</h3>
                <p className="text-muted-foreground">No marshal applications have been rejected.</p>
              </Card>
            ) : (
              rejectedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 