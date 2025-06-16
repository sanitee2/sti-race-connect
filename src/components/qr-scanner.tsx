"use client";

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, AlertCircle, Barcode } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string, format: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showControls?: boolean;
  autoStart?: boolean;
}

interface QRScannerComponentState {
  isScanning: boolean;
  hasCamera: boolean;
  error: string | null;
  currentScan: {data: string, format: string} | null;
}

export const QRScannerComponent = ({
  onScan,
  onError,
  className = "",
  title = "QR Code & Barcode Scanner",
  description = "Point camera at QR codes or barcodes to scan",
  showControls = true,
  autoStart = false
}: QRScannerProps) => {
  const [state, setState] = useState<QRScannerComponentState>({
    isScanning: false,
    hasCamera: true,
    error: null,
    currentScan: null
  });
  
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [lastScanData, setLastScanData] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scanningPaused, setScanningPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const SCAN_DEBOUNCE_TIME = 2000; // 2 seconds debounce for same data
  const PAUSE_AFTER_SCAN = 3000; // 3 seconds pause after successful scan

  useEffect(() => {
    if (autoStart) {
      startScanning();
    }
    
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [autoStart]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setState(prev => ({ ...prev, error: null }));
      
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      
      const videoInputDevices = await reader.listVideoInputDevices();
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const deviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId || '';
      
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
              return;
            }
            
            // Debounce: prevent scanning the same data within SCAN_DEBOUNCE_TIME
            if (data === lastScanData && (currentTime - lastScanTime) < SCAN_DEBOUNCE_TIME) {
              return;
            }
            
            // Prevent processing multiple scans simultaneously
            if (isProcessingScan) {
              return;
            }
            
            // Pause scanning immediately after detection
            setScanningPaused(true);
            
            handleScanResult(data, format);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error);
          }
        }
      );

      setState(prev => ({ 
        ...prev, 
        isScanning: true, 
        hasCamera: true, 
        error: null 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to access camera';
      setState(prev => ({ 
        ...prev, 
        hasCamera: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
      setCodeReader(null);
    }
    
    // Reset all scanning states
    setState(prev => ({ 
      ...prev, 
      isScanning: false, 
      currentScan: null,
      error: null
    }));
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
  };

  const handleScanResult = (data: string, format: string) => {
    // Set processing flag to prevent multiple simultaneous scans
    setIsProcessingScan(true);
    setState(prev => ({ ...prev, currentScan: {data, format} }));
    
    // Update debounce tracking
    setLastScanData(data);
    setLastScanTime(Date.now());
    
    onScan(data, format);
    
    // Clear current scan and reset processing flag after delay
    setTimeout(() => {
      setState(prev => ({ ...prev, currentScan: null }));
      setIsProcessingScan(false);
    }, 2000);

    // Resume scanning after pause period
    setTimeout(() => {
      setScanningPaused(false);
    }, PAUSE_AFTER_SCAN);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
                           {/* Video Element */}
          <div className="relative w-full h-64">
            <video
              ref={videoRef}
              className={`w-full h-64 bg-gray-100 rounded-lg object-cover ${state.isScanning ? 'block' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
            {!state.isScanning && (
              <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {state.error ? (
                    <>
                      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-500 text-sm">{state.error}</p>
                    </>
                  ) : (
                    <>
                      <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Camera not active</p>
                    </>
                  )}
                </div>
              </div>
            )}
          
          {/* Current Scan Overlay */}
          {state.currentScan && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg max-w-xs">
                <div className="text-center">
                  {state.currentScan.format.includes('QR') ? (
                    <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  ) : (
                    <Barcode className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  )}
                  <p className="text-sm font-medium">
                    {state.currentScan.format.includes('QR') ? 'QR Code' : 'Barcode'} Detected
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{state.currentScan.format}</p>
                  <p className="text-xs text-gray-500 mt-1 break-all">{state.currentScan.data}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Controls */}
        {showControls && (
          <div className="flex space-x-2">
            {!state.isScanning ? (
              <Button 
                onClick={startScanning} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!state.hasCamera && state.error !== null}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScannerComponent; 