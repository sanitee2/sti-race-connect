import { Metadata } from 'next';

// Define global types for Next.js App Router
declare global {
  // Define PageProps for dynamic route segments
  interface PageProps {
    params: {
      id: string;
      [key: string]: string;
    };
    searchParams?: Record<string, string | string[]>;
  }
}

export {};
