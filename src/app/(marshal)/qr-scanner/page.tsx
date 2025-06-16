"use client";

import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Users, 
  Timer,
  ScanLine,
  AlertTriangle,
  Clock,
  User,
  Barcode,
  Trophy,
  CalendarDays,
  MapPin,
  Target,
  Play,
  Pause,
  Settings,
  Medal
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  description: string;
  targetAudience: string;
  gunStartTime?: string;
  cutOffTime?: string;
  participantsCount: number;
  finishedCount: number;
  participants: Participant[];
}

interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  rfidNumber?: string;
  hasResult: boolean;
  result?: {
    completionTime: string;
    ranking: number;
    recordedAt: string;
  };
}

interface ScanResult {
  id: string;
  data: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
  format: string;
  participantInfo?: {
    id: string;
    name: string;
    category: string;
    completionTime?: string;
    ranking?: number;
  };
}

interface RankingResult {
  id: string;
  participantId: string;
  participantName: string;
  completionTime: string;
  ranking: number;
  recordedAt: string;
}

export default function CategoryQRScannerPage() {
  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<{data: string, format: string} | null>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [lastScanData, setLastScanData] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scanningPaused, setScanningPaused] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Event and category states
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Results and ranking states
  const [rankings, setRankings] = useState<RankingResult[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);

  // Manual time input states
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const SCAN_DEBOUNCE_TIME = 2000;
  const PAUSE_AFTER_SCAN = 3000;

  // Load events and categories on component mount
  useEffect(() => {
    loadEventsAndCategories();
  }, []);

  // Update selected event when eventId changes
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event || null);
      setSelectedCategoryId(''); // Reset category selection
      setSelectedCategory(null);
    }
  }, [selectedEventId, events]);

  // Update selected category when categoryId changes
  useEffect(() => {
    if (selectedCategoryId && selectedEvent) {
      const category = selectedEvent.categories.find(c => c.id === selectedCategoryId);
      setSelectedCategory(category || null);
      if (category) {
        loadRankings(category.id);
      }
    }
  }, [selectedCategoryId, selectedEvent]);

  // Initialize camera list on component mount
  useEffect(() => {
    const initializeCameras = async () => {
      try {
        const cameras = await QrScanner.listCameras(true);
        setAvailableCameras(cameras);
        
        // Try to select back camera by default
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        );
        
        setSelectedCameraId(backCamera?.id || cameras[0]?.id || '');
      } catch (error) {
        console.error('Error listing cameras:', error);
        setHasCamera(false);
      }
    };

    initializeCameras();
  }, []);

  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.destroy();
      }
    };
  }, [qrScanner]);

  const loadEventsAndCategories = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch('/api/marshal/events-categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events and categories');
      }

      const data = await response.json();
      setEvents(data.events || []);
      
      if (data.events?.length > 0) {
        const mostRecentEvent = data.events[0];
        setSelectedEventId(mostRecentEvent.id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load events and categories",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadRankings = async (categoryId: string) => {
    try {
      setIsLoadingRankings(true);
      const response = await fetch(`/api/marshal/scan-result?categoryId=${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }

      const data = await response.json();
      setRankings(data.results || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setIsLoadingRankings(false);
    }
  };

  const startScanning = async () => {
    if (!selectedCategory) {
      toast({
        title: "Selection Required",
        description: "Please select an event and category before starting the scanner",
        variant: "destructive",
      });
      return;
    }

    if (!videoRef.current) {
      toast({
        title: "Video Error",
        description: "Video element not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (availableCameras.length === 0) {
      toast({
        title: "No Cameras",
        description: "No camera devices found. Please check camera permissions.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new QR scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const data = result.data;
          const currentTime = Date.now();
          
          // Skip if scanning is paused or processing
          if (scanningPaused || isProcessingScan) return;
          
          // Debounce duplicate scans
          if (data === lastScanData && (currentTime - lastScanTime) < SCAN_DEBOUNCE_TIME) return;
          
          // Pause scanning temporarily to prevent rapid duplicate scans
          setScanningPaused(true);
          handleScanResult(data, 'QR_CODE');
        },
        {
          onDecodeError: (error) => {
            // Only log non-routine decode errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage && !errorMessage.includes('No QR code found')) {
              console.warn('QR decode error:', error);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCameraId || 'environment',
          maxScansPerSecond: 5,
        }
      );

      setQrScanner(scanner);
      setIsScanning(true);
      setHasCamera(true);
      setScanningPaused(false);

      // Start the scanner
      await scanner.start();
      
      toast({
        title: "Scanner Started",
        description: `Scanning for ${selectedCategory.name} participants`,
      });
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasCamera(false);
      setIsScanning(false);
      
      let errorMessage = "Unable to access camera. Please check permissions.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access denied. Please allow camera permissions and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found. Please connect a camera and try again.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Camera is already in use by another application.";
        }
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    
    setIsScanning(false);
    setCurrentScan(null);
    setScanningPaused(false);
    setIsProcessingScan(false);
    setLastScanData('');
    setLastScanTime(0);
    
    toast({
      title: "Scanner Stopped",
      description: "QR code scanner has been stopped",
    });
  };

  const switchCamera = async (cameraId: string) => {
    if (!qrScanner || !isScanning) return;
    
    try {
      await qrScanner.setCamera(cameraId);
      setSelectedCameraId(cameraId);
      toast({
        title: "Camera Switched",
        description: "Successfully switched to selected camera",
      });
    } catch (error) {
      console.error('Error switching camera:', error);
      toast({
        title: "Camera Switch Failed",
        description: "Unable to switch to selected camera",
        variant: "destructive",
      });
    }
  };

  const handleScanResult = async (data: string, format: string) => {
    setIsProcessingScan(true);
    setCurrentScan({data, format});
    
    setLastScanData(data);
    setLastScanTime(Date.now());

    try {
      // Parse QR code data - can be various formats
      let participantId = data;
      let parsedData: any = null;
      
      // Try to parse as JSON first (structured data)
      try {
        parsedData = JSON.parse(data);
        if (parsedData.participantId) {
          participantId = parsedData.participantId;
        } else if (parsedData.userId) {
          // If only userId provided, we'll search by userId
          participantId = parsedData.userId;
        }
      } catch {
        // Not JSON, treat as simple string (participant ID, user ID, or RFID)
        participantId = data.trim();
      }
      
      // Try to find the participant in the selected category
      const participant = selectedCategory?.participants.find(p => 
        p.id === participantId || 
        p.userId === participantId || 
        p.rfidNumber === participantId ||
        // Additional checks for structured data
        (parsedData?.userId && p.userId === parsedData.userId) ||
        (parsedData?.rfidNumber && p.rfidNumber === parsedData.rfidNumber)
      );

      if (!participant) {
        throw new Error('Participant not found in this category');
      }

      if (participant.hasResult) {
        throw new Error('Result already recorded for this participant');
      }

      // Get current time for completion
      const currentTime = new Date();
      const completionTime = getCurrentCompletionTime();

      // Record the result
      if (!selectedCategory) {
        throw new Error('No category selected');
      }

      const response = await fetch('/api/marshal/scan-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participant.id,
          categoryId: selectedCategory.id,
          completionTime: completionTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record result');
      }

      const resultData = await response.json();

      const newScanResult: ScanResult = {
        id: Date.now().toString(),
        data,
        timestamp: new Date(),
        status: 'success',
        format: format,
        participantInfo: {
          id: participant.id,
          name: participant.name,
          category: selectedCategory.name,
          completionTime: completionTime,
          ranking: resultData.result?.ranking,
        }
      };

      setScanResults(prev => [newScanResult, ...prev.slice(0, 19)]);

      // Reload rankings to show updated results
      await loadRankings(selectedCategory.id);
      await loadEventsAndCategories(); // Refresh participant data

      toast({
        title: "Result Recorded!",
        description: `${participant.name} finished with time ${completionTime}${resultData.result?.ranking ? ` (Rank #${resultData.result.ranking})` : ''}`,
      });

    } catch (error) {
      console.error('Error processing scan result:', error);
      
      const errorResult: ScanResult = {
        id: Date.now().toString(),
        data,
        timestamp: new Date(),
        status: 'error',
        format: format,
      };

      setScanResults(prev => [errorResult, ...prev.slice(0, 19)]);

      toast({
        title: "Scan Error",
        description: error instanceof Error ? error.message : 'Failed to process scan result',
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setCurrentScan(null);
      setIsProcessingScan(false);
    }, 2000);

    setTimeout(() => {
      setScanningPaused(false);
    }, PAUSE_AFTER_SCAN);
  };

  const getCurrentCompletionTime = (): string => {
    if (showManualInput && manualTimeInput) {
      return manualTimeInput;
    }
    
    // Auto-generate time based on current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const recordManualTime = async () => {
    if (!manualTimeInput || !selectedCategory) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid time and select a category",
        variant: "destructive",
      });
      return;
    }

    // This would typically be used with a participant selection dialog
    toast({
      title: "Manual Time Entry",
      description: "Please scan participant QR code to record this time",
    });
  };

  const clearScanHistory = () => {
    setScanResults([]);
    toast({
      title: "History Cleared",
      description: "All scan results have been cleared",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatTime = (timeString: string) => {
    // Display time in a readable format
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl font-bold">Event Category QR Scanner</CardTitle>
                  <CardDescription className="text-blue-100">
                    Record participant results and real-time rankings
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                {selectedEvent && (
                  <div className="text-blue-100">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-sm">{selectedEvent.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">{selectedEvent.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Event and Category Selection */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Event & Category Selection</span>
            </CardTitle>
            <CardDescription>
              Select the event and category to start scanning participants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Event</Label>
                <Select 
                  value={selectedEventId} 
                  onValueChange={setSelectedEventId}
                  disabled={isLoadingEvents}
                >
                  <SelectTrigger id="event-select">
                    <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex flex-col">
                          <span>{event.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()} - {event.location}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-select">Category</Label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                  disabled={!selectedEvent || selectedEvent.categories.length === 0}
                >
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder={
                      !selectedEvent 
                        ? "Select event first" 
                        : selectedEvent.categories.length === 0 
                          ? "No categories available" 
                          : "Select a category"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEvent?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">
                            {category.participantsCount} participants, {category.finishedCount} finished
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCategory && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{selectedCategory.participantsCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Finished</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{selectedCategory.finishedCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Remaining</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedCategory.participantsCount - selectedCategory.finishedCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCategory.participantsCount > 0 
                        ? Math.round((selectedCategory.finishedCount / selectedCategory.participantsCount) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <ScanLine className="h-5 w-5" />
                <span>Participant Scanner</span>
              </CardTitle>
              <CardDescription>
                Scan participant QR codes to record completion times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Element */}
              <div className="relative w-full h-64">
                <video
                  ref={videoRef}
                  className={`w-full h-64 bg-gray-100 rounded-lg object-cover ${isScanning ? 'block' : 'hidden'}`}
                  autoPlay
                  muted
                  playsInline
                />
                {!isScanning && (
                  <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {!hasCamera 
                          ? 'No camera access - check permissions' 
                          : availableCameras.length === 0 
                            ? 'Loading cameras...' 
                            : !selectedCategory 
                              ? 'Select event & category first'
                              : 'Camera ready - click Start Scanner'
                        }
                      </p>
                      {!hasCamera && (
                        <p className="text-xs text-red-500 mt-2">
                          Please allow camera permissions and refresh the page
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Current Scan Overlay */}
                {currentScan && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg max-w-xs">
                      <div className="text-center">
                        <ScanLine className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">QR Code Detected</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">{currentScan.format}</p>
                        <p className="text-xs text-gray-500 mt-1 break-all">{currentScan.data}</p>
                        {isProcessingScan && (
                          <p className="text-xs text-orange-500 mt-2 font-medium">Recording result...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Selection */}
              {availableCameras.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="camera-select">Camera</Label>
                  <Select 
                    value={selectedCameraId} 
                    onValueChange={(cameraId) => {
                      setSelectedCameraId(cameraId);
                      if (isScanning) {
                        switchCamera(cameraId);
                      }
                    }}
                  >
                    <SelectTrigger id="camera-select">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>{camera.label || `Camera ${camera.id}`}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Scanner Controls */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  {!isScanning ? (
                    <Button 
                      onClick={startScanning} 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!hasCamera || !selectedCategory || availableCameras.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Scanner
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopScanning} 
                      variant="destructive" 
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Scanner
                    </Button>
                  )}
                  
                  {isScanning && scanningPaused && (
                    <Button 
                      onClick={() => setScanningPaused(false)} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ScanLine className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={clearScanHistory}
                    disabled={scanResults.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {/* Manual Time Input */}
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowManualInput(!showManualInput)}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      Manual Time
                    </Button>
                  </div>
                  
                  {showManualInput && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="HH:MM:SS.mmm (e.g., 01:23:45.123)"
                        value={manualTimeInput}
                        onChange={(e) => setManualTimeInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={recordManualTime} size="sm">
                        Set
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Processing Status */}
              {isProcessingScan && (
                <div className="flex items-center justify-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-orange-700 font-medium">
                    Recording result...
                  </span>
                </div>
              )}
              
              {/* Scanning Paused Status */}
              {isScanning && scanningPaused && !isProcessingScan && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 font-medium">
                      Scanning paused - Move QR code away from camera
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setScanningPaused(false)} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Resume Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Rankings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Medal className="h-5 w-5" />
                <span>Live Rankings</span>
                {selectedCategory && (
                  <Badge variant="secondary">
                    {selectedCategory.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time participant rankings by completion time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {isLoadingRankings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading rankings...</p>
                  </div>
                ) : rankings.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No results yet</p>
                    <p className="text-sm text-gray-400">Start scanning to see live rankings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankings.map((result, index) => (
                      <div key={result.id} className="border rounded-lg p-3 bg-white shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              result.ranking === 1 ? 'bg-yellow-100 text-yellow-800' :
                              result.ranking === 2 ? 'bg-gray-100 text-gray-800' :
                              result.ranking === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {result.ranking}
                            </div>
                            <div>
                              <p className="font-medium">{result.participantName}</p>
                              <p className="text-sm text-gray-500">
                                {formatTime(result.completionTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">
                              {new Date(result.recordedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Scans</span>
            </CardTitle>
            <CardDescription>
              Latest scan results and processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {scanResults.length === 0 ? (
                <div className="text-center py-8">
                  <ScanLine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No scans yet</p>
                  <p className="text-sm text-gray-400">Start scanning to see results</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanResults.map((result, index) => (
                    <div key={result.id} className="border rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(result.status)}
                            <Badge className={getStatusColor(result.status)}>
                              {result.status.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.format}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {result.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {result.participantInfo && (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-sm font-medium">{result.participantInfo.name}</span>
                                {result.participantInfo.ranking && (
                                  <Badge variant="outline" className="text-xs">
                                    Rank #{result.participantInfo.ranking}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Category: {result.participantInfo.category}
                                {result.participantInfo.completionTime && (
                                  <span> • Time: {formatTime(result.participantInfo.completionTime)}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400 font-mono mt-2 break-all">
                            {result.data}
                          </div>
                        </div>
                      </div>
                      {index < scanResults.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 