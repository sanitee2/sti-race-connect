"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Home, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const getDashboardUrl = () => {
    const role = session?.user?.role;
    switch (role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Marshal':
        return '/dashboard';
      case 'Runner':
        return '/runner/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Unauthorized Access Attempt
                </p>
                <p className="text-muted-foreground mt-1">
                  The page you're trying to access requires different permissions than your current role.
                </p>
              </div>
            </div>
          </div>
          
          {session?.user && (
            <div className="text-sm text-muted-foreground text-center">
              You are currently signed in as: <strong>{session.user.name}</strong> ({session.user.role})
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href={getDashboardUrl()}>
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 