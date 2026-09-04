"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/** ライト/ダーク切替。既定ライト、class 方式。 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemeProvider>
  );
}
