import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden">
          {/* Image skeleton */}
          <Skeleton className="w-full h-full" />
          
          {/* Overlay content */}
          <div className="absolute inset-0 p-4 pb-12 flex flex-col">
            {/* Top Section */}
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>

            {/* Bottom Section */}
            <div className="mt-auto space-y-3">
              {/* Event Name */}
              <Skeleton className="h-8 w-3/4" />

              {/* Event Details */}
              <div className="space-y-1.5">
                {/* Date and Time */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-1 w-1 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Location */}
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-4 space-y-3">
          {/* Registration Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 