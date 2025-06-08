"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadToSpaces, deleteFromSpaces } from "@/lib/upload";
import { toast } from "sonner";

export type ImageUploadProps = {
  variant: "profile" | "gallery" | "featured";
  images?: string[];
  onChange: (value: string | string[]) => void;
  className?: string;
  maxImages?: number;
  folder?: string;
  useCloud?: boolean;
};

export function ImageUpload({
  variant,
  images = [],
  onChange,
  className,
  maxImages = 5,
  folder = variant === "profile" ? "profile-picture" : variant === "featured" ? "featured-images" : "image-gallery",
  useCloud = true,
}: ImageUploadProps) {
  const [files, setFiles] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);

  // Sync internal state with prop changes
  useEffect(() => {
    setFiles(images);
  }, [images]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true);
        
        if (useCloud) {
          // Upload to Digital Ocean Spaces
          if (variant === "profile" || variant === "featured") {
            // For profile and featured, we only need one image
            const file = acceptedFiles[0];
            
            // Delete the previous image if it exists
            const previousImage = files.length > 0 ? files[0] : null;
            if (previousImage && !previousImage.startsWith("data:")) {
              try {
                await deleteFromSpaces(previousImage);
              } catch (error) {
                console.error("Failed to delete previous image:", error);
                // Continue with upload even if deletion fails
              }
            }
            
            const url = await uploadToSpaces(file, folder);
            setFiles([url]);
            onChange(url);
          } else {
            // For gallery, upload multiple images
            if (files.length < maxImages) {
              const uploadPromises = acceptedFiles
                .slice(0, maxImages - files.length)
                .map(file => uploadToSpaces(file, folder));
              
              const uploadedUrls = await Promise.all(uploadPromises);
              const newFiles = [...files, ...uploadedUrls];
              setFiles(newFiles);
              onChange(newFiles);
            }
          }
        } else {
          // Legacy approach using data URLs
          acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const dataUrl = event.target.result as string;
                
                if (variant === "profile" || variant === "featured") {
                  // For profile picture and featured image, replace the current image
                  setFiles([dataUrl]);
                  onChange(dataUrl);
                } else {
                  // For gallery, add to existing images (up to maxImages)
                  if (files.length < maxImages) {
                    const newFiles = [...files, dataUrl];
                    setFiles(newFiles);
                    onChange(newFiles);
                  }
                }
              }
            };
            reader.readAsDataURL(file);
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [files, variant, onChange, maxImages, folder, useCloud]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: variant === "profile" || variant === "featured" ? 1 : maxImages,
    disabled: isUploading,
  });

  const removeImage = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles[index];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Delete from Digital Ocean Spaces if it's a cloud URL
    if (useCloud && removedFile && !removedFile.startsWith("data:")) {
      try {
        deleteFromSpaces(removedFile).catch(error => {
          console.error("Failed to delete image from storage:", error);
          toast.error("Failed to delete image from storage");
        });
      } catch (error) {
        console.error("Error initiating image deletion:", error);
      }
    }
    
    if (variant === "profile" || variant === "featured") {
      onChange("");
    } else {
      onChange(newFiles);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {variant === "profile" && (
        <div className="space-y-4 w-full">
          {files.length > 0 ? (
            <div className="relative mx-auto w-32 h-32">
              <div className="rounded-full overflow-hidden w-full h-full relative bg-muted">
                <Image
                  src={files[0]}
                  alt="Profile"
                  fill
                  sizes="128px"
                  className="object-cover !rounded-full"
                  style={{ borderRadius: '9999px' }}
                />
              </div>
              <div className="absolute top-1 right-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 rounded-full shadow-md z-10 flex items-center justify-center p-0"
                  onClick={() => removeImage(0)}
                  disabled={isUploading}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary/70 bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              )}
              <p className="text-xs text-muted-foreground text-center">
                {isDragActive 
                  ? "Drop image here" 
                  : isUploading 
                    ? "Uploading..." 
                    : "Drag & drop or click"}
              </p>
            </div>
          )}
        </div>
      )}

      {variant === "featured" && (
        <div className="space-y-4 w-full">
          {files.length > 0 ? (
            <div className="relative w-full">
              <div className="rounded-lg overflow-hidden w-full h-32 relative bg-muted">
                <Image
                  src={files[0]}
                  alt="Featured Image"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 rounded-full shadow-md z-10 flex items-center justify-center p-0"
                  onClick={() => removeImage(0)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg w-full h-32 flex flex-col items-center justify-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary/70 bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-muted-foreground text-center font-medium">
                {isDragActive 
                  ? "Drop featured image here" 
                  : isUploading 
                    ? "Uploading..." 
                    : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Recommended: 16:9 aspect ratio for best results
              </p>
            </div>
          )}
        </div>
      )}

      {variant === "gallery" && (
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                <Image
                  src={file}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {files.length < maxImages && (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary/70 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {isDragActive 
                    ? "Drop images here" 
                    : isUploading 
                      ? "Uploading..." 
                      : "Drag & drop or click"}
                </p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Upload up to {maxImages} images. Supported formats: JPEG, PNG, GIF, WebP.
          </p>
        </div>
      )}
    </div>
  );
} 