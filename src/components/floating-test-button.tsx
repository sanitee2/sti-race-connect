"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FloatingTestButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg"
              asChild
            >
              <Link href="/image-upload-test">
                <ImageIcon className="h-6 w-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={10}>
            <p>Image Upload Test</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 