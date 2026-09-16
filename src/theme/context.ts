import { createContext } from "react";

export const THEME_STORAGE_KEY = "rag-inspector:theme";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
