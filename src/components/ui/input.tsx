import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full px-3 py-2 outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100 font-mono rounded-none disabled:bg-gray-50 dark:disabled:bg-[#1a1a1a] read-only:bg-gray-50 dark:read-only:bg-[#1a1a1a]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
