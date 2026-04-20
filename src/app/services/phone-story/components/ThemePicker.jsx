"use client";

import { THEMES } from "../assets/themes";

export default function ThemePicker({ selectedTheme, setSelectedTheme, primaryColor, secondaryColor }) {
  const handleThemeSelect = (theme) => {
    if (theme.id === "custom") {
      // Apply custom colors
      setSelectedTheme({
        ...theme,
        accent: primaryColor,
        tagBg: primaryColor,
        badgePos: secondaryColor
      });
    } else {
      setSelectedTheme(theme);
    }
  };

  return (
    <div 
      className="rounded-xl border p-6"
      style={{ 
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-background)"
      }}
    >
      <h3 
        className="mb-4 text-lg font-bold" 
        style={{ color: "var(--color-text)" }}
      >
        Choose Theme
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              selectedTheme.id === theme.id ? 'ring-2' : ''
            }`}
            style={{
              borderColor: selectedTheme.id === theme.id ? theme.accent : 'transparent',
              backgroundColor: theme.bg,
              ringColor: theme.accent
            }}
          >
            <div className="mb-2 text-xs font-bold" style={{ color: theme.text }}>
              {theme.name}
            </div>
            <div className="flex gap-1">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: theme.accent }}
              />
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: theme.badgePos }}
              />
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: theme.badgeNeg }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
