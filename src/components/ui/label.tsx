"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block text-xs uppercase tracking-wider text-gray-500 mb-2",
        className
      )}
      {...props}
    />
  )
}

export { Label }
