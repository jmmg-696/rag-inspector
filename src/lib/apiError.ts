import type { TranslationKey } from "../i18n";

const errorKeys: Record<string, { titleKey: TranslationKey; bodyKey: TranslationKey }> = {
  unsupported_type: {
    titleKey: "error.unsupported_type.title",
    bodyKey: "error.unsupported_type.body",
  },
  empty_document: {
    titleKey: "error.empty_document.title",
    bodyKey: "error.empty_document.body",
  },
  invalid_file: {
    titleKey: "error.invalid_file.title",
    bodyKey: "error.invalid_file.body",
  },
  too_large: {
    titleKey: "error.too_large.title",
    bodyKey: "error.too_large.body",
  },
  invalid_settings: {
    titleKey: "error.invalid_settings.title",
    bodyKey: "error.invalid_settings.body",
  },
  not_found: {
    titleKey: "error.not_found.title",
    bodyKey: "error.not_found.body",
  },
  network: {
    titleKey: "error.network.title",
    bodyKey: "error.network.body",
  },
  unknown: {
    titleKey: "error.unknown.title",
    bodyKey: "error.unknown.body",
  },
};

export function errorKeysFor(code: string) {
  return errorKeys[code] ?? errorKeys.unknown;
}
