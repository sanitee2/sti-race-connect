import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, ChevronRight, Flag } from 'lucide-react';
import { Event } from '@/types/models';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EventCardProps extends Event {
  // Add any additional props specific to the component
  participants?: number;
  isAuthenticated?: boolean;
  onRegister?: (eventId: string) => void;
  isRegistering?: boolean;
  showRegistration?: boolean;
}

export function EventCard({ 
  id, 
  event_name, 
  date, 
  location, 
  image_url, 
  categories = [], 
  status,
  organizer,
  participants = 0,
  isAuthenticated = false,
  onRegister,
  isRegistering = false,
  showRegistration = false
}: EventCardProps) {
  const isFeatured = status === 'upcoming';
  
  // If showing registration functionality, render as div instead of Link
  if (showRegistration && isAuthenticated) {
    return (
      <div className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer">
        {/* Image Layer */}
        <div className="absolute inset-0">
          <Image 
            src={image_url || '/assets/login_page.jpg'}
            alt={event_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

        {/* Content Layer */}
        <div className="absolute inset-0 p-4 pb-12 flex flex-col">
          {/* Top Section */}
          <div className="flex items-start justify-between">
            {isFeatured && (
              <div className="bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Featured
              </div>
            )}
            {categories && categories.length > 0 && (
              <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
                {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto space-y-3">
            {/* Event Name */}
            <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
              {event_name}
            </h3>

            {/* Event Details */}
            <div className="space-y-1.5">
              {/* Date and Time */}
              <div className="flex items-center text-xs text-white/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{date || 'TBA'}</span>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-center text-xs text-white/90 font-medium">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="ml-1.5 line-clamp-1">{location || 'Location TBA'}</span>
              </div>

              {/* Organizer */}
              {organizer && (
                <div className="flex items-center text-xs text-white/90 font-medium">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-semibold text-white mr-1.5">
                    {organizer.split(' ').map(word => word[0]).join('')}
                  </div>
                  <span className="line-clamp-1">{organizer}</span>
                </div>
              )}

              {/* Registration Actions */}
              <div className="flex items-center gap-2 pt-3">
                <Link 
                  href={`/events/${id}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full h-7 text-xs bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-white/20">
                    View Details
                  </Button>
                </Link>
                <Button 
                  onClick={() => onRegister?.(id)}
                  disabled={isRegistering}
                  className="flex-1 h-7 text-xs"
                >
                  {isRegistering ? "Registering..." : "Register"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Progress Bar - Positioned at bottom */}
        {participants > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <Users className="w-3 h-3" />
                <span>Participants</span>
              </div>
              <div className="text-xs text-white/90 font-medium">
                {participants}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Default behavior: render as Link for navigation
  return (
    <Link 
      href={`/events/${id}`}
      className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer block"
    >
      {/* Image Layer */}
      <div className="absolute inset-0">
        <Image 
          src={image_url || '/assets/login_page.jpg'}
          alt={event_name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

      {/* Content Layer */}
      <div className="absolute inset-0 p-4 pb-12 flex flex-col">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          {isFeatured && (
            <div className="bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Featured
            </div>
          )}
          {categories && categories.length > 0 && (
            <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
              {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto space-y-3">
          {/* Event Name */}
          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
            {event_name}
          </h3>

          {/* Event Details */}
          <div className="space-y-1.5">
            {/* Date and Time */}
            <div className="flex items-center text-xs text-white/90 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{date || 'TBA'}</span>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center text-xs text-white/90 font-medium">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="ml-1.5 line-clamp-1">{location || 'Location TBA'}</span>
            </div>

            {/* Organizer */}
            {organizer && (
              <div className="flex items-center text-xs text-white/90 font-medium">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-semibold text-white mr-1.5">
                  {organizer.split(' ').map(word => word[0]).join('')}
                </div>
                <span className="line-clamp-1">{organizer}</span>
              </div>
            )}

            {/* View Details Indicator */}
            <div className="flex items-center gap-1 text-xs text-white/70 group-hover:text-secondary transition-colors pt-2">
              <span>View Details</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Registration Progress Bar - Positioned at bottom */}
      {participants > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <Users className="w-3 h-3" />
              <span>Participants</span>
            </div>
            <div className="text-xs text-white/90 font-medium">
              {participants}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
} 