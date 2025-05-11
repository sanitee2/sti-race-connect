"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  stats?: {
    upcomingEvents: number;
    totalParticipants: number;
    points: number;
  };
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user profile data when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // If there's no session, we're not authenticated
        if (!session || !session.user) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        // Fetch user data from API endpoint
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        setUser(userData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch user data"));
        setIsLoading(false);
      }
    };

    // Only fetch user data if we have an active session
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  const updateUser = async (updatedUser: User) => {
    try {
      // Send updated user data to the API
      const response = await fetch(`/api/user/${updatedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      // Update local state only after successful API call
      const updatedData = await response.json();
      setUser(updatedData);
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Use NextAuth's signOut function
      await signOut({ redirect: false });
      
      // Clear user data from state
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}; 