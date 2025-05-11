import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<"textarea"> {}

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
