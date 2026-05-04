"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/*
 * The slide is a light surface, always. The dark scope (.dark) exists only on
 * the operator's control sheet, which applies the class manually on its own
 * container. We force theme="light" + forcedTheme to ignore the OS preference
 * — otherwise users on a dark-mode laptop would see the page inherit .dark
 * tokens and look completely wrong on the projection.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
