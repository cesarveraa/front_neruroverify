"use client"

import type React from "react"
import { useState } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "./button"
import { useLocale } from "../hooks/use-locale"
import { useTranslation } from "react-i18next"

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation("common")
  const { currentLanguage, changeLanguage } = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en", name: t("language.english"), flag: "🇺🇸" },
    { code: "es", name: t("language.spanish"), flag: "🇪🇸" },
  ]

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 px-0"
        title={t("language.select")}
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">{t("language.select")}</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border bg-popover p-1 shadow-md">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${
                  currentLanguage === lang.code ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {currentLanguage === lang.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
