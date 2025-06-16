"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  QrCode, 
  Download, 
  Calendar, 
  MapPin, 
  User,
  Trophy,
  Clock,
  Eye,
  FileImage,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer
} from 'lucide-react';

interface ParticipantRegistration {
  id: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
  };
  category: {
    id: string;
    name: string;
  };
  registrationStatus: string;
  paymentStatus: string;
  hasQRCode: boolean;
  qrCodeUrl?: string;
  qrCodeData?: string;
  registrationDate: string;
}

export default function MyQRCodesPage() {
  const [registrations, setRegistrations] = useState<ParticipantRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<ParticipantRegistration | null>(null);
  const [generatingQRFor, setGeneratingQRFor] = useState<string | null>(null);

  useEffect(() => {
    loadMyRegistrations();
  }, []);

  const loadMyRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/runner/my-registrations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error("Failed to load your registrations");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = (registration: ParticipantRegistration) => {
    if (!registration.qrCodeUrl) return;

    // Create download link
    const link = document.createElement('a');
    link.href = registration.qrCodeUrl;
    link.download = `${registration.event.name.replace(/\s+/g, '_')}_${registration.category.name.replace(/\s+/g, '_')}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("QR code downloaded successfully");
  };

  const printQRCode = (registration: ParticipantRegistration) => {
    if (!registration.qrCodeUrl) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My QR Code - ${registration.event.name}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
              border: 3px solid #333;
              border-radius: 12px;
              padding: 30px;
              background: white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .event-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .event-details {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              margin: 20px auto;
              border: 2px solid #ddd;
              border-radius: 8px;
            }
            .participant-info {
              margin-top: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .participant-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .category-info {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .instructions {
              margin-top: 20px;
              padding: 15px;
              background: #e8f4fd;
              border: 1px solid #bee5eb;
              border-radius: 8px;
              font-size: 12px;
              text-align: left;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="event-title">${registration.event.name}</div>
            <div class="event-details">
              ${new Date(registration.event.date).toLocaleDateString()} | ${registration.event.location}
            </div>
            
            <img src="${registration.qrCodeUrl}" alt="My QR Code" class="qr-code" />
            
            <div class="participant-info">
              <div class="participant-name">Participant QR Code</div>
              <div class="category-info">Category: ${registration.category.name}</div>
              <div class="category-info">Registration Date: ${new Date(registration.registrationDate).toLocaleDateString()}</div>
            </div>
            
            <div class="instructions">
              <strong>Race Day Instructions:</strong>
              <ul>
                <li>Bring this QR code to the race event</li>
                <li>Present it to marshals at the finish line for scanning</li>
                <li>Keep the QR code visible and undamaged</li>
                <li>This QR code is unique to you and this event</li>
              </ul>
            </div>
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
      
      toast.success("Print dialog opened for your QR code");
    } else {
      toast.error("Unable to open print window. Please check your browser's popup settings.");
    }
  };

  const printAllQRCodes = () => {
    const qrRegistrations = approvedRegistrations.filter(r => r.hasQRCode);
    
    if (qrRegistrations.length === 0) {
      toast.error("No QR codes available to print");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My QR Codes</title>
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
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 30px;
            }
            .qr-card {
              border: 2px solid #333;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }
            .event-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
            }
            .event-details {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            .qr-code {
              width: 180px;
              height: 180px;
              margin: 15px auto;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .category-badge {
              background: #f0f0f0;
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 6px 12px;
              font-size: 12px;
              display: inline-block;
              margin-top: 10px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-title">My Race QR Codes</div>
            <div>Generated: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="qr-grid">
            ${qrRegistrations.map(registration => `
              <div class="qr-card">
                <div class="event-title">${registration.event.name}</div>
                <div class="event-details">
                  ${new Date(registration.event.date).toLocaleDateString()} | ${registration.event.location}
                </div>
                <img src="${registration.qrCodeUrl}" alt="QR Code for ${registration.event.name}" class="qr-code" />
                <div class="category-badge">${registration.category.name}</div>
              </div>
            `).join('')}
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
      
      toast.success(`Print dialog opened for ${qrRegistrations.length} QR codes`);
    } else {
      toast.error("Unable to open print window. Please check your browser's popup settings.");
    }
  };

  const getStatusBadge = (registration: ParticipantRegistration) => {
    if (registration.registrationStatus === 'Approved' && registration.paymentStatus === 'Verified') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (registration.registrationStatus === 'Rejected' || registration.paymentStatus === 'Rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const getQRStatusBadge = (registration: ParticipantRegistration) => {
    if (registration.registrationStatus !== 'Approved' || registration.paymentStatus !== 'Verified') {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Approval Required
        </Badge>
      );
    } else if (registration.hasQRCode) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          QR Ready
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Generating QR
        </Badge>
      );
    }
  };

  const generateQRCode = async (registration: ParticipantRegistration) => {
    try {
      setGeneratingQRFor(registration.id);
      
      const response = await fetch('/api/runner/generate-my-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: registration.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR code');
      }

      const result = await response.json();
      toast.success(result.message);

      // Reload registrations to show the new QR code
      await loadMyRegistrations();

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate QR code');
    } finally {
      setGeneratingQRFor(null);
    }
  };

  const approvedRegistrations = registrations.filter(r => 
    r.registrationStatus === 'Approved' && r.paymentStatus === 'Verified'
  );
  const pendingRegistrations = registrations.filter(r => 
    r.registrationStatus !== 'Approved' || r.paymentStatus !== 'Verified'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <QrCode className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">My QR Codes</CardTitle>
                <CardDescription className="text-blue-100">
                  View and download your race participant QR codes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-blue-600">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedRegistrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <QrCode className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">QR Codes Ready</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {approvedRegistrations.filter(r => r.hasQRCode).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approved Registrations with QR Codes */}
        {approvedRegistrations.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Your QR Codes</span>
                    <Badge variant="secondary">
                      {approvedRegistrations.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Download and print your QR codes for race day scanning
                  </CardDescription>
                </div>
                {approvedRegistrations.filter(r => r.hasQRCode).length > 0 && (
                  <Button
                    onClick={printAllQRCodes}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print All QR Codes ({approvedRegistrations.filter(r => r.hasQRCode).length})</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedRegistrations.map((registration) => (
                  <Card key={registration.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {registration.event.name}
                          </CardTitle>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{registration.event.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Category:</span>
                          <Badge variant="outline">{registration.category.name}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          {getStatusBadge(registration)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">QR Code:</span>
                          {getQRStatusBadge(registration)}
                        </div>

                        {/* QR Code Actions */}
                        {registration.hasQRCode && (
                          <div className="space-y-2 pt-2">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedQRCode(registration.qrCodeUrl!);
                                  setSelectedRegistration(registration);
                                }}
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View QR
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => downloadQRCode(registration)}
                                className="flex-1"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printQRCode(registration)}
                              className="w-full"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Print QR Code
                            </Button>
                          </div>
                        )}

                        {/* QR Code Not Ready Message */}
                        {registration.registrationStatus === 'Approved' && 
                         registration.paymentStatus === 'Verified' && 
                         !registration.hasQRCode && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-800">
                                QR code needs to be generated for this registration.
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => generateQRCode(registration)}
                              disabled={generatingQRFor === registration.id}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                              {generatingQRFor === registration.id ? (
                                <>
                                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2"></div>
                                  Generating QR Code...
                                </>
                              ) : (
                                <>
                                  <QrCode className="h-3 w-3 mr-2" />
                                  Generate QR Code
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Registrations */}
        {pendingRegistrations.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>Pending Approvals</span>
                <Badge variant="secondary">
                  {pendingRegistrations.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                These registrations are waiting for marshal approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {pendingRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{registration.event.name}</p>
                        <p className="text-sm text-gray-600">{registration.category.name}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(registration)}
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* No Registrations Message */}
        {!isLoading && registrations.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No Registrations Found</h3>
                  <p className="text-gray-600 mt-2">
                    You haven't registered for any events yet. Register for an event to get your QR code.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code Preview Dialog */}
        <Dialog open={!!selectedQRCode} onOpenChange={() => {
          setSelectedQRCode(null);
          setSelectedRegistration(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your QR Code</DialogTitle>
              <DialogDescription>
                {selectedRegistration && (
                  <>
                    {selectedRegistration.event.name} - {selectedRegistration.category.name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center p-4">
                {selectedQRCode && (
                  <img 
                    src={selectedQRCode} 
                    alt="Your QR Code" 
                    className="w-64 h-64 border rounded-lg"
                  />
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => selectedRegistration && downloadQRCode(selectedRegistration)}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => selectedRegistration && printQRCode(selectedRegistration)}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600">Loading your registrations...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 