import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEME_ACCENTS = {
  Blue: {
    name: "Blue",
    code: "#3b82f6",
    light: "#2563eb",
    dark: "#38bdf8",
    gradient: "from-blue-500 to-indigo-600",
    shades: {
      600: "#2563eb",
      500: "#3b82f6",
      400: "#60a5fa",
      300: "#93c5fd",
      200: "#bfdbfe",
    },
  },
  Purple: {
    name: "Purple",
    code: "#a855f7",
    light: "#9333ea",
    dark: "#c084fc",
    gradient: "from-purple-500 to-indigo-600",
    shades: {
      600: "#9333ea",
      500: "#a855f7",
      400: "#c084fc",
      300: "#d8b4fe",
      200: "#e9d5ff",
    },
  },
  Pink: {
    name: "Pink",
    code: "#ec4899",
    light: "#db2777",
    dark: "#f472b6",
    gradient: "from-pink-500 to-rose-500",
    shades: {
      600: "#db2777",
      500: "#ec4899",
      400: "#f472b6",
      300: "#f9a8d4",
      200: "#fbcfe8",
    },
  },
  Violet: {
    name: "Violet",
    code: "#8b5cf6",
    light: "#7c3aed",
    dark: "#a78bfa",
    gradient: "from-violet-500 to-purple-600",
    shades: {
      600: "#7c3aed",
      500: "#8b5cf6",
      400: "#a78bfa",
      300: "#c4b5fd",
      200: "#ddd6fe",
    },
  },
  Indigo: {
    name: "Indigo",
    code: "#6366f1",
    light: "#4f46e5",
    dark: "#818cf8",
    gradient: "from-indigo-500 to-blue-600",
    shades: {
      600: "#4f46e5",
      500: "#6366f1",
      400: "#818cf8",
      300: "#a5b4fc",
      200: "#c7d2fe",
    },
  },
  Orange: {
    name: "Orange",
    code: "#f97316",
    light: "#ea580c",
    dark: "#fb923c",
    gradient: "from-orange-500 to-amber-500",
    shades: {
      600: "#ea580c",
      500: "#f97316",
      400: "#fb923c",
      300: "#fdbb2f",
      200: "#ffedd5",
    },
  },
  Teal: {
    name: "Teal",
    code: "#14b8a6",
    light: "#0d9488",
    dark: "#2dd4bf",
    gradient: "from-teal-500 to-cyan-500",
    shades: {
      600: "#0d9488",
      500: "#14b8a6",
      400: "#2dd4bf",
      300: "#5eead4",
      200: "#99f6e4",
    },
  },
  Bronze: {
    name: "Bronze",
    code: "#a16207",
    light: "#854d0e",
    dark: "#ca8a04",
    gradient: "from-yellow-600 to-amber-600",
    shades: {
      600: "#854d0e",
      500: "#a16207",
      400: "#ca8a04",
      300: "#fef08a",
      200: "#fef9c3",
    },
  },
  Mint: {
    name: "Mint",
    code: "#10b981",
    light: "#059669",
    dark: "#34d399",
    gradient: "from-emerald-500 to-teal-500",
    shades: {
      600: "#059669",
      500: "#10b981",
      400: "#34d399",
      300: "#6ee7b7",
      200: "#a7f3d0",
    },
  },
  Gold: {
    name: "Gold",
    code: "#FFD700",
    light: "#ca8a04",
    dark: "#FFD700",
    gradient: "from-amber-400 to-yellow-500",
    shades: {
      600: "#ca8a04",
      500: "#FFD700",
      400: "#fde047",
      300: "#fef08a",
      200: "#fef9c3",
    },
  },
  Black: {
    name: "Black",
    code: "#18181b",
    light: "#09090b",
    dark: "#18181b",
    gradient: "from-zinc-800 to-zinc-950",
    shades: {
      600: "#09090b",
      500: "#18181b",
      400: "#27272a",
      300: "#3f3f46",
      200: "#52525b",
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(
    () => localStorage.getItem("appearance") || "Dark"
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem("accentColor") || "Blue"
  );
  const [isDarkEffective, setIsDarkEffective] = useState(true);

  // Appearance Change Effect
  useEffect(() => {
    localStorage.setItem("appearance", appearance);

    const updateAppearance = () => {
      let isDark = appearance === "Dark";
      if (appearance === "Auto") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      setIsDarkEffective(isDark);

      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.body.style.backgroundColor = "#0F172A";
        document.body.style.color = "#F8F9FA";
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.body.style.backgroundColor = "#F8F9FA";
        document.body.style.color = "#0F172A";
      }
    };

    updateAppearance();

    if (appearance === "Auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateAppearance();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [appearance]);

  // Accent Color & Status Colors CSS Variables Injection
  useEffect(() => {
    localStorage.setItem("accentColor", accentColor);
    const themeObj = THEME_ACCENTS[accentColor] || THEME_ACCENTS.Blue;
    const isDark = isDarkEffective;

    const brandColor = isDark ? themeObj.dark : themeObj.light;
    const root = document.documentElement;

    root.style.setProperty("--brand-color", brandColor);
    root.style.setProperty("--brand-color-light", themeObj.light);
    root.style.setProperty("--brand-color-dark", themeObj.dark);
    root.style.setProperty("--accent-color", themeObj.code);

    // Dynamic Shades mapping
    Object.entries(themeObj.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-indigo-${shade}`, hex);
      root.style.setProperty(`--color-brand-${shade}`, hex);
    });

    // 60-30-10 & Status Tokens
    if (isDark) {
      root.style.setProperty("--bg-primary", "#0F172A");
      root.style.setProperty("--bg-surface", "#1E293B");
      root.style.setProperty("--bg-surface-hover", "#273549");
      root.style.setProperty("--text-primary", "#F8F9FA");
      root.style.setProperty("--text-secondary", "#94A3B8");
      root.style.setProperty("--border-surface", "rgba(255, 255, 255, 0.08)");

      // Statuses in Dark Mode (Soft Glow / Reduced saturation)
      root.style.setProperty("--status-todo", "#94A3B8");
      root.style.setProperty("--status-in-progress", "#38BDF8");
      root.style.setProperty("--status-in-review", "#FBBF24");
      root.style.setProperty("--status-completed", "#34D399");
      root.style.setProperty("--status-urgent", "#F87171");
    } else {
      root.style.setProperty("--bg-primary", "#F8F9FA");
      root.style.setProperty("--bg-surface", "#FFFFFF");
      root.style.setProperty("--bg-surface-hover", "#F1F5F9");
      root.style.setProperty("--text-primary", "#0F172A");
      root.style.setProperty("--text-secondary", "#475569");
      root.style.setProperty("--border-surface", "#CBD5E1");

      // Statuses in Light Mode (Deep & High Contrast)
      root.style.setProperty("--status-todo", "#64748B");
      root.style.setProperty("--status-in-progress", "#2563EB");
      root.style.setProperty("--status-in-review", "#D97706");
      root.style.setProperty("--status-completed", "#16A34A");
      root.style.setProperty("--status-urgent", "#DC2626");
    }
  }, [accentColor, isDarkEffective]);

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        setAppearance,
        accentColor,
        setAccentColor,
        isDark: isDarkEffective,
        currentAccent: THEME_ACCENTS[accentColor] || THEME_ACCENTS.Blue,
        availableAccents: THEME_ACCENTS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
