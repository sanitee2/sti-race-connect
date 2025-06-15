"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    mode: "onChange"
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password: data.password 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = password ? getPasswordStrength(password) : 0;

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Password Reset Successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Your password has been updated successfully.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg text-sm text-green-700">
            <p className="font-medium mb-1">Success!</p>
            <p>You will be redirected to the login page in a few seconds.</p>
          </div>

          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Continue to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Invalid Link</h1>
          <p className="mt-2 text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg text-sm text-destructive">
            {error}
          </div>

          <Button
            onClick={() => router.push('/auth/forgot-password')}
            className="w-full"
          >
            Request New Reset Link
          </Button>

          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-primary hover:text-primary/90 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
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
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength
                        ? passwordStrength < 3
                          ? 'bg-red-500'
                          : passwordStrength < 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: {
                  passwordStrength < 3 ? 'Weak' : 
                  passwordStrength < 4 ? 'Medium' : 'Strong'
                }
              </p>
            </div>
          )}
          
          {errors.password && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              disabled={isLoading}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match"
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !token}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Loading...</h1>
          <p className="mt-2 text-muted-foreground">
            Please wait while we prepare your password reset form.
          </p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
} 