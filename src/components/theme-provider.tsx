'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Transitions during a theme swap produce a visible colour smear across
      // the whole page. Suppress them for the duration of the switch only.
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
