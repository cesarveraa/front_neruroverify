// src/spa/router.tsx
// ⚠️ No pongas "use client" aquí.
// ⚠️ No crees el browser router aquí.

import type { RouteObject } from "react-router-dom"

import { LoginPage } from "../spa/pages/login/login"
import { DashboardPage } from "../spa/pages/dashboard/dashboard"
import { ProfilePage } from "../spa/pages/profile/profile"
import { VerticalsPage } from "../spa/pages/verticals/verticals"
import { MarketingPage } from "../spa/pages/verticals/marketing"
import { LegalPage } from "../spa/pages/verticals/legal"
import { RestaurantPage } from "../spa/pages/verticals/restaurant"
import { NotFoundPage } from "../spa/pages/not-found"
import { ProtectedRoute } from "../processes/auth-gate/protected-route"
import { AppLayout } from "../widgets/layout/app-layout"
import { ErrorBoundary } from "../shared/ui/error-boundary"

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <ProtectedRoute />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          // Redirección "/" -> "/dashboard" (opción A: manejarlo en ProtectedRoute con useEffect + navigate)
          // Opción B (si prefieres <Navigate/>):
          // { index: true, element: <Navigate to="dashboard" replace /> },

          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "verticals", element: <VerticalsPage /> },
          { path: "verticals/marketing", element: <MarketingPage /> },
          { path: "verticals/legal", element: <LegalPage /> },
          { path: "verticals/restaurant", element: <RestaurantPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]
