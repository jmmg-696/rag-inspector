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
  vector_store_unavailable: {
    titleKey: "error.vector_store_unavailable.title",
    bodyKey: "error.vector_store_unavailable.body",
  },
  embedding_model_unavailable: {
    titleKey: "error.embedding_model_unavailable.title",
    bodyKey: "error.embedding_model_unavailable.body",
  },
  embedding_failed: {
    titleKey: "error.embedding_failed.title",
    bodyKey: "error.embedding_failed.body",
  },
  already_running: {
    titleKey: "error.already_running.title",
    bodyKey: "error.already_running.body",
  },
  collection_mismatch: {
    titleKey: "error.collection_mismatch.title",
    bodyKey: "error.collection_mismatch.body",
  },
  validation: {
    titleKey: "error.validation.title",
    bodyKey: "error.validation.body",
  },
  unknown: {
    titleKey: "error.unknown.title",
    bodyKey: "error.unknown.body",
  },
};

export function errorKeysFor(code: string) {
  return errorKeys[code] ?? errorKeys.unknown;
}
