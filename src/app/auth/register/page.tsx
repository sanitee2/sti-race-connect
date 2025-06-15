"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Zap, Flag, AlertCircle, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { OrganizationCombobox, getOrganizationById } from "@/components/organization-combobox";
import { ImageUpload } from "@/components/ui/image-upload";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  profile_picture: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  tshirtSize: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  organizationId: string;
  terms: boolean;
}

type Role = "Runner" | "Marshal";

interface StepType {
  name: string;
  fields: string[];
}

const steps: Record<Role, StepType[]> = {
  Runner: [
    { name: "Account Information", fields: ["name", "email", "password"] },
    { name: "Profile Picture", fields: ["profile_picture"] },
    { name: "Personal Details", fields: ["phoneNumber", "dateOfBirth", "gender", "address"] },
    { name: "Runner Information", fields: ["tshirtSize", "organizationId"] },
    { name: "Emergency Contact", fields: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship"] },
  ],
  Marshal: [
    { name: "Account Information", fields: ["name", "email", "password"] },
    { name: "Profile Picture", fields: ["profile_picture"] },
    { name: "Personal Details", fields: ["phoneNumber", "dateOfBirth", "gender", "address"] },
    { name: "Organization", fields: ["organizationId"] },
  ]
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("Runner");
  const [currentStep, setCurrentStep] = useState(0);
  const [iconVisible, setIconVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields },
    reset,
    setValue,
    watch,
    trigger,
    getValues
  } = useForm<RegisterFormData>({
    mode: "onChange"
  });

  const roleSteps = steps[selectedRole];

  useEffect(() => {
    setIconVisible(true);
    
    // Initialize dateOfBirth with current date
    const today = new Date();
    setValue('dateOfBirth', today, { shouldValidate: false });
    
    // Register date of birth field as required
    register('dateOfBirth', { 
      required: 'Date of birth is required',
      validate: (value) => {
        if (!value) return 'Date of birth is required';
        return true;
      }
    });
    
    // Register profile picture field (optional)
    register('profile_picture', { 
      required: false
    });
    
    // Register other select fields as required
    register('gender', { 
      required: 'Gender is required'
    });
    
    register('tshirtSize', { 
      required: 'T-shirt size is required'
    });
    
    // Register email with validation
    register('email', { 
      required: 'Email is required', 
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address'
      }
    });
    
    // Register password with validation
    register('password', { 
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters'
      },
      validate: {
        hasUpperCase: (value) => 
          /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
        hasLowerCase: (value) => 
          /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
        hasNumber: (value) => 
          /[0-9]/.test(value) || 'Password must contain at least one number',
        hasSpecialChar: (value) => 
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value) || 
          'Password must contain at least one special character'
      }
    });
    
    // Register terms checkbox
    register('terms', { 
      required: 'You must accept the terms and conditions to continue' 
    });
  }, [register, setValue]);

  const handleRoleChange = (role: Role) => {
    if (role === selectedRole) return;
    setSelectedRole(role);
    setCurrentStep(0);
    reset();
    setIconVisible(false);
    setTimeout(() => setIconVisible(true), 50);
  };

  const validateCurrentStep = async () => {
    // Get all fields in the current step
    const fieldsToValidate = roleSteps[currentStep].fields;
    
    // On the last step, also validate terms
    const fieldsToCheck = currentStep === roleSteps.length - 1 
      ? [...fieldsToValidate, 'terms'] 
      : fieldsToValidate;

    console.log('Validating fields:', fieldsToCheck);
    
    // Exclude optional fields
    const optionalFields = ['organizationId'];
    const requiredFields = fieldsToCheck.filter(field => !optionalFields.includes(field));
    
    // Make sure all required fields are registered properly
    requiredFields.forEach(field => {
      // Special handling for select fields like gender and tshirtSize
      if (field === 'gender' || field === 'tshirtSize') {
        const value = getValues(field as any);
        console.log(`Field ${field} value:`, value);
        
        if (!value) {
          setValue(field as any, '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
      }
    });
    
    // Trigger validation for these fields
    const result = await trigger(requiredFields as any[]);
    console.log('Validation result:', result);
    
    // If validation failed, log which fields have errors
    if (!result) {
      console.log('Field errors:', errors);
    }
    
    return result;
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, roleSteps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setRegistrationError(null);
      
      console.log('Form data before API submission:', data);
      console.log('Selected role:', selectedRole);
      
      // Validate required fields based on role
      const requiredFields = [
        'name',
        'email',
        'password',
        'phoneNumber',
        'dateOfBirth',
        'gender',
        'address',
        ...(selectedRole === 'Runner' 
          ? [
              'tshirtSize',
              'emergencyContactName',
              'emergencyContactPhone',
              'emergencyContactRelationship'
            ]
          : []  // No additional required fields for Marshal
        )
      ];
      
      const missingFields = requiredFields.filter(field => !data[field as keyof RegisterFormData]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Format registration data for API
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || null,
        profile_picture: data.profile_picture || null,
        role: selectedRole,
        profile: {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          ...(selectedRole === 'Runner' 
            ? {
                organizationId: data.organizationId || undefined,
                tshirtSize: data.tshirtSize,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                emergencyContactRelationship: data.emergencyContactRelationship
              } 
            : {
                organizationId: data.organizationId || undefined,
                organizationName: "Not specified",
                rolePosition: "Member",
                socialMediaLinks: null,
                responsibilities: "General marshal duties"
              }
          )
        }
      };
      
      console.log('Registration data being sent to API:', registrationData);
      
      // Send data to API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Check if registration was successful
      if (!response.ok) {
        // Try to parse validation errors from the API response
        if (responseData.message && responseData.message.includes('Validation failed:')) {
          throw new Error(responseData.message);
        }
        throw new Error(responseData.message || 'Registration failed');
      }
      
      // Registration successful
      console.log('Registration successful:', responseData);
      setRegistrationSuccess(true);
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/auth/login');
      }, selectedRole === 'Marshal' ? 3000 : 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (name: keyof RegisterFormData, value: string) => {
    setValue(name, value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  // Function to check if a step is complete
  const isStepComplete = (stepIndex: number) => {
    if (stepIndex >= currentStep) return false;
    
    const stepFields = roleSteps[stepIndex].fields;
    return stepFields.every(field => {
      const value = getValues(field as any);
      return value !== undefined && value !== "";
    });
  };

  // Function to navigate to a specific step if it's a previous completed step
  const goToStep = (stepIndex: number) => {
    // Allow going to previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStepIndicators = () => (
    <div className="relative flex justify-between mb-8">
      {/* Connecting lines - positioned to align with the center of the circles */}
      <div className="absolute top-[14px] left-[16px] right-[16px] flex items-center">
        <div className="w-full h-[2px] bg-muted-foreground/20">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${Math.max(((currentStep) / (roleSteps.length - 1)) * 100, 0)}%` 
            }}
          />
        </div>
      </div>
      
      {/* Step circles */}
      <div className="w-full flex justify-between z-10">
        {roleSteps.map((step: StepType, index: number) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const canNavigate = index < currentStep;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center ${canNavigate ? 'cursor-pointer' : ''}`}
              onClick={() => canNavigate && goToStep(index)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-0'
                    : isActive
                    ? 'bg-background text-primary ring-2 ring-primary'
                    : 'bg-background border border-muted-foreground/30'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Function to check if a field is valid
  const isFieldValid = (fieldName: string) => {
    const fieldValue = getValues(fieldName as any);
    return dirtyFields[fieldName as keyof RegisterFormData] && 
           !errors[fieldName as keyof RegisterFormData] && 
           fieldValue !== undefined && 
           fieldValue !== "";
  };

  const renderField = (fieldName: string) => {
    switch (fieldName) {
      case "name":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
            </Label>
            <div className="relative">
              <Input
                id={fieldName}
                type="text"
                placeholder={`Enter your ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                className={`${errors[fieldName as keyof RegisterFormData] ? "border-destructive pr-10" : ""} 
                           ${isFieldValid(fieldName) ? "border-green-500 pr-10" : ""}`}
                {...register(fieldName as keyof RegisterFormData, { required: true })}
                onBlur={() => trigger(fieldName as any)}
              />
              {errors[fieldName as keyof RegisterFormData] && (
                <AlertCircle className="h-5 w-5 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {isFieldValid(fieldName) && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {errors[fieldName as keyof RegisterFormData] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                This field is required
              </p>
            )}
          </div>
        );
      
      case "email":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>Email</Label>
            <div className="relative">
              <Input
                id={fieldName}
                type="email"
                placeholder="Enter your email address"
                className={`${errors.email ? "border-destructive pr-10" : ""} 
                           ${isFieldValid('email') ? "border-green-500 pr-10" : ""}`}
                {...register('email')}
                onBlur={() => trigger('email')}
              />
              {errors.email && (
                <AlertCircle className="h-5 w-5 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {isFieldValid('email') && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {errors.email && (
              <p className="text-destructive text-sm flex items-center gap-1">
                {typeof errors.email.message === 'string' ? errors.email.message : 'Email is required'}
              </p>
            )}
          </div>
        );
      
      case "password":
        const passwordStrength = getPasswordStrength(watch('password') || '');
        
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>Password</Label>
            <div className="relative group">
              <Input
                id={fieldName}
                type="password"
                placeholder="Enter your password"
                className={`${errors.password ? "border-destructive pr-10" : ""} 
                           ${isFieldValid('password') ? "border-green-500 pr-10" : ""}`}
                {...register('password')}
                onBlur={() => trigger('password')}
              />
              {errors.password && (
                <AlertCircle className="h-5 w-5 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {isFieldValid('password') && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              
              {/* Password validation popup */}
              {watch('password') && (
                <div className="absolute z-10 right-0 top-0 mt-12 w-64 bg-background border border-border rounded-md shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                  <div className="space-y-2">
                    {/* Password strength indicator */}
                    <div className="space-y-1">
                      <div className="flex gap-1 h-1.5">
                        <div className={`h-full flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </div>
                      <p className={`text-xs ${
                        passwordStrength === 0 ? 'text-muted-foreground' :
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-orange-500' :
                        passwordStrength === 3 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength === 0 && 'Enter a password'}
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Fair'}
                        {passwordStrength === 3 && 'Good'}
                        {passwordStrength === 4 && 'Strong'}
                      </p>
                    </div>
                    
                    {/* Password requirements */}
                    <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                      <li className={`flex items-center gap-1 ${/[A-Z]/.test(watch('password')) ? 'text-green-500' : ''}`}>
                        {/[A-Z]/.test(watch('password')) ? <CheckCircle2 className="h-3 w-3" /> : <span>•</span>} 
                        Uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${/[a-z]/.test(watch('password')) ? 'text-green-500' : ''}`}>
                        {/[a-z]/.test(watch('password')) ? <CheckCircle2 className="h-3 w-3" /> : <span>•</span>} 
                        Lowercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${/[0-9]/.test(watch('password')) ? 'text-green-500' : ''}`}>
                        {/[0-9]/.test(watch('password')) ? <CheckCircle2 className="h-3 w-3" /> : <span>•</span>} 
                        Number
                      </li>
                      <li className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(watch('password')) ? 'text-green-500' : ''}`}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(watch('password')) ? <CheckCircle2 className="h-3 w-3" /> : <span>•</span>} 
                        Special character
                      </li>
                      <li className={`flex items-center gap-1 ${watch('password')?.length >= 8 ? 'text-green-500' : ''}`}>
                        {watch('password')?.length >= 8 ? <CheckCircle2 className="h-3 w-3" /> : <span>•</span>} 
                        At least 8 characters
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {errors.password && (
              <p className="text-destructive text-sm flex items-center gap-1">
                {typeof errors.password.message === 'string' ? errors.password.message : 'Password is required'}
              </p>
            )}
          </div>
        );
      
      case "phoneNumber":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>Phone Number</Label>
            <div className="relative">
              <Input
                id={fieldName}
                type="text"
                placeholder="Enter your phone number"
                className={`${errors[fieldName as keyof RegisterFormData] ? "border-destructive pr-10" : ""} 
                           ${isFieldValid(fieldName) ? "border-green-500 pr-10" : ""}`}
                {...register(fieldName as keyof RegisterFormData, { required: true })}
                onBlur={() => trigger(fieldName as any)}
              />
              {errors[fieldName as keyof RegisterFormData] && (
                <AlertCircle className="h-5 w-5 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {isFieldValid(fieldName) && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {errors[fieldName as keyof RegisterFormData] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                This field is required
              </p>
            )}
          </div>
        );
      
      case "gender":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>Gender</Label>
            <div className="relative">
              <Select 
                onValueChange={(value) => handleSelectChange('gender', value)}
                value={watch('gender')}
                defaultValue=""
              >
                <SelectTrigger className={`${errors.gender ? "border-destructive" : ""} 
                                         ${isFieldValid('gender') ? "border-green-500" : ""}`}>
                  <SelectValue placeholder="Select your gender" />
                  {errors.gender && (
                    <AlertCircle className="h-5 w-5 text-destructive ml-auto" />
                  )}
                  {isFieldValid('gender') && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.gender && (
              <p className="text-destructive text-sm flex items-center gap-1">
                {typeof errors.gender.message === 'string' ? errors.gender.message : 'Gender is required'}
              </p>
            )}
          </div>
        );
      
      // Update tshirtSize similarly, with validation icons
      case "tshirtSize":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>T-Shirt Size</Label>
            <div className="relative">
              <Select 
                onValueChange={(value) => handleSelectChange('tshirtSize', value)}
                value={watch('tshirtSize')}
                defaultValue=""
              >
                <SelectTrigger className={`${errors.tshirtSize ? "border-destructive" : ""} 
                                          ${isFieldValid('tshirtSize') ? "border-green-500" : ""}`}>
                  <SelectValue placeholder="Select your t-shirt size" />
                  {errors.tshirtSize && (
                    <AlertCircle className="h-5 w-5 text-destructive ml-auto" />
                  )}
                  {isFieldValid('tshirtSize') && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.tshirtSize && (
              <p className="text-destructive text-sm flex items-center gap-1">
                {typeof errors.tshirtSize.message === 'string' ? errors.tshirtSize.message : 'T-shirt size is required'}
              </p>
            )}
          </div>
        );
      
      // Update dateOfBirth with validation styling
      case "dateOfBirth":
        const isDateValid = isFieldValid('dateOfBirth');
        const hasDateError = !!errors.dateOfBirth;
        
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>Date of Birth</Label>
            <div className="flex items-center relative">
              {/* Month input */}
              <Input
                id="month"
                type="text" 
                placeholder="MM"
                className={`w-[60px] text-center cursor-pointer ${hasDateError ? "border-destructive" : ""} ${isDateValid ? "border-green-500" : ""}`}
                maxLength={2}
                onKeyUp={(e) => {
                  const value = e.currentTarget.value;
                  if (value.length === 2) {
                    document.getElementById('day')?.focus();
                  }
                }}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  
                  if (value.length > 0) {
                    const month = Math.min(Math.max(parseInt(value), 1), 12);
                    
                    if (value.length === 2) {
                      e.target.value = month.toString().padStart(2, '0');
                    } else {
                      e.target.value = month.toString();
                    }
                    
                    const currentDate = watch("dateOfBirth") ? new Date(watch("dateOfBirth")) : new Date();
                    currentDate.setMonth(month - 1);
                    setValue("dateOfBirth", currentDate, { 
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true 
                    });
                  }
                }}
                onBlur={() => trigger('dateOfBirth')}
              />
              <span className="mx-2 text-muted-foreground font-medium">/</span>
              
              {/* Day input */}
              <Input
                id="day"
                type="text"
                placeholder="DD"
                className={`w-[60px] text-center cursor-pointer ${hasDateError ? "border-destructive" : ""} ${isDateValid ? "border-green-500" : ""}`}
                maxLength={2}
                onKeyUp={(e) => {
                  const value = e.currentTarget.value;
                  if (value.length === 2) {
                    document.getElementById('year')?.focus();
                  }
                }}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  
                  if (value.length > 0) {
                    const day = Math.min(Math.max(parseInt(value), 1), 31);
                    
                    if (value.length === 2) {
                      e.target.value = day.toString().padStart(2, '0');
                    } else {
                      e.target.value = day.toString();
                    }
                    
                    const currentDate = watch("dateOfBirth") ? new Date(watch("dateOfBirth")) : new Date();
                    currentDate.setDate(day);
                    setValue("dateOfBirth", currentDate, { 
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true 
                    });
                  }
                }}
                onBlur={() => trigger('dateOfBirth')}
              />
              <span className="mx-2 text-muted-foreground font-medium">/</span>
              
              {/* Year input */}
              <Input
                id="year"
                type="text"
                placeholder="YYYY"
                className={`w-[80px] text-center cursor-pointer ${hasDateError ? "border-destructive" : ""} ${isDateValid ? "border-green-500" : ""}`}
                maxLength={4}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length === 4) {
                    const year = Math.min(
                      Math.max(parseInt(value), 1900),
                      new Date().getFullYear()
                    );
                    e.target.value = year.toString();
                    
                    const currentDate = watch("dateOfBirth") ? new Date(watch("dateOfBirth")) : new Date();
                    currentDate.setFullYear(year);
                    setValue("dateOfBirth", currentDate, { 
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true 
                    });
                  }
                }}
                onBlur={() => trigger('dateOfBirth')}
              />
              
              {hasDateError && (
                <AlertCircle className="h-5 w-5 text-destructive ml-2" />
              )}
              {isDateValid && (
                <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
              )}
            </div>
            {errors.dateOfBirth && (
              <p className="text-destructive text-sm flex items-center gap-1">
                Date of birth is required
              </p>
            )}
          </div>
        );
      
      case "responsibilities":
        return null;
      
      case "emergencyContactName":
      case "emergencyContactPhone":
      case "emergencyContactRelationship":
      case "address":
        return (
          <div key={fieldName} className="space-y-2 relative">
            <Label htmlFor={fieldName}>
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
            </Label>
            <div className="relative">
              <Input
                id={fieldName}
                type="text"
                placeholder={`Enter your ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                className={`${errors[fieldName as keyof RegisterFormData] ? "border-destructive pr-10" : ""} 
                           ${isFieldValid(fieldName) ? "border-green-500 pr-10" : ""}`}
                {...register(fieldName as keyof RegisterFormData, { required: true })}
                onBlur={() => trigger(fieldName as any)}
              />
              {errors[fieldName as keyof RegisterFormData] && (
                <AlertCircle className="h-5 w-5 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {isFieldValid(fieldName) && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {errors[fieldName as keyof RegisterFormData] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                This field is required
              </p>
            )}
          </div>
        );
      
      case "organizationId":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              Organization (Optional)
            </Label>
            <OrganizationCombobox
              value={watch('organizationId') || ''}
              onChange={(value: string) => {
                setValue('organizationId', value, { 
                  shouldValidate: true, 
                  shouldDirty: true 
                });
              }}
              className={isFieldValid(fieldName) ? "border-green-500" : ""}
              disabled={isSubmitting}
              isRegistrationMode={true}
            />
          </div>
        );
      
      case "profile_picture":
        return (
          <div key={fieldName} className="space-y-4 relative">
            <div className="relative flex flex-col items-center">
              <ImageUpload 
                variant="profile"
                onChange={(value) => {
                  setValue('profile_picture', value as string, { 
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true 
                  });
                }}
                folder="profile-picture"
                useCloud={true}
              />
              <p className="text-sm text-muted-foreground mt-4">
                Upload a profile picture to personalize your account (optional)
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Add helper function for password
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    // First check if we're on the final step, and if not, just go to the next step
    if (currentStep < roleSteps.length - 1) {
      nextStep();
      return;
    }
    
    // If we're on the final step, check if terms is checked
    if (!data.terms) {
      setRegistrationError('You must accept the terms and conditions to continue');
      return;
    }
    
    // Otherwise proceed with the registration
    await onSubmit(data);
  });

  // Backup method to force next step if form validation is causing issues
  const handleManualNext = () => {
    // Save current form values to keep them while navigating
    const currentValues = getValues();
    console.log('Current form values:', currentValues);
    
    // Simply increment the step counter
    setCurrentStep(prev => Math.min(prev + 1, roleSteps.length - 1));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4 h-16 relative">
          <div
            className={`transition-all duration-500 ease-out absolute ${
              iconVisible
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-10'
            }`}
          >
            {selectedRole === "Runner" ? (
              <Zap className="h-20 w-20 text-primary" />
            ) : (
              <Flag className="h-20 w-20 text-primary" />
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Create a {selectedRole} Account</h1>
        <p className="mt-2 text-muted-foreground">
          Join us and participate in exciting running events
        </p>
        {/* Debug button - remove in production */}
        <button
          type="button"
          onClick={() => setCurrentStep(roleSteps.length - 1)}
          className="mt-2 text-xs text-gray-400 underline"
        >
          Debug: Skip to Final Step
        </button>
      </div>
      <div className="flex justify-center space-x-6 mb-8 w-full">
        <Button
          variant={selectedRole === "Runner" ? "default" : "outline"}
          onClick={() => handleRoleChange("Runner")}
          className={`
            flex-1 flex items-center justify-center gap-4 py-8 text-lg
            transition-all duration-200 !scale-100
            ${selectedRole === "Runner" 
              ? "bg-primary text-primary-foreground" 
              : ""
            }
          `}
          size="lg"
        >
          <Zap className="h-8 w-8" />
          <span className="font-medium">Runner</span>
        </Button>
        <Button
          variant={selectedRole === "Marshal" ? "default" : "outline"}
          onClick={() => handleRoleChange("Marshal")}
          className={`
            flex-1 flex items-center justify-center gap-4 py-8 text-lg
            transition-all duration-200 !scale-100
            ${selectedRole === "Marshal" 
              ? "bg-primary text-primary-foreground" 
              : ""
            }
          `}
          size="lg"
        >
          <Flag className="h-8 w-8" />
          <span className="font-medium">Marshal</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          {renderStepIndicators()}
          <CardTitle className="text-center">{roleSteps[currentStep].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {roleSteps[currentStep].fields.map((fieldName, index) => (
              <div key={`${fieldName}-${index}`}>
                {renderField(fieldName)}
              </div>
            ))}
            
            {currentStep === roleSteps.length - 1 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    onCheckedChange={(checked) => {
                      setValue('terms', checked === true, { 
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    checked={watch('terms')}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {typeof errors.terms.message === 'string' ? errors.terms.message : 'You must accept the terms and conditions'}
                  </p>
                )}
              </div>
            )}
            
            <div className={`flex justify-between mt-6 ${currentStep > 0 ? 'gap-4' : ''}`}>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < roleSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleManualNext}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'}`}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={async () => {
                    // Manual form submission for final step
                    setIsSubmitting(true);
                    try {
                      const values = getValues();
                      console.log("Final form values:", values);
                      
                      if (!values.terms) {
                        setRegistrationError('You must accept the terms and conditions to continue');
                        return;
                      }
                      
                      await onSubmit(values);
                    } catch (error) {
                      console.error("Manual submission error:", error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'}`}
                  disabled={isSubmitting || !watch('terms')}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              )}
            </div>
            
            {/* Registration Error */}
            {registrationError && (
              <div className="mt-4 bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>{registrationError}</div>
              </div>
            )}
            
            {/* Registration Success */}
            {registrationSuccess && (
              <div className="mt-4 bg-green-100 text-green-700 text-sm p-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Registration successful!</strong> 
                  {selectedRole === 'Marshal' ? (
                    <p>Your marshal application has been submitted and is pending admin approval. You'll receive an email notification once your account is verified. Redirecting to login page...</p>
                  ) : (
                    <p>Redirecting to login page...</p>
                  )}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}