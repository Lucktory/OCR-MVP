"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import HistorySection from "@/components/HistorySection";
import InvoiceSection from "@/components/InvoiceSection";
import InvoiceUploader from "@/components/InvoiceUploader";
import { generateRandomInvoice } from "@/lib/generator";
import type {
  AnalysisRecord,
  AnalysisResult,
  InvoiceData,
} from "@/lib/types";

const HISTORY_MAX = 20;

export type AnalysisStatus =
  | { kind: "idle" }
  | {
      kind: "loading";
      fileName: string;
      previewUrl: string;
      source: "upload" | "generator";
    }
  | {
      kind: "result";
      result: AnalysisResult;
      fileName: string;
      previewUrl: string;
      source: "upload" | "generator";
    }
  | { kind: "error"; message: string };

export default function Home() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>({ kind: "idle" });
  const activePreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activePreviewUrlRef.current) {
        URL.revokeObjectURL(activePreviewUrlRef.current);
      }
    };
  }, []);

  const runAnalysis = useCallback(
    async (
      file: File,
      fileName: string,
      previewUrl: string,
      source: "upload" | "generator",
    ) => {
      if (activePreviewUrlRef.current && activePreviewUrlRef.current !== previewUrl) {
        URL.revokeObjectURL(activePreviewUrlRef.current);
      }
      activePreviewUrlRef.current = previewUrl;

      setStatus({ kind: "loading", fileName, previewUrl, source });

      const formData = new FormData();
      formData.append("file", file);

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
        const result = json as AnalysisResult;
        setStatus({
          kind: "result",
          result,
          fileName,
          previewUrl,
          source,
        });
        const record: AnalysisRecord = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          fileName,
          result,
        };
        setHistory((prev) => [record, ...prev].slice(0, HISTORY_MAX));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erro desconhecido";
        setStatus({ kind: "error", message });
      }
    },
    [],
  );

  const resetAnalysis = useCallback(() => {
    if (activePreviewUrlRef.current) {
      URL.revokeObjectURL(activePreviewUrlRef.current);
      activePreviewUrlRef.current = null;
    }
    setStatus({ kind: "idle" });
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[640px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251, 146, 60, 0.18), rgba(251, 146, 60, 0.04) 40%, transparent 70%)",
        }}
      />

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <section className="mb-12 max-w-3xl sm:mb-16">
          <h1 className="text-4xl font-medium tracking-tight text-zinc-50 sm:text-5xl">
            Notas fiscais,
            <br />
            <span className="text-zinc-400">decodificadas.</span>
          </h1>
          <p className="mt-5 max-w-xl font-mono text-sm text-zinc-500">
            DANFE · NFC-e · NF-e
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <InvoiceSection
            invoice={invoice}
            onGenerate={() => setInvoice(generateRandomInvoice())}
            onAnalyze={runAnalysis}
            isAnalyzing={
              status.kind === "loading" && status.source === "generator"
            }
          />
          <InvoiceUploader
            status={status}
            onAnalyze={runAnalysis}
            onReset={resetAnalysis}
          />
        </div>

        {history.length > 0 && (
          <HistorySection
            records={history}
            onClear={() => setHistory([])}
          />
        )}
      </main>
    </div>
  );
}
