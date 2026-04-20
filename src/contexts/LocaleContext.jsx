"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LocaleContext = createContext();

const LOCALE_STORAGE_KEY = "khatwah-locale";
const LOCALE_SESSION_KEY = "khatwah-locale-session";
const DEFAULT_LOCALE = "ar";

// Helper to get locale from storage with fallbacks
function getStoredLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    // 1. Try localStorage first
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (stored === "ar" || stored === "en")) {
      return stored;
    }

    // 2. Try cookie as fallback (for SSR compatibility)
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === LOCALE_STORAGE_KEY && (value === "ar" || value === "en")) {
        return value;
      }
    }

    // 3. Detect browser language preference
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith("ar")) {
      return "ar";
    }
  } catch (error) {
    console.warn("Failed to retrieve stored locale:", error);
  }

  return DEFAULT_LOCALE;
}

// Helper to persist locale (localStorage + cookie for SSR)
function persistLocale(locale) {
  if (typeof window === "undefined") return;

  try {
    // Save to localStorage (primary)
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    // Save to cookie for SSR compatibility (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn("Failed to persist locale:", error);
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize locale from storage on mount
  useEffect(() => {
    const storedLocale = getStoredLocale();
    setLocaleState(storedLocale);
    setIsHydrated(true);
  }, []);

  // Update document attributes when locale changes
  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale, isHydrated]);

  // Wrapper function to update locale and persist it
  const setLocale = (newLocale) => {
    if (newLocale !== "ar" && newLocale !== "en") {
      console.warn(`Invalid locale: ${newLocale}. Must be "ar" or "en".`);
      return;
    }

    setLocaleState(newLocale);
    persistLocale(newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
