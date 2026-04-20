"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "khatwah-theme";
const THEME_SESSION_KEY = "khatwah-theme-session";
const DEFAULT_THEME = "light";

// Helper to get theme from storage with fallbacks
function getStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    // 1. Try localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (stored === "dark" || stored === "light")) {
      return stored;
    }

    // 2. Try cookie as fallback (for SSR compatibility)
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === THEME_STORAGE_KEY && (value === "dark" || value === "light")) {
        return value;
      }
    }

    // 3. Detect system preference
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "light"; // Default to light instead of dark
  } catch (error) {
    console.warn("Failed to retrieve stored theme:", error);
  }

  return DEFAULT_THEME;
}

// Helper to persist theme (localStorage + cookie for SSR)
function persistTheme(theme) {
  if (typeof window === "undefined") return;

  try {
    // Save to localStorage (primary)
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Save to cookie for SSR compatibility (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${THEME_STORAGE_KEY}=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn("Failed to persist theme:", error);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme from storage on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
    setIsHydrated(true);
  }, []);

  // Wrapper function to update theme and persist it
  const setTheme = (newTheme) => {
    if (newTheme !== "dark" && newTheme !== "light") {
      console.warn(`Invalid theme: ${newTheme}. Must be "dark" or "light".`);
      return;
    }

    setThemeState(newTheme);
    persistTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isHydrated }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
