// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use suppressHydrationWarning to prevent hydration mismatch errors
  return (
    <NextThemesProvider {...props} enableSystem={true} enableColorScheme={false}>
      {children}
    </NextThemesProvider>
  )
}
