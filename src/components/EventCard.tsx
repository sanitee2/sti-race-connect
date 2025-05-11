import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Tag, ChevronRight, Flag } from 'lucide-react';
import { Event } from '@/types/models';

export interface EventCardProps extends Event {
  // Add any additional props specific to the component
  participants?: number;
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
  participants = 0
}: EventCardProps) {
  const isFeatured = status === 'upcoming';
  
  return (
    <Link 
      key={`event-${id}`}
      href={`/events/${id}`}
      className="group relative bg-card rounded-xl overflow-hidden transition-all hover:shadow-lg border border-border hover-scale hover:border-primary/30 block"
    >
      <div className="h-[260px] relative overflow-hidden">
        <Image 
          src={image_url || '/assets/login_page.jpg'}
          alt={event_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        
        {/* Gradient overlay with diagonal pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
        
        {/* Top Left - Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Featured
          </div>
        )}
        
        {/* Top Right - Categories */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
          {categories?.map((cat, i) => (
            <span key={`${id}-category-${i}`} className="bg-secondary text-secondary-foreground text-sm px-3 py-1.5 rounded-lg shadow-sm font-semibold flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" />
              {cat}
            </span>
          ))}
        </div>
        
        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 flex justify-between items-center backdrop-blur-sm bg-black/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-white text-sm">
              <Calendar size={14} className="mr-1.5 text-secondary" /> 
              <span className="font-medium">{date || 'TBA'}</span>
            </div>
            <div className="flex items-center text-white text-sm">
              <MapPin size={14} className="mr-1.5 text-secondary" /> 
              <span className="truncate max-w-[120px] font-medium">{location || 'Location TBA'}</span>
            </div>
          </div>
          {participants > 0 && (
            <div className="flex items-center text-white text-sm bg-primary px-3 py-1.5 rounded-lg shadow-sm">
              <Users size={14} className="mr-1.5 text-secondary" /> 
              <span className="font-medium">{participants}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Title with modern styling */}
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
          {event_name}
          <ChevronRight className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        
        {/* Organizer with modern styling */}
        {organizer && (
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary mr-2 border border-primary/20">
              {organizer.split(' ').map(word => word[0]).join('')}
            </div>
            <span className="text-sm text-muted-foreground font-medium">{organizer}</span>
          </div>
        )}
      </div>
    </Link>
  );
} 