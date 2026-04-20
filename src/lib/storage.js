/**
 * Robust storage utility for persisting user preferences
 * Implements multiple fallback mechanisms for maximum reliability
 */

const STORAGE_KEYS = {
  THEME: "khatwah-theme",
  THEME_SESSION: "khatwah-theme-session",
  LOCALE: "khatwah-locale",
  LOCALE_SESSION: "khatwah-locale-session",
};

/**
 * Safely get item from localStorage with fallbacks
 */
export function getStorageItem(key) {
  if (typeof window === "undefined") return null;

  try {
    // Try localStorage
    const item = localStorage.getItem(key);
    if (item) return item;

    // Try sessionStorage
    const sessionKey = `${key}-session`;
    const sessionItem = sessionStorage.getItem(sessionKey);
    if (sessionItem) return sessionItem;

    // Try cookie
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === key) return value;
    }
  } catch (error) {
    console.warn(`Failed to get storage item "${key}":`, error);
  }

  return null;
}

/**
 * Safely set item to all storage mechanisms
 */
export function setStorageItem(key, value) {
  if (typeof window === "undefined") return false;

  try {
    // Save to localStorage
    localStorage.setItem(key, value);

    // Save to sessionStorage as backup
    const sessionKey = `${key}-session`;
    sessionStorage.setItem(sessionKey, value);

    // Save to cookie (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${key}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    return true;
  } catch (error) {
    console.warn(`Failed to set storage item "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from all storage mechanisms
 */
export function removeStorageItem(key) {
  if (typeof window === "undefined") return false;

  try {
    // Remove from localStorage
    localStorage.removeItem(key);

    // Remove from sessionStorage
    const sessionKey = `${key}-session`;
    sessionStorage.removeItem(sessionKey);

    // Remove cookie
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    return true;
  } catch (error) {
    console.warn(`Failed to remove storage item "${key}":`, error);
    return false;
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable() {
  if (typeof window === "undefined") return false;

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get theme with fallback to system preference
 */
export function getTheme() {
  const stored = getStorageItem(STORAGE_KEYS.THEME);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // Fallback to system preference
  if (typeof window !== "undefined") {
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "light"; // Default to light
  }

  return "light";
}

/**
 * Set theme to all storage mechanisms
 */
export function setTheme(theme) {
  if (theme !== "dark" && theme !== "light") {
    console.warn(`Invalid theme: ${theme}`);
    return false;
  }
  return setStorageItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Get locale with fallback to browser language
 */
export function getLocale() {
  const stored = getStorageItem(STORAGE_KEYS.LOCALE);
  if (stored === "ar" || stored === "en") {
    return stored;
  }

  // Fallback to browser language
  if (typeof window !== "undefined") {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith("ar")) {
      return "ar";
    }
  }

  return "ar"; // Default to Arabic
}

/**
 * Set locale to all storage mechanisms
 */
export function setLocale(locale) {
  if (locale !== "ar" && locale !== "en") {
    console.warn(`Invalid locale: ${locale}`);
    return false;
  }
  return setStorageItem(STORAGE_KEYS.LOCALE, locale);
}

/**
 * Clear all app storage
 */
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorageItem(key);
  });
}

export { STORAGE_KEYS };
