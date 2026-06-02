"use client";

import { toBlob } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import DanfePreview from "./DanfePreview";
import ImageZoomDialog from "./ImageZoomDialog";
import type { InvoiceData } from "@/lib/types";

type Props = {
  invoice: InvoiceData | null;
  onGenerate: () => void;
  onAnalyze: (
    file: File,
    fileName: string,
    previewUrl: string,
    source: "upload" | "generator",
  ) => void;
  isAnalyzing: boolean;
};

const DANFE_NATURAL_WIDTH = 820;

export default function InvoiceSection({
  invoice,
  onGenerate,
  onAnalyze,
  isAnalyzing,
}: Props) {
  if (!invoice) {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8">
        <p className="text-sm text-zinc-500">Sem nota fiscal para testar?</p>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
        >
          Criar nota fiscal
        </button>
      </div>
    );
  }

  return (
    <FilledSection
      invoice={invoice}
      onGenerate={onGenerate}
      onAnalyze={onAnalyze}
      isAnalyzing={isAnalyzing}
    />
  );
}

function FilledSection({
  invoice,
  onGenerate,
  onAnalyze,
  isAnalyzing,
}: {
  invoice: InvoiceData;
  onGenerate: () => void;
  onAnalyze: Props["onAnalyze"];
  isAnalyzing: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const update = () => {
      const w = container.clientWidth;
      const nextScale = w / DANFE_NATURAL_WIDTH;
      setScale(nextScale);
      setScaledHeight(inner.scrollHeight * nextScale);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [invoice]);

  async function handleAnalyze() {
    if (!captureRef.current || isAnalyzing) return;
    setCaptureError(null);
    try {
      const blob = await toBlob(captureRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });
      if (!blob) {
        setCaptureError("Falha ao capturar a nota fiscal.");
        return;
      }
      const numero = invoice.numero.replace(/\D/g, "") || "gerada";
      const fileName = `nota-${numero}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const previewUrl = URL.createObjectURL(blob);
      onAnalyze(file, fileName, previewUrl, "generator");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      setCaptureError(`Falha ao capturar: ${message}`);
    }
  }

  return (
    <div className="flex min-h-[460px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-50"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Ampliar
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Gerar outra
        </button>
      </div>

      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="Ampliar nota fiscal"
        className="group relative w-full cursor-zoom-in overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/40 transition hover:ring-orange-400/30"
      >
        <div
          ref={containerRef}
          className="relative w-full"
          style={
            scaledHeight !== null ? { height: `${scaledHeight}px` } : undefined
          }
        >
          <div
            ref={innerRef}
            style={{
              width: `${DANFE_NATURAL_WIDTH}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <DanfePreview data={invoice} />
          </div>
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-black/30 to-transparent pb-2 opacity-0 transition group-hover:opacity-100">
          <span className="rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] font-medium text-zinc-50 backdrop-blur">
            Clique para ampliar
          </span>
        </span>
      </button>

      {captureError && (
        <p className="mt-3 text-xs text-rose-300">{captureError}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-zinc-600 disabled:shadow-none"
        >
          {isAnalyzing && (
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
          )}
          {isAnalyzing ? "Analisando…" : "Analisar esta nota"}
        </button>
      </div>

      {/* Hidden capture surface — DANFE at natural width for html-to-image */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          pointerEvents: "none",
        }}
      >
        <div ref={captureRef} style={{ width: `${DANFE_NATURAL_WIDTH}px` }}>
          <DanfePreview data={invoice} />
        </div>
      </div>

      {zoomOpen && (
        <ImageZoomDialog
          title={`Nota nº ${invoice.numero}`}
          onClose={() => setZoomOpen(false)}
        >
          <div className="shadow-2xl ring-1 ring-black/40">
            <DanfePreview data={invoice} />
          </div>
        </ImageZoomDialog>
      )}
    </div>
  );
}
