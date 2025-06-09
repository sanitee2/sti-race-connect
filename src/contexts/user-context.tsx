"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
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

// Helper for preloading images
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn(`Failed to preload image: ${src}`);
      resolve(); // Resolve anyway to not block the chain
    };
    img.src = src;
  });
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch user profile data when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // If there's no session, we're not authenticated
        if (!session || !session.user) {
          setIsLoading(false);
          return;
        }

        // Try to get cached user data first
        const cachedUser = sessionStorage.getItem('cachedUserData');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
            setIsLoading(false);
            setHasLoadedOnce(true);
            
            // Even with cached data, preload the profile image in the background
            if (parsedUser.profileImage) {
              preloadImage(parsedUser.profileImage).catch(console.error);
            }
            return;
          } catch (e) {
            // If parsing fails, continue with API fetch
            sessionStorage.removeItem('cachedUserData');
          }
        }

        // Only set loading if we don't have cached data
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
        
        // Cache the user data
        sessionStorage.setItem('cachedUserData', JSON.stringify(userData));
        
        // Preload the profile image if available
        if (userData.profileImage) {
          await preloadImage(userData.profileImage);
        }
        
        setUser(userData);
        setIsLoading(false);
        setHasLoadedOnce(true);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch user data"));
        setIsLoading(false);
      }
    };

    // Only fetch user data if we have an active session and haven't loaded once
    if (status === "authenticated" && !hasLoadedOnce) {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status, hasLoadedOnce]);

  // If the user changes, preload the profile image
  useEffect(() => {
    if (user?.profileImage) {
      // Store profile image in browser cache
      preloadImage(user.profileImage).catch(console.error);
      
      // Cache the image URL for quicker loading
      const cacheKey = `avatar-cache-${user.profileImage}`;
      const isCached = localStorage.getItem(cacheKey);
      
      if (!isCached) {
        localStorage.setItem(cacheKey, user.profileImage);
      }
    }
  }, [user?.profileImage]);

  const updateUser = async (updatedUser: User) => {
    try {
      // Send updated user data to the API
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          profileImage: updatedUser.profileImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      // Update local state only after successful API call
      const updatedData = await response.json();
      
      // Update cache as well
      sessionStorage.setItem('cachedUserData', JSON.stringify(updatedData));
      
      // If profile image changed, preload it
      if (updatedData.profileImage !== user?.profileImage) {
        preloadImage(updatedData.profileImage).catch(console.error);
      }
      
      setUser(updatedData);
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Clear cached user data
      sessionStorage.removeItem('cachedUserData');
      
      // Use NextAuth's signOut function
      await signOut({ redirect: false });
      
      // Clear user data from state
      setUser(null);
      setHasLoadedOnce(false);
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