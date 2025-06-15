"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Filter, CheckCircle, XCircle, Eye, Clock, CreditCard, User, Mail, Phone, Calendar, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Participant {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
  };
  event: {
    id: string;
    event_name: string;
  };
  category: {
    id: string;
    category_name: string;
  };
  rfid_number: string | null;
  registration_status: string;
  payment_status: string;
  payment_receipt_url?: string;
  registered_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

interface Event {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    description: string;
    targetAudience: string;
    participants: number;
    image?: string;
  }[];
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchParticipants();
    fetchEvents();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/marshal/participants');
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const handleVerifyPayment = async (participantId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/marshal/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to process verification');
      
      await fetchParticipants();
      setIsVerificationDialogOpen(false);
      setSelectedParticipant(null);
      setRejectionReason("");
      
      toast.success(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error('Failed to process verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const openVerificationDialog = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsVerificationDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'Verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'Paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CreditCard className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredParticipants = participants.filter(participant => 
    participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.category.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingParticipants = filteredParticipants.filter(p => p.payment_status === 'Pending');
  const approvedParticipants = filteredParticipants.filter(p => p.payment_status === 'Verified');
  const rejectedParticipants = filteredParticipants.filter(p => p.payment_status === 'Rejected');

  const ParticipantTable = ({ participants: tableParticipants, showActions = true }: { participants: Participant[], showActions?: boolean }) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Registration Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Registered At</TableHead>
            {showActions && <TableHead className="text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableParticipants.length > 0 ? (
            tableParticipants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{participant.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{participant.user.email}</span>
                    </div>
                    {participant.user.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{participant.user.phone_number}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{participant.event.event_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span>{participant.category.category_name}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(participant.registration_status)}</TableCell>
                <TableCell>{getStatusBadge(participant.payment_status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{formatDate(participant.registered_at)}</span>
                  </div>
                </TableCell>
                {showActions && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openVerificationDialog(participant)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Receipt
                      </Button>
                      {participant.payment_status === 'Pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyPayment(participant.id, 'approve')}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this payment? Please provide a reason.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Textarea
                                  placeholder="Reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRejectionReason("")}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleVerifyPayment(participant.id, 'reject')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reject Payment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                No participants found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">
            Manage runners participating in your events.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          Manage runners participating in your events and verify their payment receipts.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search participants..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <Button variant="outline">Export List</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Verification
            {pendingParticipants.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pendingParticipants.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Payment Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={pendingParticipants} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Approved Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={approvedParticipants} showActions={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Rejected Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={rejectedParticipants} showActions={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={filteredParticipants} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Receipt Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Receipt Verification
            </DialogTitle>
            <DialogDescription>
              Review the payment receipt and verify or reject the participant's registration.
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="space-y-6">
              {/* Participant Information */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Participant Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedParticipant.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedParticipant.user.email}</span>
                    </div>
                    {selectedParticipant.user.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedParticipant.user.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Registration Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Event:</strong> {selectedParticipant.event.event_name}</div>
                    <div><strong>Category:</strong> {selectedParticipant.category.category_name}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedParticipant.payment_status)}</div>
                    <div><strong>Registered:</strong> {formatDate(selectedParticipant.registered_at)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Receipt */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  GCash Payment Receipt
                </h4>
                {selectedParticipant.payment_receipt_url ? (
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <img 
                      src={selectedParticipant.payment_receipt_url} 
                      alt="Payment Receipt" 
                      className="max-w-full h-auto max-h-96 mx-auto rounded border"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No payment receipt uploaded</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason if rejected */}
              {selectedParticipant.rejection_reason && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-red-700 text-sm">{selectedParticipant.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>
              Close
            </Button>
            {selectedParticipant?.payment_status === 'Pending' && (
              <>
                <Button
                  onClick={() => handleVerifyPayment(selectedParticipant.id, 'approve')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Payment
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Payment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please provide a reason for rejecting this payment. The participant will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Reason for rejection (e.g., incorrect amount, unclear receipt, etc.)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setRejectionReason("")}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleVerifyPayment(selectedParticipant.id, 'reject')}
                        disabled={!rejectionReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject Payment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 