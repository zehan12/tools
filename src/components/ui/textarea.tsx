import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full px-3 py-2 outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100 font-mono rounded-none disabled:bg-gray-50 dark:disabled:bg-[#1a1a1a] read-only:bg-gray-50 dark:read-only:bg-[#1a1a1a]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
