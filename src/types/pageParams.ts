/**
 * Page Parameter Types for Next.js Pages
 * 
 * This file contains type definitions for Next.js page parameters
 * to ensure consistent typing across dynamic routes.
 */

import { Metadata, ResolvingMetadata } from 'next';

/**
 * Basic params type for any page with a single dynamic segment
 * This satisfies Next.js PageProps constraint by extending Promise
 */
export type PageParams<T extends string> = {
  params: Promise<{
    [key in T]: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Event page params
 */
export type EventPageParams = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Generate Metadata function parameter type
 * Compatible with Next.js generateMetadata function signature
 */
export type GenerateMetadataProps<T extends PageParams<string>> = T & {
  searchParams: { [key: string]: string | string[] | undefined };
};

/**
 * Type for generateMetadata function return
 */
export type GenerateMetadataReturn = Promise<Metadata> | Metadata;

/**
 * Helper type for searchParams in pages
 */
export type SearchParams = {
  searchParams: { [key: string]: string | string[] | undefined };
}; 