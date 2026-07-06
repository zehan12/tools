import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"
import { STORAGE_KEYS } from "@/constants"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey={STORAGE_KEYS.THEME}>
      <TooltipProvider delay={300}>
        {children}
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}
