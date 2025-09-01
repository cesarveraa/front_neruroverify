"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../features/auth/model/store"
import { ThemeToggle } from "../../shared/ui/theme-toggle"
import { LanguageSwitcher } from "../../shared/ui/language-switcher"
import { UserMenu } from "./user-menu"
import { useTranslation } from "react-i18next"

export const Navbar: React.FC = () => {
  const { t } = useTranslation("common")
  const { user } = useAuthStore()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand + nav links */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              PromoBuilder
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {/* Links comunes */}
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("navigation.dashboard")}
              </Link>
              <Link
                to="/verticals"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("navigation.datasets")}
              </Link>
              <Link
                to="/lab"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("navigation.lab")}
              </Link>

              {/* Links especiales si es evaluator */}
             
                <>
                  <Link
                    to="/evaluator/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Evaluator Dashboard
                  </Link>
                  <Link
                    to="/evaluator/session"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Evaluator Session
                  </Link>
                </>
              
            </div>
          </div>

          {/* Controls: idioma, tema, usuario */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {user && <UserMenu />}
          </div>
        </div>
      </div>
    </nav>
  )
}
