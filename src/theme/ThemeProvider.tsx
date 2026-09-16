import { useCallback, useEffect, type ReactNode } from "react";
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
} from "./context";
import { useLocalStorage } from "../hooks/useLocalStorage";

function readInitialTheme(): Theme {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === '"dark"' || raw === "dark") return "dark";
    if (raw === '"light"' || raw === "light") return "light";
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>(
    THEME_STORAGE_KEY,
    readInitialTheme()
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
