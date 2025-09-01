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
import LabPage from "./pages/lab/lab"

// NUEVOS imports
import EvaluatorDashboard from "./pages/evaluator/EvaluatorDashboard"
import EvaluatedScreen from "../spa/pages/evaluator/EvaluatedScreen"
import Callback from "./pages/auth/Callback"

export const routes: RouteObject[] = [
  // Público: login
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
  },

  // Público: callback de autenticación (redirección post-login)
  {
    path: "/callback",
    element: (
      <ErrorBoundary>
        <Callback />
      </ErrorBoundary>
    ),
  },

  // Protegido: todo lo demás detrás del gate
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
          // Opción A: manejar redirección "/" -> "/dashboard" en ProtectedRoute
          // Opción B: si prefieres Navigate, puedes añadir un index route aquí

          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "verticals", element: <VerticalsPage /> },
          { path: "verticals/marketing", element: <MarketingPage /> },
          { path: "verticals/legal", element: <LegalPage /> },
          { path: "verticals/restaurant", element: <RestaurantPage /> },
          { path: "lab", element: <LabPage /> },

          // NUEVAS rutas protegidas para el “evaluator”
          { path: "evaluator/dashboard", element: <EvaluatorDashboard /> },
          { path: "evaluator/session", element: <EvaluatedScreen /> },
        ],
      },
    ],
  },

  // 404
  { path: "*", element: <NotFoundPage /> },
]
