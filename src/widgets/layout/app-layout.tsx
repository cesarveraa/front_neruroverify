"use client"

import type React from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./navbar"
import { Toaster } from "./toaster"

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
