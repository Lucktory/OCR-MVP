"use client";

import { useEffect, useRef, useState } from "react";
import AnalysisResult from "./AnalysisResult";
import ImageZoomDialog from "./ImageZoomDialog";
import type { AnalysisStatus } from "@/app/page";
import type { AnalysisResult as AnalysisResultType } from "@/lib/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

type UploadedFile = {
  file: File;
  previewUrl: string;
};

type Props = {
  status: AnalysisStatus;
  onAnalyze: (
    file: File,
    fileName: string,
    previewUrl: string,
    source: "upload" | "generator",
  ) => void;
  onReset: () => void;
};

export default function InvoiceUploader({ status, onAnalyze, onReset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    };
  }, [uploaded]);

  useEffect(() => {
    if (status.kind === "result" || status.kind === "loading") {
      if (uploaded) {
        URL.revokeObjectURL(uploaded.previewUrl);
        setUploaded(null);
      }
    }
  }, [status.kind, uploaded]);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

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
    });
  }

  function clearLocalFile() {
    if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    setUploaded(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function handleAnalyzeClick() {
    if (!uploaded) return;
    onAnalyze(uploaded.file, uploaded.file.name, uploaded.previewUrl, "upload");
    setUploaded(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function handleReset() {
    clearLocalFile();
    onReset();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const body = renderBody();

  return (
    <div className="flex min-h-[460px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      {body}

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

      {zoomOpen && (
        <ImageZoomDialog
          title={
            status.kind === "result" || status.kind === "loading"
              ? status.fileName
              : uploaded?.file.name
          }
          onClose={() => setZoomOpen(false)}
        >
          <ZoomedImage
            url={
              status.kind === "result" || status.kind === "loading"
                ? status.previewUrl
                : (uploaded?.previewUrl ?? "")
            }
          />
        </ImageZoomDialog>
      )}
    </div>
  );

  function renderBody() {
    if (status.kind === "loading") {
      return (
        <LoadingView
          fileName={status.fileName}
          previewUrl={status.previewUrl}
          onZoom={() => setZoomOpen(true)}
        />
      );
    }

    if (status.kind === "result") {
      return (
        <ResultView
          result={status.result}
          fileName={status.fileName}
          previewUrl={status.previewUrl}
          onZoom={() => setZoomOpen(true)}
          onReset={handleReset}
        />
      );
    }

    if (status.kind === "error") {
      return (
        <ErrorView message={status.message} onReset={handleReset} />
      );
    }

    if (uploaded) {
      return (
        <UploadedPreview
          uploaded={uploaded}
          onClear={clearLocalFile}
          onAnalyze={handleAnalyzeClick}
          onZoom={() => setZoomOpen(true)}
        />
      );
    }

    return (
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
    );
  }
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
  onAnalyze,
  onZoom,
}: {
  uploaded: UploadedFile;
  onClear: () => void;
  onAnalyze: () => void;
  onZoom: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-3 py-2">
        <p className="truncate font-mono text-xs text-zinc-400">
          {uploaded.file.name}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-50"
        >
          Remover
        </button>
      </div>
      <button
        type="button"
        onClick={onZoom}
        aria-label="Ampliar imagem"
        className="group flex flex-1 cursor-zoom-in items-center justify-center p-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploaded.previewUrl}
          alt=""
          className="max-h-72 w-auto rounded-md object-contain shadow-2xl ring-1 ring-black/40 transition group-hover:ring-orange-400/30"
        />
      </button>
      <div className="flex justify-end p-3">
        <button
          type="button"
          onClick={onAnalyze}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
        >
          Analisar
        </button>
      </div>
    </div>
  );
}

function LoadingView({
  fileName,
  previewUrl,
  onZoom,
}: {
  fileName: string;
  previewUrl: string;
  onZoom: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-3 py-2">
        <p className="truncate font-mono text-xs text-zinc-400">{fileName}</p>
        <Spinner />
      </div>
      <button
        type="button"
        onClick={onZoom}
        aria-label="Ampliar imagem"
        className="group flex flex-1 cursor-zoom-in items-center justify-center p-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt=""
          className="max-h-72 w-auto rounded-md object-contain opacity-70 shadow-2xl ring-1 ring-black/40 transition group-hover:opacity-100"
        />
      </button>
      <div className="border-t border-white/[0.08] px-3 py-2.5">
        <p className="text-center text-xs text-zinc-400">Analisando…</p>
      </div>
    </div>
  );
}

function ResultView({
  result,
  fileName,
  previewUrl,
  onZoom,
  onReset,
}: {
  result: AnalysisResultType;
  fileName: string;
  previewUrl: string;
  onZoom: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
        <button
          type="button"
          onClick={onZoom}
          aria-label="Ampliar imagem analisada"
          className="group shrink-0 cursor-zoom-in overflow-hidden rounded-md ring-1 ring-white/[0.08] transition hover:ring-orange-400/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 object-cover"
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-zinc-400">{fileName}</p>
          <p className="text-[10px] text-zinc-500">Clique para ampliar</p>
        </div>
      </div>
      <div className="flex-1">
        <AnalysisResult result={result} onReset={onReset} />
      </div>
    </div>
  );
}

function ErrorView({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/[0.08] text-rose-300"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="text-base font-medium text-zinc-50">Erro na análise</p>
        <p className="mt-1.5 max-w-xs text-sm text-zinc-400">{message}</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function ZoomedImage({ url }: { url: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="max-h-full max-w-full object-contain shadow-2xl ring-1 ring-black/40"
    />
  );
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin text-zinc-400"
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
