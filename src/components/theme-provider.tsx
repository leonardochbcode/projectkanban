"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { themes } from "@/lib/themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const themeClasses = themes.map((theme) => theme.class)

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={themeClasses}
    >
      {children}
    </NextThemesProvider>
  )
}
