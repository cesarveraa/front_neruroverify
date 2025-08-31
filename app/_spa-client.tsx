// app/_spa-client.tsx
"use client";

import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "../src/spa/router";
import AppProviders from "../src/spa/app";

export default function SPA() {
  const router = useMemo(() => createBrowserRouter(routes), []);
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
