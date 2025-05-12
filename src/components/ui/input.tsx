import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.ComponentPropsWithoutRef<"input"> {}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-input",
        "bg-background/80 dark:bg-muted/30",
        "px-4 py-2.5 text-sm text-foreground",
        "ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-200",
        "hover:border-input/80 dark:hover:border-primary/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
