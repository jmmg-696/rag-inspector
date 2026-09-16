import { createContext } from "react";
import { en, type TranslationDictionary, type TranslationKey } from "./en";
import { es } from "./es";

export type Language = "en" | "es";

export const LANGUAGE_STORAGE_KEY = "rag-inspector:language";

export const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const dictionaries: Record<Language, TranslationDictionary> = { en, es };

export type TranslateVars = Record<string, string | number>;

export function translate(
  language: Language,
  key: TranslationKey,
  vars?: TranslateVars
): string {
  let value: string = dictionaries[language][key];
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export type { TranslationKey };
