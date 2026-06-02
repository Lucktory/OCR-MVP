import { formatCNPJ, formatCurrency, formatDateBR } from "@/lib/formatters";
import type { AnalysisResult as AnalysisResultType } from "@/lib/types";

type Props = {
  result: AnalysisResultType;
  onReset: () => void;
};

export default function AnalysisResult({ result, onReset }: Props) {
  if (!result.is_invoice) {
    return <NotInvoice result={result} onReset={onReset} />;
  }
  return <InvoiceFound result={result} onReset={onReset} />;
}

function InvoiceFound({ result, onReset }: Props) {
  const ext = result.extracted!;
  const v = result.validations;
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <p className="text-xs font-medium text-emerald-200">
            Nota fiscal detectada · {result.document_type}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/70">
          confiança {result.confidence}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Número" value={ext.numero} mono />
        <Field label="Série" value={ext.serie} mono />
        <Field
          label="Data de emissão"
          value={ext.data_emissao ? formatDateBR(ext.data_emissao) : null}
          mono
        />
        <Field
          label="Valor total"
          value={ext.valor_total !== null ? formatCurrency(ext.valor_total) : null}
          mono
          highlight
        />
        <Field
          label="CNPJ emissor"
          value={ext.cnpj_emissor ? formatCNPJ(ext.cnpj_emissor) : null}
          mono
          valid={v?.cnpj_emissor_valid}
        />
        <Field
          label="CNPJ / CPF destinatário"
          value={
            ext.cnpj_destinatario ? formatCNPJ(ext.cnpj_destinatario) : null
          }
          mono
          valid={v?.cnpj_destinatario_valid}
        />
      </div>

      {ext.itens.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Itens ({ext.itens.length})
          </p>
          <div className="overflow-hidden rounded-lg border border-white/[0.06]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-500">
                  <th className="px-2 py-1.5 text-left font-medium">
                    Descrição
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium">Qtd</th>
                  <th className="px-2 py-1.5 text-right font-medium">Unit.</th>
                  <th className="px-2 py-1.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {ext.itens.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-2 py-1.5 text-zinc-200">
                      {item.descricao}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-zinc-300">
                      {item.quantidade}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-zinc-300">
                      {formatCurrency(item.valor_unitario)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-zinc-100">
                      {formatCurrency(item.quantidade * item.valor_unitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {v && (
        <div className="grid grid-cols-1 gap-1.5">
          <ValidationRow
            label="CNPJ emissor (dígito verificador)"
            ok={v.cnpj_emissor_valid}
          />
          <ValidationRow
            label="Documento destinatário (dígito verificador)"
            ok={v.cnpj_destinatario_valid}
          />
          <ValidationRow
            label="Soma dos itens × valor total"
            ok={v.soma_itens_bate_com_total}
          />
        </div>
      )}

      <div className="mt-auto flex justify-end pt-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-white/[0.12] bg-transparent px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
        >
          Analisar outra
        </button>
      </div>
    </div>
  );
}

function NotInvoice({ result, onReset }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <div
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/[0.08] text-orange-300"
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
        <p className="text-base font-medium text-zinc-50">
          Esta imagem não é uma nota fiscal
        </p>
        {result.reason_if_not_invoice && (
          <p className="mt-1.5 text-sm text-zinc-400">
            {result.reason_if_not_invoice}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
      >
        Tentar outra imagem
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  highlight = false,
  valid,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  highlight?: boolean;
  valid?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        {valid !== undefined &&
          (valid ? (
            <span className="text-[10px] text-emerald-400">✓</span>
          ) : (
            <span className="text-[10px] text-orange-300">!</span>
          ))}
      </div>
      <p
        className={`mt-0.5 ${mono ? "font-mono" : ""} ${highlight ? "text-sm font-semibold text-zinc-50" : "text-xs text-zinc-200"}`}
      >
        {value ?? <span className="text-zinc-600">—</span>}
      </p>
    </div>
  );
}

function ValidationRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-2.5 py-1 text-xs ${
        ok
          ? "border-emerald-500/15 bg-emerald-500/[0.04] text-emerald-200"
          : "border-orange-400/20 bg-orange-400/[0.04] text-orange-200"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px]">{ok ? "OK" : "FALHOU"}</span>
    </div>
  );
}
