"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Trophy, Target, AlertCircle, Upload, CheckCircle2, CreditCard } from 'lucide-react';

interface EventCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  participants: number;
  image?: string;
}

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  category: EventCategory;
  onRegistrationSuccess: () => void;
  isAlreadyRegistered?: boolean;
  registeredCategoryName?: string;
}

export function EventRegistrationDialog({ 
  isOpen, 
  onClose, 
  eventId, 
  eventName,
  category, 
  onRegistrationSuccess,
  isAlreadyRegistered = false,
  registeredCategoryName
}: EventRegistrationDialogProps) {
  const { data: session } = useSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const handleRegistration = async () => {
    if (!session) {
      toast.error("Please sign in to register for events");
      return;
    }

    if (!paymentReceiptUrl) {
      toast.error("Please upload your GCash payment receipt");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          categoryId: category.id,
          paymentReceiptUrl: paymentReceiptUrl 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }

      const result = await response.json();
      toast.success(`Successfully registered for ${category.name}! Your registration is pending marshal verification.`);
      onRegistrationSuccess();
      onClose();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Failed to register for category");
    } finally {
      setIsRegistering(false);
    }
  };



  if (isAlreadyRegistered) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Already Registered
            </DialogTitle>
            <DialogDescription>
              You are already registered for this event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently registered for the <strong>{registeredCategoryName}</strong> category in this event. 
                You can only register for one category per event.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Register for {eventName}
          </DialogTitle>
          <DialogDescription>
            Complete your registration by uploading your GCash payment receipt.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Category Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {category.participants} registered
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{category.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">Target:</span>
              <span>{category.targetAudience}</span>
            </div>
          </div>

          {/* Payment Receipt Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h4 className="font-medium">GCash Payment Receipt</h4>
            </div>
            
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Please upload a screenshot of your GCash payment receipt. This will be verified by the event organizer.
              </AlertDescription>
            </Alert>

            <ImageUpload
              variant="featured"
              images={paymentReceiptUrl ? [paymentReceiptUrl] : []}
              onChange={(url) => {
                if (typeof url === 'string') {
                  setPaymentReceiptUrl(url);
                  setUploadError('');
                } else {
                  setUploadError('Error uploading receipt');
                }
              }}
              className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors"
              maxImages={1}
              folder="payment-receipts"
            />

            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {paymentReceiptUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Receipt uploaded successfully
                </p>
                <div className="border rounded-lg p-2">
                  <img 
                    src={paymentReceiptUrl} 
                    alt="GCash Receipt" 
                    className="max-h-32 w-auto rounded border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p><strong>Important:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You can only register for <strong>one category per event</strong></li>
                <li>Your registration requires <strong>marshal verification</strong> of your payment receipt</li>
                <li>You'll receive a notification once your registration is approved</li>
                <li>Make sure your GCash receipt shows the correct amount and transaction details</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isRegistering}>
            Cancel
          </Button>
          <Button 
            onClick={handleRegistration} 
            disabled={isRegistering || !paymentReceiptUrl}
            className="min-w-[120px]"
          >
            {isRegistering ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                <span>Registering...</span>
              </div>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Register Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 