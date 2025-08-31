import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Import translation resources
import commonEn from "./locales/en/common.json"
import commonEs from "./locales/es/common.json"
import authEn from "./locales/en/auth.json"
import authEs from "./locales/es/auth.json"
import dashboardEn from "./locales/en/dashboard.json"
import dashboardEs from "./locales/es/dashboard.json"
import profileEn from "./locales/en/profile.json"
import profileEs from "./locales/es/profile.json"
import verticalsEn from "./locales/en/verticals.json"
import verticalsEs from "./locales/es/verticals.json"

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    profile: profileEn,
    verticals: verticalsEn,
  },
  es: {
    common: commonEs,
    auth: authEs,
    dashboard: dashboardEs,
    profile: profileEs,
    verticals: verticalsEs,
  },
}

const initI18n = () => {
  const savedLanguage = localStorage.getItem("language")
  const browserLanguage = navigator.language.split("-")[0]
  const supportedLanguages = Object.keys(resources)

  const defaultLanguage = savedLanguage || (supportedLanguages.includes(browserLanguage) ? browserLanguage : "en")

  return i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })
}

// Initialize i18n
if (typeof window !== "undefined") {
  initI18n()
} else {
  // Server-side initialization
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
}

export default i18n
