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
      /**
       * Light, and no "system".
       *
       * With `defaultTheme="system"` a fresh visitor's stored value is
       * `system`, so the first click on a light→dark→system cycle only moved to
       * `light` — usually indistinguishable from what was already on screen,
       * which is why reaching dark took two clicks. Pinning the default makes
       * the switch a straight boolean: one click always changes the page.
       *
       * The cost is that "follow my OS setting" no longer exists. That is a
       * deliberate product decision, not an oversight.
       */
      defaultTheme="light"
      enableSystem={false}
      // Transitions during a theme swap produce a visible colour smear across
      // the whole page. Suppress them for the duration of the switch only.
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
