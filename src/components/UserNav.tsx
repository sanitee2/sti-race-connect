"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/auth/login",
      redirect: true 
    });
  };

  // Get appropriate URLs based on user role
  const getProfileUrl = () => {
    const role = session?.user?.role;
    switch (role) {
      case 'Runner':
        return '/runner/profile';
      case 'Admin':
        return '/admin/profile';
      case 'Marshal':
        return '/dashboard/profile';
      default:
        return '/profile';
    }
  };

  const getSettingsUrl = () => {
    const role = session?.user?.role;
    switch (role) {
      case 'Runner':
        return '/runner/settings';
      case 'Admin':
        return '/admin/settings';
      case 'Marshal':
        return '/dashboard/settings';
      default:
        return '/settings';
    }
  };

  const getDashboardUrl = () => {
    const role = session?.user?.role;
    switch (role) {
      case 'Runner':
        return '/runner/dashboard';
      case 'Admin':
        return '/admin/dashboard';
      case 'Marshal':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(getDashboardUrl())}
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(getProfileUrl())}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(getSettingsUrl())}
          >
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 