"use client"

import { useTranslation } from "react-i18next"

export const useLocale = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale)
    localStorage.setItem("language", locale)
    document.documentElement.lang = locale
  }

  const getCurrentLanguage = () => {
    return i18n.language || "en"
  }

  const isRTL = () => {
    // Add RTL language codes here if needed
    const rtlLanguages = ["ar", "he", "fa"]
    return rtlLanguages.includes(getCurrentLanguage())
  }

  return {
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    isRTL: isRTL(),
    t: i18n.t,
  }
}
