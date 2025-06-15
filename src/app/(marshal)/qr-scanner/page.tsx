"use client";

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
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
  Barcode
} from 'lucide-react';

interface ScanResult {
  id: string;
  data: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
  format: string; // QR_CODE, CODE_128, EAN_13, etc.
  participantInfo?: {
    name: string;
    bibNumber: string;
    category: string;
  };
}

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<{data: string, format: string} | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [lastScanData, setLastScanData] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scanningPaused, setScanningPaused] = useState(false);
  const [staffInfo] = useState({
    name: "Race Staff",
    position: "Scanner Operator",
    eventId: "EVENT-001"
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const SCAN_DEBOUNCE_TIME = 2000; // 2 seconds debounce for same data
  const PAUSE_AFTER_SCAN = 3000; // 3 seconds pause after successful scan

  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

  const startScanning = async () => {
    console.log("startScanning called");
    console.log("videoRef.current:", videoRef.current);
    console.log("isScanning:", isScanning);
    console.log("hasCamera:", hasCamera);
    
    if (!videoRef.current) {
      console.error("Video ref not available");
      toast({
        title: "Video Error",
        description: "Video element not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting Multi-Format Scanner (QR + Barcode)...");
      console.log("Video element:", videoRef.current);
      
      // Create multi-format reader (supports QR codes and barcodes)
      const reader = new BrowserMultiFormatReader();
      console.log("BrowserMultiFormatReader created");
      setCodeReader(reader);
      
      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();
      console.log("Available cameras:", videoInputDevices);
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found");
      }
      
      // Prefer back camera for better scanning
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const deviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId;
      setSelectedDeviceId(deviceId);
      
      console.log("Starting scanner with device:", deviceId);
      console.log("Selected device:", backCamera || videoInputDevices[0]);
      
      // Set scanning state before starting
      setIsScanning(true);
      setHasCamera(true);
      
      // Start scanning
      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const data = result.getText();
            const format = result.getBarcodeFormat().toString();
            const currentTime = Date.now();
            
            // Skip if scanning is paused
            if (scanningPaused) {
              console.log("Scanning paused, ignoring detection");
              return;
            }
            
            // Debounce: prevent scanning the same data within SCAN_DEBOUNCE_TIME
            if (data === lastScanData && (currentTime - lastScanTime) < SCAN_DEBOUNCE_TIME) {
              console.log("Ignoring duplicate scan within debounce period");
              return;
            }
            
            // Prevent processing multiple scans simultaneously
            if (isProcessingScan) {
              console.log("Ignoring scan while processing previous scan");
              return;
            }
            
            console.log("Scan successful:", result);
            
            // Pause scanning immediately after detection
            setScanningPaused(true);
            
            handleScanResult(data, format);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error);
          }
        }
      );
      
      console.log("Multi-format scanner started successfully");
      
      // Additional check to ensure video is playing and force visibility
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Video element after start:", {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            readyState: videoRef.current.readyState,
            srcObject: videoRef.current.srcObject
          });
          
          // Force the video to be visible
          const video = videoRef.current;
          video.style.display = 'block';
          video.style.opacity = '1';
          video.style.width = '100%';
          video.style.height = '256px';
          video.style.visibility = 'visible';
          video.style.position = 'relative';
          console.log("Forced video visibility");
        }
      }, 1000);
      
      toast({
        title: "Scanner Started",
        description: "QR code and barcode scanner is now active",
      });
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
      setCodeReader(null);
    }
    
    // Reset all scanning states
    setIsScanning(false);
    setCurrentScan(null);
    setScanningPaused(false);
    setIsProcessingScan(false);
    setLastScanData('');
    setLastScanTime(0);
    
    // Clear video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    toast({
      title: "Scanner Stopped",
      description: "QR code and barcode scanner has been stopped",
    });
  };

  const handleScanResult = (data: string, format: string) => {
    // Set processing flag to prevent multiple simultaneous scans
    setIsProcessingScan(true);
    setCurrentScan({data, format});
    
    // Update debounce tracking
    setLastScanData(data);
    setLastScanTime(Date.now());
    
    // Simulate participant data lookup based on scan result
    const mockParticipantData = {
      name: `Runner ${Math.floor(Math.random() * 100) + 1}`,
      bibNumber: `#${Math.floor(Math.random() * 999) + 100}`,
      category: ['10K', '5K', 'Marathon', 'Half Marathon'][Math.floor(Math.random() * 4)]
    };

    const newScanResult: ScanResult = {
      id: Date.now().toString(),
      data,
      timestamp: new Date(),
      status: data.includes('error') ? 'error' : data.includes('warning') ? 'warning' : 'success',
      format: format,
      participantInfo: mockParticipantData
    };

    setScanResults(prev => [newScanResult, ...prev.slice(0, 19)]); // Keep last 20 scans
    
    // Show toast notification
    if (newScanResult.status === 'success') {
      const formatLabel = format.includes('QR') ? 'QR Code' : 'Barcode';
      toast({
        title: `${formatLabel} Scan Successful`,
        description: `${format} - Participant: ${mockParticipantData.name} (${mockParticipantData.bibNumber})`,
      });
    } else if (newScanResult.status === 'error') {
      toast({
        title: "Scan Error",
        description: "Invalid code detected",
        variant: "destructive",
      });
    }

    // Clear current scan and reset flags after delay
    setTimeout(() => {
      setCurrentScan(null);
      setIsProcessingScan(false);
    }, 2000);

    // Resume scanning after pause period
    setTimeout(() => {
      setScanningPaused(false);
      console.log("Scanning resumed after pause period");
    }, PAUSE_AFTER_SCAN);
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

  // Add CSS styles to force video visibility
  useEffect(() => {
    const styleId = 'qr-scanner-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Force QR scanner video to be visible */
        video[data-qr-scanner-video],
        .qr-scanner video,
        video.qr-scanner-video {
          display: block !important;
          opacity: 1 !important;
          width: 100% !important;
          height: 256px !important;
          visibility: visible !important;
          object-fit: cover !important;
          position: relative !important;
        }
        
        /* Override any inline styles from the library */
        video[style*="opacity: 0"] {
          opacity: 1 !important;
        }
        
        video[style*="width: 0px"] {
          width: 100% !important;
        }
        
        video[style*="height: 0px"] {
          height: 256px !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ScanLine className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl font-bold">QR Code & Barcode Scanner</CardTitle>
                  <CardDescription className="text-blue-100">
                    Race Event Staff Multi-Format Scanner
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-blue-100">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{staffInfo.name}</span>
                </div>
                <div className="text-xs text-blue-200">{staffInfo.position}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <Barcode className="h-5 w-5" />
                <span>Multi-Format Scanner</span>
              </CardTitle>
              <CardDescription>
                Point camera at QR codes or barcodes to scan participant information
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
                  onLoadedMetadata={() => console.log("Video metadata loaded")}
                  onPlay={() => console.log("Video started playing")}
                  onError={(e) => console.error("Video error:", e)}
                />
                {!isScanning && (
                  <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Camera not active</p>
                    </div>
                  </div>
                )}
                
                {/* Current Scan Overlay */}
                {currentScan && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg max-w-xs">
                      <div className="text-center">
                        {currentScan.format.includes('QR') ? (
                          <ScanLine className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        ) : (
                          <Barcode className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm font-medium">
                          {currentScan.format.includes('QR') ? 'QR Code' : 'Barcode'} Detected
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">{currentScan.format}</p>
                        <p className="text-xs text-gray-500 mt-1 break-all">{currentScan.data}</p>
                        {isProcessingScan && (
                          <p className="text-xs text-orange-500 mt-2 font-medium">Processing...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="flex space-x-2">
                {!isScanning ? (
                  <Button 
                    onClick={startScanning} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!hasCamera}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanner
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScanning} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Scanner
                  </Button>
                )}
                
                {/* Resume Scanning Button */}
                {isScanning && scanningPaused && (
                  <Button 
                    onClick={() => {
                      setScanningPaused(false);
                      console.log("Scanning manually resumed");
                    }} 
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

              {/* Status Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Scans</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{scanResults.length}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Timer className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {scanResults.length > 0 
                      ? Math.round((scanResults.filter(r => r.status === 'success').length / scanResults.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
              
              {/* Processing Status */}
              {isProcessingScan && (
                <div className="flex items-center justify-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-orange-700 font-medium">
                    Processing scan - Next scan available in 2 seconds
                  </span>
                </div>
              )}
              
              {/* Scanning Paused Status */}
              {isScanning && scanningPaused && !isProcessingScan && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 font-medium">
                      Scanning paused - Move barcode away from camera
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setScanningPaused(false);
                      console.log("Scanning manually resumed");
                    }} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Resume Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Results Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Scans</span>
              </CardTitle>
              <CardDescription>
                Latest scanned participant information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
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
                                  <Badge variant="outline" className="text-xs">
                                    {result.participantInfo.bibNumber}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Category: {result.participantInfo.category}
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

        {/* Action Buttons for Staff Operations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Staff Actions</CardTitle>
            <CardDescription>
              Additional operations for race staff (UI ready for future integration)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">Check In</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                <XCircle className="h-6 w-6" />
                <span className="text-sm">Check Out</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                <Timer className="h-6 w-6" />
                <span className="text-sm">Record Time</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                <Users className="h-6 w-6" />
                <span className="text-sm">View Details</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 