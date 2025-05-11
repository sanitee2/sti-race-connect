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
        "flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

export { Input }
