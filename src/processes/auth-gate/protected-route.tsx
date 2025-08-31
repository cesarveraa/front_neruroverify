"use client"

import type React from "react"
import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../../features/auth/model/store"
import { LoadingSpinner } from "../../shared/ui/loading-spinner"

export const ProtectedRoute: React.FC = () => {
  const { user, loading, fetchMe } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Try to fetch user data if not already loaded
    if (!user && !loading) {
      fetchMe()
    }
  }, [user, loading, fetchMe])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Render protected content
  return <Outlet />
}
