import { useRef, useState, type DragEvent } from "react";
import { AlertCircle, FileCheck2, LoaderCircle, UploadCloud } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { errorKeysFor } from "../../lib/apiError";
import { ApiError, documentService } from "../../services/documentService";
import { Button } from "../ui/Button";
import { ChunkSettingsPanel } from "../chunking/ChunkSettingsPanel";
import { Modal } from "../ui/Modal";
import { cn } from "../../lib/cn";

export function UploadModal({
  open,
  onClose,
  onIngested,
}: {
  open: boolean;
  onClose: () => void;
  onIngested: (documentId: string) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [busy, setBusy] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setErrorCode(null);
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setErrorCode(null);
    }
  };

  const handleIngest = async () => {
    if (!file) return;
    setBusy(true);
    setErrorCode(null);
    try {
      const created = await documentService.ingest(file, {
        chunkSize,
        chunkOverlap,
      });
      close();
      onIngested(created.id);
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "unknown");
      setBusy(false);
    }
  };

  const errorMeta = errorCode ? errorKeysFor(errorCode) : null;

  return (
    <Modal open={open} onClose={close} title={t("documents.upload")}>
      <div className="space-y-5">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label={t("documents.uploadModal.dropTitle")}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-9 text-center transition-colors",
            dragging
              ? "border-accent bg-accent-soft/50"
              : "border-line-strong bg-canvas hover:border-accent/50"
          )}
        >
          {file ? (
            <span className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <FileCheck2 size={18} aria-hidden="true" className="text-success" />
              {file.name}
              <span className="font-mono text-[11px] text-faint">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </span>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-elevated text-faint">
                <UploadCloud size={22} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-medium text-ink">
                {t("documents.uploadModal.dropTitle")}
              </p>
              <p className="mt-1 text-sm text-muted">
                {t("documents.uploadModal.dropHint")}
              </p>
            </>
          )}
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
            {t("documents.uploadModal.selectHint")}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              if (picked) {
                setFile(picked);
                setErrorCode(null);
              }
            }}
          />
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-faint">
            {t("documents.uploadModal.settings")}
          </p>
          <ChunkSettingsPanel
            chunkSize={chunkSize}
            chunkOverlap={chunkOverlap}
            onChangeSize={(size) => {
              setChunkSize(size);
              if (chunkOverlap >= size) {
                setChunkOverlap(Math.floor(size / 4));
              }
            }}
            onChangeOverlap={setChunkOverlap}
          />
        </div>

        {busy && (
          <div className="h-1 overflow-hidden rounded-full bg-elevated">
            <div className="h-full w-2/5 animate-indeterminate rounded-full bg-accent" />
          </div>
        )}

        {errorMeta && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3"
          >
            <AlertCircle
              size={15}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-danger"
            />
            <div>
              <p className="text-sm font-medium text-ink">{t(errorMeta.titleKey)}</p>
              <p className="mt-0.5 text-sm text-muted">{t(errorMeta.bodyKey)}</p>
            </div>
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted">
          {t("documents.uploadModal.note")} · {t("documents.uploadModal.hint")}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={close} disabled={busy}>
            {t("common.close")}
          </Button>
          <Button onClick={handleIngest} disabled={busy || !file}>
            {busy ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {busy ? t("documents.uploadModal.ingesting") : t("documents.uploadModal.ingest")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
