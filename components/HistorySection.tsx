"use client";

import { useState } from "react";
import AnalysisResult from "./AnalysisResult";
import { formatCurrency } from "@/lib/formatters";
import type { AnalysisRecord } from "@/lib/types";

type Props = {
  records: AnalysisRecord[];
  onClear: () => void;
};

export default function HistorySection({ records, onClear }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="mt-10 sm:mt-12">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-medium text-zinc-300">Histórico</h2>
          <span className="font-mono text-xs text-zinc-500">
            {records.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
        >
          Limpar
        </button>
      </header>

      <ul className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {records.map((record, idx) => (
          <li
            key={record.id}
            className={
              idx < records.length - 1 ? "border-b border-white/[0.04]" : ""
            }
          >
            <HistoryRow
              record={record}
              expanded={expandedId === record.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === record.id ? null : record.id))
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HistoryRow({
  record,
  expanded,
  onToggle,
}: {
  record: AnalysisRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { result } = record;
  const time = formatTime(record.timestamp);
  const isInvoice = result.is_invoice;
  const summary = buildSummary(record);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <span className="font-mono text-[11px] text-zinc-500">{time}</span>
        <span
          className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
            isInvoice ? "bg-emerald-400" : "bg-orange-400"
          }`}
          aria-hidden
        />
        <span
          className={`shrink-0 text-xs font-medium ${
            isInvoice ? "text-emerald-300" : "text-orange-300"
          }`}
        >
          {isInvoice ? result.document_type : "Não é nota fiscal"}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">
          {summary}
        </span>
        <span className="hidden truncate font-mono text-[10px] text-zinc-600 sm:inline sm:max-w-[12rem]">
          {record.fileName}
        </span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-zinc-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.04] bg-black/20 px-4 py-4 sm:px-6">
          <AnalysisResult
            result={result}
            onReset={onToggle}
            resetLabel="Fechar"
          />
        </div>
      )}
    </>
  );
}

function buildSummary(record: AnalysisRecord): string {
  const { result } = record;
  if (!result.is_invoice) {
    return result.reason_if_not_invoice ?? "—";
  }
  const ext = result.extracted;
  if (!ext) return "—";
  const parts: string[] = [];
  if (ext.numero) parts.push(`Nº ${ext.numero}`);
  if (ext.valor_total !== null) parts.push(formatCurrency(ext.valor_total));
  return parts.join("  ·  ") || "—";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
