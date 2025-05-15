"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Building2,
  Save,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from '@/components/ui/image-upload';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Form schema based on organizations model in prisma schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Organization name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  logo_url: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  phone_number: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  social_media: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

// Define form steps
const formSteps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Start with the essentials',
    fields: ['name', 'description', 'logo_url']
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'How people can reach you',
    fields: ['address', 'email', 'phone_number', 'website']
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Connect your online presence',
    fields: ['social_media.facebook', 'social_media.twitter', 'social_media.instagram', 'social_media.linkedin']
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm your organization details',
    fields: []
  }
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      logo_url: "",
      address: "",
      website: "",
      phone_number: "",
      email: "",
      social_media: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
    },
    mode: "onChange"
  });

  const watchAllFields = form.watch();
  
  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Format the social media object for the API
      const socialMedia = Object.entries(values.social_media || {})
        .filter(([_, value]) => value && value.trim() !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      // Prepare the submission data
      const submissionData = {
        ...values,
        // Only include social media if there are actual values
        social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined
      };
      
      // Send data to API
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }
      
      const organization = await response.json();
      
      // Show success toast
      toast.success("Organization created successfully!", {
        description: "You've been assigned as the owner."
      });
      
      // Navigate back to organizations page
      router.push('/organizations');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error("Failed to create organization", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Navigation functions
  const goToNextStep = async () => {
    // Validate current step's fields
    const currentStepFields = formSteps[currentStep].fields;
    
    // If fields exist, validate them
    if (currentStepFields.length > 0) {
      const result = await form.trigger(currentStepFields as any[]);
      if (!result) return; // Don't proceed if validation fails
    }
    
    // If we're on the last step, submit the form
    if (currentStep === formSteps.length - 1) {
      form.handleSubmit(onSubmit)();
      return;
    }
    
    // Otherwise move to next step
    setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump directly to a specific step (if allowed)
  const jumpToStep = (stepIndex: number) => {
    // Only allow jumping to steps that come before the current one
    // or the next step if current step is valid
    if (stepIndex < currentStep || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if current step has errors
  const currentStepHasErrors = () => {
    const currentStepFields = formSteps[currentStep].fields;
    return currentStepFields.some(field => {
      const fieldError = form.formState.errors[field.split('.')[0] as keyof z.infer<typeof formSchema>];
      return !!fieldError;
    });
  };

  // Format field name for display
  const formatFieldName = (name: string) => {
    return name
      .split('.')
      .pop()
      ?.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase()) || '';
  };

  // Get the current progress percentage
  const progressPercentage = (currentStep / (formSteps.length - 1)) * 100;

  return (
    <div className="space-y-6 pb-10">
      {/* Header with back button and progress bar */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 mb-4 p-0 h-auto"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Organizations</span>
        </Button>
        
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Create Organization</h1>
          <p className="text-muted-foreground">
            Create a new racing organization or team
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6 relative">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {formSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center cursor-pointer transition-colors ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => jumpToStep(index)}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all 
                    ${index < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index === currentStep 
                        ? 'border-2 border-primary text-primary'
                        : 'border border-muted-foreground/30 text-muted-foreground'
                    }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 font-medium hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{formSteps[currentStep].title}</CardTitle>
                  <CardDescription>{formSteps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information Step */}
                  {currentStep === 0 && (
                    <>
                      {/* Logo Field */}
                      <FormField
                        control={form.control}
                        name="logo_url"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              Organization Logo
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center justify-center">
                                <div className="w-auto">
                                  <ImageUpload 
                                    variant="profile"
                                    onChange={(value) => {
                                      form.setValue('logo_url', value as string, { 
                                        shouldValidate: true,
                                        shouldDirty: true,
                                        shouldTouch: true 
                                      });
                                    }}
                                    images={field.value ? [field.value] : []}
                                    useCloud={true}
                                    folder="organization-logo"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Upload your organization's logo or profile image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Name Field - Required */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              Organization Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="STI Race Team" {...field} />
                            </FormControl>
                            <FormDescription>
                              The official name of your organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Description Field - Required */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              Description <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your organization's mission, activities, and focus areas..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Provide a detailed description of your organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {/* Contact Details Step */}
                  {currentStep === 1 && (
                    <>
                      {/* Address Field - Optional */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="123 Race Way, Speed City" {...field} />
                            </FormControl>
                            <FormDescription>
                              Physical address of your organization (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Email Field - Optional */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="contact@organization.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Public contact email for your organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Phone Number Field - Optional */}
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormDescription>
                              Contact phone number (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Website Field - Optional */}
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourorganization.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your organization's website URL (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {/* Social Media Step */}
                  {currentStep === 2 && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your organization's social media accounts to enhance your profile (all fields optional)
                      </p>
                      
                      {/* Facebook */}
                      <FormField
                        control={form.control}
                        name="social_media.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Facebook className="h-4 w-4 text-muted-foreground" />
                              Facebook
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/yourpage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Twitter */}
                      <FormField
                        control={form.control}
                        name="social_media.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-muted-foreground" />
                              Twitter / X
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/yourhandle" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Instagram */}
                      <FormField
                        control={form.control}
                        name="social_media.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Instagram className="h-4 w-4 text-muted-foreground" />
                              Instagram
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/yourprofile" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* LinkedIn */}
                      <FormField
                        control={form.control}
                        name="social_media.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-muted-foreground" />
                              LinkedIn
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/company/yourcompany" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {/* Review Step */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Review your organization details before creating. You can go back to any step to make changes.
                      </p>
                      
                      {/* Basic Information Summary */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground">BASIC INFORMATION</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium">Organization Name</h4>
                            <p className="text-sm">{watchAllFields.name || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Logo</h4>
                            <p className="text-sm">{watchAllFields.logo_url ? "Uploaded" : "Not provided"}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description</h4>
                          <p className="text-sm line-clamp-3">{watchAllFields.description || "Not provided"}</p>
                        </div>
                        <Separator />
                      </div>
                      
                      {/* Contact Details Summary */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground">CONTACT DETAILS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium">Email</h4>
                            <p className="text-sm">{watchAllFields.email || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Phone</h4>
                            <p className="text-sm">{watchAllFields.phone_number || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Website</h4>
                            <p className="text-sm">{watchAllFields.website || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Address</h4>
                            <p className="text-sm">{watchAllFields.address || "Not provided"}</p>
                          </div>
                        </div>
                        <Separator />
                      </div>
                      
                      {/* Social Media Summary */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground">SOCIAL MEDIA</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(watchAllFields.social_media || {}).map(([platform, url]) => (
                            <div key={platform}>
                              <h4 className="text-sm font-medium">{formatFieldName(platform)}</h4>
                              <p className="text-sm">{url || "Not provided"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={isSubmitting || currentStepHasErrors()}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting && currentStep === formSteps.length - 1 ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : currentStep === formSteps.length - 1 ? (
                      <>
                        <Save className="h-4 w-4" />
                        Create Organization
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Preview Card */}
        <div className="hidden md:block">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Organization Preview</CardTitle>
              <CardDescription>See how your organization will appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-md border">
                  {watchAllFields.logo_url ? (
                    <AvatarImage src={watchAllFields.logo_url} alt={watchAllFields.name || "Organization"} />
                  ) : (
                    <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                      {watchAllFields.name ? watchAllFields.name.substring(0, 2).toUpperCase() : "ORG"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {watchAllFields.name || "Your Organization Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {watchAllFields.description || "Organization description will appear here..."}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Contact Information</h4>
                
                {(watchAllFields.email || watchAllFields.phone_number || watchAllFields.website || watchAllFields.address) ? (
                  <div className="space-y-2 text-sm">
                    {watchAllFields.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{watchAllFields.address}</span>
                      </div>
                    )}
                    
                    {watchAllFields.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{watchAllFields.email}</span>
                      </div>
                    )}
                    
                    {watchAllFields.phone_number && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{watchAllFields.phone_number}</span>
                      </div>
                    )}
                    
                    {watchAllFields.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{watchAllFields.website}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No contact information provided yet
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Social Media</h4>
                
                {Object.values(watchAllFields.social_media || {}).some(v => v) ? (
                  <div className="flex flex-wrap gap-2">
                    {watchAllFields.social_media?.facebook && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Facebook className="h-3 w-3" />
                        Facebook
                      </Badge>
                    )}
                    
                    {watchAllFields.social_media?.twitter && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Twitter className="h-3 w-3" />
                        Twitter
                      </Badge>
                    )}
                    
                    {watchAllFields.social_media?.instagram && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        Instagram
                      </Badge>
                    )}
                    
                    {watchAllFields.social_media?.linkedin && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No social media links provided yet
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  This is a preview of how your organization will appear to users. Complete all steps to create your organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 