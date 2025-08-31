// src/spa/app.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { useAuthStore } from "../features/auth/model/store";
import { ErrorBoundary } from "../shared/ui/error-boundary";
import { ThemeProvider } from "./providers/theme-provider";
import "../i18n";

/**
 * Componente que ejecuta efectos de arranque SOLO en cliente,
 * como fetchMe() y alguna métrica de carga.
 */
function Bootstrap() {
  const { fetchMe } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    // cargar usuario (usa cookie httpOnly si existe)
    fetchMe();

    // métrica de carga (opcional)
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        const perf = performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (perf) {
          console.log("App loaded in:", perf.loadEventEnd - perf.fetchStart, "ms");
        }
      });
    }
  }, [fetchMe]);

  return null;
}

/**
 * Providers globales (Theme, ErrorBoundary, i18n ya importado arriba).
 * NO incluye RouterProvider. Eso se hace en `app/_spa-client.tsx`.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Bootstrap />
        {children}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
