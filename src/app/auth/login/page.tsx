"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onChange"
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Use Next-Auth's signIn function instead of directly calling the API
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }

      // If successful, check user role and redirect
      // We need to fetch user data to get the role
      const userResponse = await fetch('/api/user/profile');
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      
      // Redirect based on user role
      if (userData.role === 'Marshal') {
        router.push('/dashboard');
      } else if (userData.role === 'Runner') {
        router.push('/runner/dashboard');
      } else {
        router.push('/');
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">Please sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            {...register("email", { 
              required: "Email is required", 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              } 
            })}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" {...register("rememberMe")} />
            <Label htmlFor="remember-me" className="text-sm font-medium text-foreground">
              Remember me
            </Label>
          </div>

          <Link href="#" className="text-sm font-medium text-primary hover:text-primary/90">
            Forgot password?
          </Link>
        </div>
        
        {loginError && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {loginError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 