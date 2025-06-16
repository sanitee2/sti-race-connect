"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  QrCode, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Target,
  Printer,
  FileImage,
  Zap
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  participantsCount: number;
  finishedCount: number;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  category: string;
  event: string;
  hasQRCode: boolean;
  qrCodeUrl?: string;
}

interface QRCodeStatus {
  eventId: string;
  eventName: string;
  categoryId?: string;
  totalParticipants: number;
  participantsWithQR: number;
  participantsWithoutQR: number;
  completionPercentage: number;
}

export default function ParticipantQRCodesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [qrStatus, setQRStatus] = useState<QRCodeStatus | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-qr' | 'without-qr'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  
  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Update selected event when eventId changes
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event || null);
      setSelectedCategoryId('');
      loadQRStatus();
    }
  }, [selectedEventId, events]);

  // Update QR status when category changes
  useEffect(() => {
    if (selectedEventId) {
      loadQRStatus();
    }
  }, [selectedCategoryId]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marshal/events-categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
      
      if (data.events?.length > 0) {
        setSelectedEventId(data.events[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQRStatus = async () => {
    if (!selectedEventId) return;

    try {
      const params = new URLSearchParams({ eventId: selectedEventId });
      if (selectedCategoryId) {
        params.append('categoryId', selectedCategoryId);
      }

      const response = await fetch(`/api/marshal/bulk-generate-qr?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR status');
      }

      const status = await response.json();
      setQRStatus(status);
    } catch (error) {
      console.error('Error loading QR status:', error);
    }
  };

  const generateQRCodes = async (forceRegenerate = false) => {
    if (!selectedEventId) return;

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      const requestBody: any = {
        eventId: selectedEventId,
        forceRegenerate,
      };

      if (selectedCategoryId) {
        requestBody.categoryId = selectedCategoryId;
      }

      const response = await fetch('/api/marshal/bulk-generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR codes');
      }

      const result = await response.json();
      setParticipants(result.participants || []);

      toast.success(result.message);

      // Reload status
      await loadQRStatus();

    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate QR codes");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const downloadQRCode = (participant: Participant) => {
    if (!participant.qrCodeUrl) return;

    // Create download link
    const link = document.createElement('a');
    link.href = participant.qrCodeUrl;
    link.download = `${participant.name.replace(/\s+/g, '_')}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRCodes = async () => {
    const participantsWithQR = participants.filter(p => p.hasQRCode && p.qrCodeUrl);
    
    if (participantsWithQR.length === 0) {
          toast.error("No participants have QR codes to download");
      return;
    }

    // Download each QR code
    for (const participant of participantsWithQR) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
      downloadQRCode(participant);
    }

    toast.success(`Downloading ${participantsWithQR.length} QR codes`);
  };

  const printQRCodes = () => {
    const participantsWithQR = participants.filter(p => p.hasQRCode && p.qrCodeUrl);
    
    if (participantsWithQR.length === 0) {
      toast.error("No participants have QR codes to print");
      return;
    }

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Participant QR Codes - ${selectedEvent?.name || 'Event'}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .event-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .event-details {
              font-size: 14px;
              color: #666;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .qr-card {
              border: 2px solid #333;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }
            .qr-code {
              width: 150px;
              height: 150px;
              margin: 10px auto;
              border: 1px solid #ddd;
            }
            .participant-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .participant-details {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .category-badge {
              background: #f0f0f0;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 11px;
              display: inline-block;
              margin-top: 5px;
            }
            .instructions {
              margin-top: 20px;
              padding: 15px;
              background: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 12px;
            }
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-title">${selectedEvent?.name || 'Event'} - Participant QR Codes</div>
            <div class="event-details">
              ${selectedEvent?.date ? `Date: ${new Date(selectedEvent.date).toLocaleDateString()}` : ''} | 
              ${selectedEvent?.location || ''} | 
              ${selectedCategoryId ? selectedEvent?.categories.find(c => c.id === selectedCategoryId)?.name || 'All Categories' : 'All Categories'}
            </div>
            <div class="event-details">Generated: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="qr-grid">
            ${participantsWithQR.map(participant => `
              <div class="qr-card">
                <div class="participant-name">${participant.name}</div>
                <div class="participant-details">${participant.email}</div>
                <img src="${participant.qrCodeUrl}" alt="QR Code for ${participant.name}" class="qr-code" />
                <div class="category-badge">${participant.category}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="instructions">
            <strong>Instructions:</strong>
            <ul>
              <li>Cut along the borders to separate individual QR codes</li>
              <li>Distribute QR codes to participants before race day</li>
              <li>Participants should bring their QR code for scanning at finish line</li>
              <li>Each QR code is unique to the participant and event category</li>
            </ul>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
      
      toast.success(`Print dialog opened for ${participantsWithQR.length} QR codes`);
    } else {
      toast.error("Unable to open print window. Please check your browser's popup settings.");
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'with-qr' && participant.hasQRCode) ||
                         (filterStatus === 'without-qr' && !participant.hasQRCode);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <QrCode className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl font-bold">Participant QR Codes</CardTitle>
                  <CardDescription className="text-blue-100">
                    Generate and manage QR codes for race participants
                  </CardDescription>
                </div>
              </div>
              {selectedEvent && (
                <div className="text-right text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{selectedEvent.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">{selectedEvent.location}</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Event and Category Selection */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Event & Category Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Event</Label>
                <Select 
                  value={selectedEventId} 
                  onValueChange={setSelectedEventId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading events..." : "Select an event"} />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex flex-col">
                          <span>{event.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-select">Category (Optional)</Label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {selectedEvent?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* QR Code Status */}
            {qrStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{qrStatus.totalParticipants}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">With QR</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{qrStatus.participantsWithQR}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Without QR</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{qrStatus.participantsWithoutQR}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <QrCode className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{qrStatus.completionPercentage}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>QR Code Generation Progress</span>
                    <span>{qrStatus.completionPercentage}%</span>
                  </div>
                  <Progress value={qrStatus.completionPercentage} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>QR Code Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => generateQRCodes(false)}
                disabled={isGenerating || !selectedEventId}
                className="bg-green-600 hover:bg-green-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate Missing QR Codes
              </Button>

              <Button
                onClick={() => generateQRCodes(true)}
                disabled={isGenerating || !selectedEventId}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate All QR Codes
              </Button>

              <Button
                onClick={downloadAllQRCodes}
                disabled={participants.filter(p => p.hasQRCode).length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All QR Codes
              </Button>

              <Button
                onClick={() => printQRCodes()}
                disabled={participants.filter(p => p.hasQRCode).length === 0}
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print QR Codes ({participants.filter(p => p.hasQRCode).length})
              </Button>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-blue-700 font-medium">
                    Generating QR codes...
                  </span>
                </div>
                {generationProgress > 0 && (
                  <Progress value={generationProgress} className="h-2" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Participants</span>
                <Badge variant="secondary">
                  {filteredParticipants.length} / {participants.length}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus as any}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Participants</SelectItem>
                    <SelectItem value="with-qr">With QR Codes</SelectItem>
                    <SelectItem value="without-qr">Without QR Codes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>QR Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.category}</TableCell>
                      <TableCell>
                        {participant.hasQRCode ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            QR Ready
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            No QR Code
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {participant.hasQRCode && participant.qrCodeUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedQRCode(participant.qrCodeUrl!)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(participant)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* QR Code Preview Dialog */}
        <Dialog open={!!selectedQRCode} onOpenChange={() => setSelectedQRCode(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code Preview</DialogTitle>
              <DialogDescription>
                Participant QR code for race scanning
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4">
              {selectedQRCode && (
                <img 
                  src={selectedQRCode} 
                  alt="Participant QR Code" 
                  className="w-64 h-64 border rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 