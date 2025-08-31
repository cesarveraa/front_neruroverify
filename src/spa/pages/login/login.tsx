"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthForm } from "../../../features/auth/ui/auth-form"
import { useAuthStore } from "../../../features/auth/model/store"

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, clearError } = useAuthStore()

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError()

    // Redirect to dashboard if already authenticated
    if (user) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate, clearError])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
