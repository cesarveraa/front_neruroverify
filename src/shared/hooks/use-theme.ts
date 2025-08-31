import { create } from "zustand"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  },
  toggleTheme: () => {
    const currentTheme = get().theme
    get().setTheme(currentTheme === "light" ? "dark" : "light")
  },
}))

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const stored = localStorage.getItem("theme") as Theme
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const theme = stored || systemPreference

  useThemeStore.getState().setTheme(theme)
}

// Call on app initialization
if (typeof window !== "undefined") {
  initializeTheme()
}
