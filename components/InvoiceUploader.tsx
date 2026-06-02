"use client";

import { useEffect, useRef, useState } from "react";
import AnalysisResult from "./AnalysisResult";
import type { AnalysisResult as AnalysisResultType } from "@/lib/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

type UploadedFile = {
  file: File;
  previewUrl: string;
  kind: "image";
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: AnalysisResultType }
  | { kind: "error"; message: string };

export default function InvoiceUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    return () => {
      if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    };
  }, [uploaded]);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    setStatus({ kind: "idle" });

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Envie uma imagem PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Arquivo maior que 4 MB.");
      return;
    }

    if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);

    setUploaded({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: "image",
    });
  }

  function clearFile() {
    if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    setUploaded(null);
    setError(null);
    setStatus({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function resetResult() {
    setStatus({ kind: "idle" });
    clearFile();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!uploaded) return;
    setStatus({ kind: "loading" });

    const formData = new FormData();
    formData.append("file", uploaded.file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) {
        setStatus({
          kind: "error",
          message: json?.detail ?? `Erro ${response.status}`,
        });
        return;
      }
      setStatus({ kind: "result", result: json as AnalysisResultType });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro desconhecido";
      setStatus({ kind: "error", message });
    }
  }

  return (
    <div className="flex min-h-[460px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      {status.kind === "result" ? (
        <AnalysisResult result={status.result} onReset={resetResult} />
      ) : uploaded ? (
        <UploadedPreview
          uploaded={uploaded}
          onClear={clearFile}
          status={status}
        />
      ) : (
        <DropZone
          isDragging={isDragging}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onPickFile={() => fileInputRef.current?.click()}
          onTakePhoto={() => cameraInputRef.current?.click()}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-3 text-xs text-orange-300">{error}</p>}
      {status.kind === "error" && (
        <p className="mt-3 text-xs text-orange-300">{status.message}</p>
      )}

      {status.kind !== "result" && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={analyze}
            disabled={!uploaded || status.kind === "loading"}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-zinc-600 disabled:shadow-none"
          >
            {status.kind === "loading" && <Spinner />}
            {status.kind === "loading" ? "Analisando…" : "Analisar"}
          </button>
        </div>
      )}
    </div>
  );
}

function DropZone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onPickFile,
  onTakePhoto,
}: {
  isDragging: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onPickFile: () => void;
  onTakePhoto: () => void;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-14 text-center transition ${
        isDragging
          ? "border-orange-400/40 bg-orange-400/[0.04]"
          : "border-white/[0.12] bg-white/[0.01]"
      }`}
    >
      <div
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p className="text-sm text-zinc-400">Arraste o arquivo aqui</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPickFile}
          className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
        >
          Selecionar
        </button>
        <button
          type="button"
          onClick={onTakePhoto}
          className="rounded-lg border border-white/[0.12] bg-white/[0.02] px-3.5 py-1.5 text-sm font-medium text-zinc-50 transition hover:bg-white/[0.06]"
        >
          Tirar foto
        </button>
      </div>
      <p className="font-mono text-[11px] text-zinc-600">
        PNG · JPG · WEBP — 4 MB
      </p>
    </div>
  );
}

function UploadedPreview({
  uploaded,
  onClear,
  status,
}: {
  uploaded: UploadedFile;
  onClear: () => void;
  status: Status;
}) {
  const loading = status.kind === "loading";
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-3 py-2">
        <p className="truncate font-mono text-xs text-zinc-400">
          {uploaded.file.name}
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="rounded-md px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remover
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploaded.previewUrl}
          alt=""
          className="max-h-72 w-auto rounded-md object-contain shadow-2xl ring-1 ring-black/40"
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
