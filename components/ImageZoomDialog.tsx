"use client";

import { useEffect, useRef, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

type Props = {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ImageZoomDialog({ title, onClose, children }: Props) {
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
          <p className="truncate text-xs font-medium text-zinc-400">
            {title ?? "Visualização"}
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
              {children}
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
