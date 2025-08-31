"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogOut, User } from "lucide-react"
import { Button } from "../../shared/ui/button"
import { useAuthStore } from "../../features/auth/model/store"
import { useTranslation } from "react-i18next"

export const UserMenu: React.FC = () => {
  const { t } = useTranslation("common")
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative h-8 w-8 rounded-full">
        {user?.photoURL ? (
          <img src={user.photoURL || "/placeholder.svg"} alt="Profile" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {getInitials(user?.displayName, user?.email)}
          </div>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md">
            <div className="px-2 py-1.5 text-sm font-medium">{user?.displayName || user?.email}</div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email}</div>
            <div className="h-px bg-border my-1" />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              {t("navigation.profile")}
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("navigation.logout")}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
