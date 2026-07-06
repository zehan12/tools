import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"
import { STORAGE_KEYS } from "@/constants"

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey={STORAGE_KEYS.THEME}>
      {children}
    </ThemeProvider>
  )
}
