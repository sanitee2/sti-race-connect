import Image from "next/image";
import { Clock, MapPin, Eye, Edit, Trash2, ChevronDown, Calendar as CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { Event } from "@/app/(marshal)/marshal-events/types/index";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
  onManageCategories: (event: Event) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onManageStaff: (event: Event) => void;
}

export function EventCard({ 
  event, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: EventCardProps) {
  const router = useRouter();

  // Calculate total participants and slots across all categories
  const totalParticipants = event.categories?.reduce((sum, cat) => sum + (cat.participants || 0), 0) || 0;
  
  // Calculate total slots based on whether slot limits are enabled
  const totalSlots = event.has_slot_limit && event.slot_limit
    ? event.slot_limit // If event has overall slot limit, use that
    : event.categories?.reduce((sum, cat) => {
        // Only add category slot limit if it has slot limiting enabled
        return sum + (cat.has_slot_limit && cat.slot_limit ? cat.slot_limit : 0);
      }, 0) || 0;
  
  // Calculate progress percentage for overall event
  const progressPercentage = totalSlots > 0 ? (totalParticipants / totalSlots) * 100 : 0;

  // Define category colors
  const categoryColors = [
    { light: "bg-blue-400/30", dark: "bg-blue-500" },
    { light: "bg-purple-400/30", dark: "bg-purple-500" },
    { light: "bg-emerald-400/30", dark: "bg-emerald-500" },
    { light: "bg-amber-400/30", dark: "bg-amber-500" },
    { light: "bg-rose-400/30", dark: "bg-rose-500" },
    { light: "bg-indigo-400/30", dark: "bg-indigo-500" },
  ];

  // Calculate individual category progress
  const categoryProgress = event.categories?.map((cat, index) => {
    if (!cat.has_slot_limit || !cat.slot_limit) return null;
    const percentage = (cat.participants / cat.slot_limit) * 100;
    const isFull = cat.participants >= cat.slot_limit;
    return {
      name: cat.name,
      percentage,
      participants: cat.participants,
      slotLimit: cat.slot_limit,
      isFull,
      colors: categoryColors[index % categoryColors.length]
    };
  }).filter((cat): cat is NonNullable<typeof cat> => cat !== null) || [];

  // Only show category segments if there are multiple categories with slot limits
  const showCategorySegments = categoryProgress.length > 1;

  // Update the click handler to use router directly
  const handleCardClick = () => {
    // Use relative path to avoid URL parsing issues
    window.location.href = `/marshal-events/${event.id}`;
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Layer */}
      <div className="absolute inset-0">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-16 h-16 text-primary/40" />
          </div>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

      {/* Content Layer */}
      <div className="absolute inset-0 p-4 pb-12 flex flex-col">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <StatusBadge status={event.status} />
          {event.categories && event.categories.length > 0 && (
            <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
              {event.categories.length} {event.categories.length === 1 ? 'Category' : 'Categories'}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto space-y-3">
          {/* Event Name */}
          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
            {event.name}
          </h3>

          {/* Event Details */}
          <div className="space-y-1.5">
            {/* Date and Time */}
            <div className="flex items-center text-xs text-white/90 font-medium">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" />
                <span>{event.date}</span>
              </div>
              <div className="mx-2 w-1 h-1 rounded-full bg-white/50" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{event.time}</span>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center text-xs text-white/90 font-medium">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="ml-1.5 line-clamp-1">{event.location}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Actions <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    className="flex gap-2 items-center cursor-pointer text-xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(event);
                    }}
                  >
                    <Edit className="w-3 h-3" /> 
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex gap-2 items-center text-destructive cursor-pointer text-xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> 
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Progress Bar - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            <Users className="w-3 h-3" />
            <span>{totalSlots > 0 ? "Registration Progress" : "Registrants"}</span>
          </div>
          <div className="flex items-center gap-3">
            {showCategorySegments ? (
              categoryProgress.map((cat, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-white/90">
                  <div className={cn("w-1.5 h-1.5 rounded-full", cat.colors.dark)} />
                  <span>{cat.name}</span>
                  <span className="font-medium">
                    {cat.isFull ? "(Full)" : `(${cat.participants}/${cat.slotLimit})`}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs font-medium text-white/90">
                {totalSlots > 0 ? `${totalParticipants}/${totalSlots}` : totalParticipants}
              </span>
            )}
          </div>
        </div>
        {(showCategorySegments || totalSlots > 0) && (
          <>
            {showCategorySegments ? (
              <div className="flex w-full h-2">
                {categoryProgress.map((cat, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "h-full transition-all duration-300",
                      cat.colors.light
                    )}
                    style={{ 
                      width: `${100 / categoryProgress.length}%`,
                    }}
                  >
                    <div 
                      className={cn("h-full transition-all duration-300", cat.colors.dark)}
                      style={{
                        width: `${cat.percentage}%`
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Progress 
                value={progressPercentage} 
                className={cn(
                  "h-2 rounded-none bg-emerald-400/30",
                  "after:bg-emerald-500"
                )}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 