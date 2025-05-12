"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'success' | 'info' | 'default';

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: ConfirmationVariant;
  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isConfirmLoading?: boolean;
  confirmIcon?: React.ReactNode;
  contentClassName?: string;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  confirmButtonVariant = "default",
  isConfirmLoading = false,
  confirmIcon,
  contentClassName,
}: ConfirmationDialogProps) {
  // Handle cancel action with optional callback
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  // Variant-based icon and styles
  const getVariantDetails = (variant: ConfirmationVariant) => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle className="h-5 w-5 text-destructive" />,
          buttonVariant: "destructive" as const,
          headerClass: "border-b-destructive/20"
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-warning" />,
          buttonVariant: "default" as const,
          headerClass: "border-b-warning/20"
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-success" />,
          buttonVariant: "default" as const,
          headerClass: "border-b-success/20"
        };
      case 'info':
        return {
          icon: <Info className="h-5 w-5 text-info" />,
          buttonVariant: "default" as const,
          headerClass: "border-b-info/20"
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-primary" />,
          buttonVariant: "default" as const,
          headerClass: "border-b-border"
        };
    }
  };

  const { icon, buttonVariant, headerClass } = getVariantDetails(variant);
  const finalConfirmButtonVariant = confirmButtonVariant || buttonVariant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn("sm:max-w-md overflow-hidden", contentClassName)}
        onInteractOutside={(e) => {
          if (variant === 'danger') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className={cn("pb-4 mb-4 border-b", headerClass)}>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {confirmIcon || icon}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="pt-2 text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="flex sm:justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="mt-2 sm:mt-0"
          >
            {cancelText}
          </Button>
          <Button
            variant={finalConfirmButtonVariant}
            onClick={onConfirm}
            className="flex items-center gap-2"
            disabled={isConfirmLoading}
          >
            {isConfirmLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></span>
            ) : confirmIcon}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 