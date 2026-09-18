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
  llm_unavailable: {
    titleKey: "error.llm_unavailable.title",
    bodyKey: "error.llm_unavailable.body",
  },
  llm_model_not_found: {
    titleKey: "error.llm_model_not_found.title",
    bodyKey: "error.llm_model_not_found.body",
  },
  llm_timeout: {
    titleKey: "error.llm_timeout.title",
    bodyKey: "error.llm_timeout.body",
  },
  generation_failed: {
    titleKey: "error.generation_failed.title",
    bodyKey: "error.generation_failed.body",
  },
  no_indexed_documents: {
    titleKey: "error.no_indexed_documents.title",
    bodyKey: "error.no_indexed_documents.body",
  },
  invalid_temperature: {
    titleKey: "error.invalid_temperature.title",
    bodyKey: "error.invalid_temperature.body",
  },
  cancelled: {
    titleKey: "error.cancelled.title",
    bodyKey: "error.cancelled.body",
  },
  evaluation_document_missing: {
    titleKey: "error.evaluation_document_missing.title",
    bodyKey: "error.evaluation_document_missing.body",
  },
  evaluation_no_resolvable_cases: {
    titleKey: "error.evaluation_no_resolvable_cases.title",
    bodyKey: "error.evaluation_no_resolvable_cases.body",
  },
  dataset_not_found: {
    titleKey: "error.dataset_not_found.title",
    bodyKey: "error.dataset_not_found.body",
  },
  unknown: {
    titleKey: "error.unknown.title",
    bodyKey: "error.unknown.body",
  },
};

export function errorKeysFor(code: string) {
  return errorKeys[code] ?? errorKeys.unknown;
}
