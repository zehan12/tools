import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="tools-ui-theme">
      {children}
    </ThemeProvider>
  )
}
