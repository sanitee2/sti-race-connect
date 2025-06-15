import { useState } from "react";
import { ChevronDown, Eye, Edit, UserPlus, Award, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EventCard } from "./event-card";
import { StatusBadge } from "./status-badge";
import { Event } from "@/app/(marshal)/marshal-events/types/index";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EventsDisplayProps {
  events: Event[];
  onManageCategories: (event: Event) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onManageStaff: (event: Event) => void;
}

export function EventsDisplay({ 
  events, 
  onManageCategories,
  onEditEvent,
  onDeleteEvent,
  onViewDetails,
  onManageStaff
}: EventsDisplayProps) {
  const [viewMode, setViewMode] = useState("cards");
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="border rounded-md overflow-hidden flex">
          <Button 
            variant={viewMode === "cards" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("cards")}
            className="rounded-none"
          >
            Cards
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("table")}
            className="rounded-none"
          >
            Table
          </Button>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((event: Event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onManageCategories={onManageCategories}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onViewDetails={onViewDetails}
                onManageStaff={onManageStaff}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event: Event) => {
                  // Calculate registration progress
                  const totalParticipants = event.categories?.reduce((sum, cat) => sum + (cat.participants || 0), 0) || 0;
                  const totalSlots = event.has_slot_limit && event.slot_limit
                    ? event.slot_limit
                    : event.categories?.reduce((sum, cat) => {
                        return sum + (cat.has_slot_limit && cat.slot_limit ? cat.slot_limit : 0);
                      }, 0) || 0;
                  
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
                  
                  // Calculate overall progress percentage
                  const progressPercentage = totalSlots > 0 ? (totalParticipants / totalSlots) * 100 : 0;
                  
                  // Define default progress color
                  const defaultProgressColor = cn(
                    "h-2 rounded-none bg-emerald-400/30",
                    "after:bg-emerald-500"
                  );

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell>{event.categories?.length || 0}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {showCategorySegments ? (
                            <>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {categoryProgress.map((cat, index) => (
                                  <div key={index} className="flex items-center gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", cat.colors.dark)} />
                                    <span className="text-muted-foreground text-sm">
                                      {cat.name}
                                      <span className="ml-1">
                                        {cat.isFull ? "(Full)" : `(${cat.participants}/${cat.slotLimit})`}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
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
                              <div className="text-xs text-muted-foreground text-right">
                                Total: {totalParticipants}/{totalSlots}
                              </div>
                            </>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {totalSlots > 0 ? `${totalParticipants}/${totalSlots}` : `${totalParticipants} registrants`}
                                </span>
                              </div>
                              {totalSlots > 0 && (
                                <Progress 
                                  value={progressPercentage} 
                                  className={defaultProgressColor}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onViewDetails(event)}>
                              <Eye size={14} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEditEvent(event)}>
                              <Edit size={14} /> Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageStaff(event)}>
                              <UserPlus size={14} /> Manage Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onManageCategories(event)}>
                              <Award size={14} /> Manage Categories
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex gap-2 items-center text-destructive cursor-pointer" onClick={() => onDeleteEvent(event)}>
                              <Trash2 size={14} /> Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No events found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 