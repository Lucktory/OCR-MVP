"use client";

import { useEffect, useRef, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import DanfePreview from "./DanfePreview";
import type { InvoiceData } from "@/lib/types";

type Props = {
  invoice: InvoiceData | null;
  onGenerate: () => void;
};

const DANFE_NATURAL_WIDTH = 820;

export default function InvoiceSection({ invoice, onGenerate }: Props) {
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

  return <FilledSection invoice={invoice} onGenerate={onGenerate} />;
}

function FilledSection({
  invoice,
  onGenerate,
}: {
  invoice: InvoiceData;
  onGenerate: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

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

      {zoomOpen && (
        <ZoomDialog invoice={invoice} onClose={() => setZoomOpen(false)} />
      )}
    </div>
  );
}

function ZoomDialog({
  invoice,
  onClose,
}: {
  invoice: InvoiceData;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    return () => {
      if (d.open) d.close();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ref = transformRef.current;
      if (!ref) return;
      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        e.preventDefault();
        ref.zoomIn(0.3);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        ref.zoomOut(0.3);
      } else if (e.key === "0") {
        e.preventDefault();
        ref.resetTransform();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="h-[95vh] w-full max-w-6xl"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
          <p className="text-xs font-medium text-zinc-400">
            Nota nº {invoice.numero}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-50"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden bg-zinc-900/40">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.4}
            maxScale={4}
            centerOnInit
            limitToBounds={false}
            wheel={{ step: 0.15 }}
            doubleClick={{ mode: "toggle", step: 1.5 }}
            onTransform={(_, state) => setScale(state.scale)}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
              }}
            >
              <div className="shadow-2xl ring-1 ring-black/40">
                <DanfePreview data={invoice} />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-2.5">
          <p className="hidden text-[11px] text-zinc-500 sm:block">
            Scroll para zoom · arraste para mover · duplo clique para alternar
          </p>
          <div className="flex items-center gap-1">
            <ZoomButton
              onClick={() => transformRef.current?.zoomOut(0.3)}
              label="Diminuir"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </ZoomButton>
            <span className="min-w-[3.5rem] px-2 text-center font-mono text-xs text-zinc-300">
              {Math.round(scale * 100)}%
            </span>
            <ZoomButton
              onClick={() => transformRef.current?.zoomIn(0.3)}
              label="Aumentar"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </ZoomButton>
            <button
              type="button"
              onClick={() => transformRef.current?.resetTransform()}
              className="ml-1 rounded-md border border-white/[0.12] bg-white/[0.02] px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function ZoomButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-50"
    >
      {children}
    </button>
  );
}
