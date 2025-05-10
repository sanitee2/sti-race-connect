/**
 * Data Models for the Application
 * 
 * This file contains type definitions for data models used throughout the application.
 */

/**
 * Event model
 */
export interface Event {
  id: string;
  event_name: string;
  description: string;
  date?: string;
  location?: string;
  type?: string;
  categories?: string[];
  image_url?: string;
  organizer?: string;
  price?: number | string;
  status?: 'upcoming' | 'active' | 'completed';
}

/**
 * User roles
 */
export type Role = 'Runner' | 'Organizer' | 'Admin';

/**
 * Registration form data
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  tshirtSize?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  organizationName?: string;
  rolePosition?: string;
  socialMediaLinks?: string;
  responsibilities?: string;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Filter options for events
 */
export interface EventFilters {
  searchQuery?: string;
  types?: string[];
  locations?: string[];
  months?: string[];
  sortOption?: string;
} 