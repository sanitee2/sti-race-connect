import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  categories: string[];
  featured?: boolean;
  participants: number;
  organizer: string;
}

export function EventCard({ 
  id, 
  title, 
  date, 
  location, 
  image, 
  categories, 
  featured = false,
  participants,
  organizer 
}: EventCardProps) {
  return (
    <Link 
      key={`event-${id}`}
      href={`/events/${id}`}
      className="group relative bg-white rounded-xl overflow-hidden transition-all hover:shadow-xl border border-gray-100 hover:border-primary/20 block"
    >
      <div className="h-[260px] relative overflow-hidden group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] transition-all duration-300">
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        
        {/* More subtle gradient overlay - light black at bottom fading to transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
        
        {/* Top Left - Featured Badge */}
        {featured && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            Featured
          </div>
        )}
        
        {/* Top Right - Categories */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
          {categories.map((cat, i) => (
            <span key={`${id}-category-${i}`} className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full font-medium">
              {cat}
            </span>
          ))}
        </div>
        
        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-white text-sm">
              <Calendar size={14} className="mr-1.5 text-secondary" /> 
              <span>{date}</span>
            </div>
            <div className="flex items-center text-white text-sm">
              <MapPin size={14} className="mr-1.5 text-secondary" /> 
              <span className="truncate max-w-[120px]">{location}</span>
            </div>
          </div>
          <div className="flex items-center text-white text-sm bg-primary/30 px-3 py-1.5 rounded-full">
            <Users size={14} className="mr-1.5 text-secondary" /> 
            <span>{participants}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Title with modern styling */}
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
        
        {/* Organizer with modern styling */}
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground mr-2">
            {organizer.split(' ').map(word => word[0]).join('')}
          </div>
          <span className="text-xs text-muted-foreground">{organizer}</span>
        </div>
      </div>
    </Link>
  );
} 