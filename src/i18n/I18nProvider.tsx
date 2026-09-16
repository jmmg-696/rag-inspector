import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  I18nContext,
  LANGUAGE_STORAGE_KEY,
  translate,
  type TranslateVars,
  type Language,
} from "./index";
import type { TranslationKey } from "./en";

function readInitialLanguage(): Language {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw === '"es"' || raw === "es") return "es";
  } catch {
    /* storage unavailable */
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey, vars?: TranslateVars) =>
        translate(language, key, vars),
    }),
    [language, setLanguage]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}
