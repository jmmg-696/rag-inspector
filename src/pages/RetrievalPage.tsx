import {
  ArrowRight,
  AlertTriangle,
  Binary,
  Database,
  FileText,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { InfoTooltip } from "../components/ui/InfoTooltip";
import { EducationalCallout } from "../components/ui/EducationalCallout";
import { Button } from "../components/ui/Button";
import { QueryInput } from "../components/query/QueryInput";
import { VectorHeatmap } from "../components/embeddings/VectorHeatmap";
import { RetrievalResultCard } from "../components/retrieval/RetrievalResultCard";
import { SemanticSpace } from "../components/vectors/SemanticSpace";
import { useI18n } from "../hooks/useI18n";
import { errorKeysFor } from "../lib/apiError";
import { buttonStyles } from "../lib/buttonStyles";
import { formatChunkCount } from "../lib/format";
import { ApiError, documentService } from "../services/documentService";
import { retrievalService, type RetrievalParams } from "../services/retrievalService";
import { embeddingService } from "../services/vectorStoreService";
import type {
  DocumentSummary,
  EmbeddingModelMeta,
  RetrievalSearchResponse,
  RetrievalSpace,
} from "../types/domain";
import type { TranslationKey } from "../i18n";

const DEFAULT_QUERY = "What is the approval process for a request?";

type Phase = "idle" | "searching" | "done" | "error";

const flowStages: { key: string }[] = [
  { key: "query" },
  { key: "embedding" },
  { key: "search" },
  { key: "similarity" },
  { key: "ranking" },
];

export default function RetrievalPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const handoff = (location.state ?? null) as {
    query?: string;
    topK?: number;
    scoreThreshold?: number;
  } | null;
  const [query, setQuery] = useState(handoff?.query ?? DEFAULT_QUERY);
  const [topK, setTopK] = useState(
    handoff?.topK ? Math.min(20, Math.max(1, handoff.topK)) : 5
  );
  const [threshold, setThreshold] = useState(handoff?.scoreThreshold ?? 0);
  const [documentId, setDocumentId] = useState("");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [model, setModel] = useState<EmbeddingModelMeta | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [response, setResponse] = useState<RetrievalSearchResponse | null>(null);
  const [space, setSpace] = useState<RetrievalSpace | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<RetrievalParams | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showQueryVector, setShowQueryVector] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    documentService
      .health()
      .then((info) => setOnline(info !== null && info.api === "ok"))
      .catch(() => setOnline(false));
    documentService
      .list()
      .then(setDocuments)
      .catch(() => undefined);
    embeddingService.model().then(setModel).catch(() => undefined);
  }, []);

  const backendOffline = online === false;

  const runSearch = (params: RetrievalParams) => {
    setPhase("searching");
    setErrorCode(null);
    setLastParams(params);
    setSelectedPoint(null);
    setShowQueryVector(false);
    const modelPending = model === null || model.status !== "ready";
    retrievalService
      .search(params)
      .then((result) => {
        setResponse(result);
        setPhase("done");
        setHistory((prev) =>
          [
            params.query,
            ...prev.filter((item) => item !== params.query),
          ].slice(0, 5)
        );
        return retrievalService
          .semanticSpace(params)
          .then((projection) => setSpace(projection))
          .catch(() => setSpace(null));
      })
      .catch((error: unknown) => {
        setPhase("error");
        setErrorCode(error instanceof ApiError ? error.code : "unknown");
        if (modelPending) {
          embeddingService.model().then(setModel).catch(() => undefined);
        }
      });
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!query.trim()) return;
    runSearch({
      query: query.trim(),
      topK,
      scoreThreshold: threshold,
      documentId: documentId || null,
    });
  };

  const checkHealth = () => {
    setOnline(null);
    documentService
      .health()
      .then((info) => setOnline(info !== null && info.api === "ok"))
      .catch(() => setOnline(false));
  };

  const autoRunFired = useRef(false);
  const handoffQuery = handoff?.query;
  useEffect(() => {
    if (!handoffQuery || autoRunFired.current || online === false) return;
    autoRunFired.current = true;
    const params: RetrievalParams = {
      query: handoffQuery,
      topK,
      scoreThreshold: threshold,
      documentId: null,
    };
    Promise.resolve().then(() => runSearch(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoffQuery, online, topK, threshold]);

  const modelLoadingFirst = phase === "searching" && model?.status !== "ready";

  const results = useMemo(() => response?.results ?? [], [response]);
  const spaceScores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const hit of results) {
      map[hit.pointId] = hit.score;
    }
    return map;
  }, [results]);

  const selectFromSpace = (pointId: string | null) => {
    setSelectedPoint(pointId);
    if (pointId && spaceScores[pointId] != null) {
      const hit = results.find((item) => item.pointId === pointId);
      if (hit) {
        document
          .getElementById(`hit-${hit.rank}`)
          ?.scrollIntoView({ block: "nearest" });
      }
    }
  };

  if (backendOffline && !response) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("retrieval.title")}
          description={t("retrieval.description")}
        />
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3"
        >
          <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {t("error.network.title")}
            </p>
            <p className="mt-0.5 text-sm text-muted">{t("error.network.body")}</p>
            <p className="mt-1 font-mono text-[11px] text-faint">
              cd backend && uvicorn app.main:app --reload
            </p>
          </div>
          <Button variant="secondary" onClick={checkHealth}>
            <RefreshCw size={14} aria-hidden="true" />
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("retrieval.title")}
        description={t("retrieval.description")}
        badge={
          <StatusBadge
            label={t("retrieval.liveBadge")}
            tone="accent"
            pulse={phase === "searching"}
          />
        }
      />

      <div className="space-y-4">
        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={() => handleSubmit()}
          busy={phase === "searching"}
          placeholderText={t("retrieval.placeholder")}
          submitLabel={t("retrieval.search")}
        />

        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm sm:px-5">
          <label className="flex min-w-40 flex-1 basis-48 flex-col gap-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("retrieval.document")}
            </span>
            <select
              value={documentId}
              onChange={(event) => setDocumentId(event.target.value)}
              className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">{t("retrieval.allDocuments")}</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-24 flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("retrieval.topK")}
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(event) =>
                setTopK(
                  Math.min(20, Math.max(1, Number(event.target.value) || 1))
                )
              }
              className="h-9 rounded-md border border-line bg-surface px-2.5 font-mono text-sm text-ink"
            />
          </label>
          <label className="flex w-44 flex-col gap-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("retrieval.threshold")}
              <InfoTooltip body={t("retrieval.thresholdHint")} />
            </span>
            <span className="flex items-center gap-2.5">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="w-full accent-[var(--accent)]"
                aria-label={t("retrieval.threshold")}
              />
              <span className="w-10 shrink-0 font-mono text-xs text-ink">
                {threshold.toFixed(2)}
              </span>
            </span>
          </label>
        </div>
      </div>

      {history.length > 0 && phase === "idle" && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {t("retrieval.recentQueries")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  runSearch({
                    query: item,
                    topK,
                    scoreThreshold: threshold,
                    documentId: documentId || null,
                  });
                }}
                className="max-w-72 truncate rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "searching" && (
        <Card>
          <ol className="space-y-2.5 px-5 py-5" aria-label={t("retrieval.flowTitle")}>
            {flowStages.map((stage, index) => {
              const done = index === 0;
              const current = index === 1 || index === 2;
              return (
                <li
                  key={stage.key}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={
                      done
                        ? "flex h-6 w-6 items-center justify-center rounded-md bg-success-soft text-success"
                        : current
                          ? "flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent"
                          : "flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-line text-faint"
                    }
                  >
                    {stage.key === "query" ? (
                      <FileText size={12} aria-hidden="true" />
                    ) : stage.key === "embedding" ? (
                      <Binary size={12} aria-hidden="true" />
                    ) : stage.key === "search" ? (
                      <Database size={12} aria-hidden="true" />
                    ) : (
                      <ScanSearch size={12} aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className={
                      done || current ? "text-ink" : "text-faint"
                    }
                  >
                    {t(`retrieval.flow.${stage.key}` as TranslationKey)}
                  </span>
                  {current && modelLoadingFirst && stage.key === "embedding" ? (
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-accent">
                      <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
                      {t("retrieval.stage.loadingModel")}
                    </span>
                  ) : current ? (
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-accent">
                      <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
                      {stage.key === "embedding"
                        ? t("retrieval.stage.embedding")
                        : t("retrieval.stage.searching")}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {phase === "error" && errorCode && (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-5 py-4"
        >
          <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {t(errorKeysFor(errorCode).titleKey)}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">
              {t(errorKeysFor(errorCode).bodyKey)}
            </p>
            {errorCode === "vector_store_unavailable" && (
              <p className="mt-1 font-mono text-[11px] text-faint">
                docker compose up -d
              </p>
            )}
          </div>
          {lastParams && (
            <Button
              variant="secondary"
              onClick={() => runSearch(lastParams)}
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t("common.retry")}
            </Button>
          )}
        </div>
      )}

      {phase === "done" && response && response.corpusSize === 0 && (
        <EmptyState
          icon={Database}
          title={t("retrieval.noIndexedDocuments.title")}
          description={t("retrieval.noIndexedDocuments.body")}
          action={
            <Link to="/documents" className={buttonStyles("primary")}>
              <FileText size={14} aria-hidden="true" />
              {t("emptyPipeline.upload")}
            </Link>
          }
        />
      )}

      {phase === "done" && response && response.corpusSize > 0 && (
        <>
          <Card>
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {t("retrieval.queryLabel")}
                </p>
                <p className="mt-1.5 text-base font-medium text-ink">
                  “{response.query}”
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2" aria-label={t("retrieval.flowTitle")}>
                {flowStages.map((stage, index) => (
                  <span key={stage.key} className="flex items-center gap-2">
                    <span className="rounded-md border border-line bg-canvas px-2.5 py-1 text-xs text-muted">
                      {t(`retrieval.flow.${stage.key}` as TranslationKey)}
                    </span>
                    {index < flowStages.length - 1 && (
                      <ArrowRight size={12} aria-hidden="true" className="text-faint" />
                    )}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-canvas px-4 py-3">
                <Binary size={14} aria-hidden="true" className="text-accent" />
                <span className="font-mono text-xs text-ink">
                  {response.queryEmbedding.model}
                </span>
                <span className="font-mono text-[11px] text-faint">
                  {t("embeddings.dimensionsValue", {
                    count: formatChunkCount(response.queryEmbedding.dimensions),
                  })}
                </span>
                {response.queryEmbedding.vector && (
                  <button
                    type="button"
                    onClick={() => setShowQueryVector((prev) => !prev)}
                    aria-expanded={showQueryVector}
                    className="ml-auto rounded-md border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:bg-elevated hover:text-ink"
                  >
                    {showQueryVector
                      ? t("common.hideVector")
                      : t("common.viewVector")}
                  </button>
                )}
              </div>
              {showQueryVector && response.queryEmbedding.vector && (
                <div className="animate-fade-up">
                  <VectorHeatmap vector={response.queryEmbedding.vector} />
                </div>
              )}
              <p className="text-xs leading-relaxed text-muted">
                {t("retrieval.scoreIsNotConfidence")}{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate("/playground", {
                      state: { query: response.query },
                    })
                  }
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  {t("retrieval.useInPlayground")} →
                </button>
              </p>
            </div>
          </Card>

          {space && space.points.length > 0 && (
            <Card
              title={t("retrieval.spaceTitle")}
              description={t("retrieval.spaceBody")}
            >
              <div className="space-y-3 px-5 py-5 sm:px-6">
                <div className="h-72 sm:h-80">
                  <SemanticSpace
                    space={space}
                    totalVectors={response.corpusSize}
                    selectedId={selectedPoint}
                    onSelect={selectFromSpace}
                    query={space.query}
                  />
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
                  <li className="flex items-center gap-1.5">
                    <span className="text-warning" aria-hidden="true">★</span>
                    {t("retrieval.legendQuery")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {t("retrieval.legendRetrieved")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden="true" />
                    {t("retrieval.legendOther")}
                  </li>
                </ul>
              </div>
            </Card>
          )}

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink">
                {t("retrieval.resultsTitle")}
              </h2>
              <p className="font-mono text-[11px] text-faint">
                {t("retrieval.resultsCount", {
                  shown: response.totalResults,
                  total: formatChunkCount(response.corpusSize),
                })}
              </p>
            </div>
            {results.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={ScanSearch}
                  title={t("retrieval.noResults.title")}
                  description={t("retrieval.noResults.body")}
                />
              </div>
            ) : (
              <ol className="mt-4 space-y-3" aria-label={t("retrieval.resultsTitle")}>
                {results.map((hit) => (
                  <RetrievalResultCard
                    key={hit.pointId}
                    hit={hit}
                    active={selectedPoint === hit.pointId}
                    onActivate={setSelectedPoint}
                  />
                ))}
              </ol>
            )}
          </div>

          <EducationalCallout
            title={t("retrieval.similarityWhatTitle")}
            body={t("retrieval.similarityWhatBody")}
          />
        </>
      )}
    </div>
  );
}
