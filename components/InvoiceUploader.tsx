"use client";

import { useEffect, useRef, useState } from "react";

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type UploadedFile = {
  file: File;
  previewUrl: string;
  kind: "image" | "pdf";
};

export default function InvoiceUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    };
  }, [uploaded]);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato não suportado.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Arquivo maior que 10 MB.");
      return;
    }

    if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);

    setUploaded({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type === "application/pdf" ? "pdf" : "image",
    });
  }

  function clearFile() {
    if (uploaded) URL.revokeObjectURL(uploaded.previewUrl);
    setUploaded(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white p-4">
      {uploaded ? (
        <UploadedPreview uploaded={uploaded} onClear={clearFile} />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition ${
            isDragging
              ? "border-slate-400 bg-slate-50"
              : "border-slate-200 bg-slate-50/30"
          }`}
        >
          <p className="text-sm text-slate-600">
            Arraste o arquivo aqui ou
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Selecionar
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Tirar foto
            </button>
          </div>
          <p className="text-xs text-slate-400">PNG · JPG · PDF · até 10 MB</p>
        </div>
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

      {error && (
        <p className="mt-3 text-xs text-rose-600">{error}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!uploaded}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Analisar
        </button>
      </div>
    </div>
  );
}

function UploadedPreview({
  uploaded,
  onClear,
}: {
  uploaded: UploadedFile;
  onClear: () => void;
}) {
  return (
    <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <p className="truncate text-xs text-slate-700">{uploaded.file.name}</p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2 py-0.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Remover
        </button>
      </div>
      <div className="flex h-full items-center justify-center p-4">
        {uploaded.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={uploaded.previewUrl}
            alt=""
            className="max-h-72 w-auto rounded-md border border-slate-200 bg-white object-contain"
          />
        ) : (
          <a
            href={uploaded.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Abrir PDF
          </a>
        )}
      </div>
    </div>
  );
}
