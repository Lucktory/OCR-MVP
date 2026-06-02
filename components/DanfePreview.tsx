import {
  calculateTotal,
  formatCNPJ,
  formatCurrency,
  formatDateBR,
  generateChaveAcesso,
} from "@/lib/formatters";
import type { InvoiceData } from "@/lib/types";

type DanfePreviewProps = {
  data: InvoiceData;
};

export default function DanfePreview({ data }: DanfePreviewProps) {
  const total = calculateTotal(data.itens);
  const chave = generateChaveAcesso(data.numero, data.dataEmissao);

  return (
    <div
      id="danfe-preview"
      className="bg-white text-[11px] text-slate-900"
    >
      <div className="flex items-stretch border-b border-slate-300">
        <div className="flex w-1/3 flex-col items-center justify-center border-r border-slate-300 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-slate-400 text-[9px] font-semibold tracking-wider text-slate-500">
            LOGO
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold leading-tight text-slate-800">
            {data.emitenteRazao || "—"}
          </p>
          <p className="text-center text-[9px] text-slate-500">
            {data.emitenteEndereco || "—"}
          </p>
        </div>

        <div className="flex w-1/3 flex-col items-center justify-center border-r border-slate-300 p-3">
          <p className="text-[10px] font-semibold tracking-wider text-slate-700">
            DANFE
          </p>
          <p className="mt-1 text-center text-[9px] leading-tight text-slate-600">
            Documento Auxiliar da Nota Fiscal Eletrônica
          </p>
          <div className="mt-2 flex w-full justify-around text-[9px]">
            <div className="text-center">
              <p className="text-slate-500">ENTRADA</p>
              <div className="mt-0.5 h-3 w-6 border border-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-500">SAÍDA</p>
              <div className="mt-0.5 flex h-3 w-6 items-center justify-center border border-slate-400 text-[9px] font-bold">
                X
              </div>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-slate-600">
            Nº <span className="font-semibold">{data.numero || "—"}</span>
          </p>
          <p className="text-[9px] text-slate-600">
            Série <span className="font-semibold">{data.serie || "—"}</span>
          </p>
        </div>

        <div className="flex w-1/3 flex-col justify-center p-3">
          <p className="text-[9px] uppercase tracking-wider text-slate-500">
            Chave de acesso
          </p>
          <div className="mt-1 h-7 rounded-sm bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />
          <p className="mt-1 break-all font-mono text-[8.5px] leading-tight text-slate-700">
            {chave}
          </p>
        </div>
      </div>

      <Section title="Natureza da operação">
        <p className="text-[11px]">{data.naturezaOperacao || "—"}</p>
      </Section>

      <Section title="Destinatário / Remetente">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Nome / Razão social" value={data.destinatarioNome} span={2} />
          <Field label="CPF / CNPJ" value={formatCNPJ(data.destinatarioCNPJ)} />
          <Field label="Endereço" value={data.destinatarioEndereco} span={2} />
          <Field label="Data de emissão" value={formatDateBR(data.dataEmissao)} />
        </div>
      </Section>

      <Section title="Dados dos produtos / serviços">
        <table className="w-full table-fixed border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50 text-slate-600">
              <th className="w-12 px-2 py-1 text-left font-medium">Cód.</th>
              <th className="px-2 py-1 text-left font-medium">Descrição</th>
              <th className="w-16 px-2 py-1 text-right font-medium">Qtde.</th>
              <th className="w-24 px-2 py-1 text-right font-medium">Vlr. Unit.</th>
              <th className="w-24 px-2 py-1 text-right font-medium">Vlr. Total</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-slate-400">
                  Sem itens
                </td>
              </tr>
            ) : (
              data.itens.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="px-2 py-1 text-slate-500">
                    {String(idx + 1).padStart(3, "0")}
                  </td>
                  <td className="truncate px-2 py-1">{item.descricao || "—"}</td>
                  <td className="px-2 py-1 text-right">{item.quantidade}</td>
                  <td className="px-2 py-1 text-right">
                    {formatCurrency(item.valorUnitario)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatCurrency(item.quantidade * item.valorUnitario)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <div className="border-t border-slate-300 bg-slate-50 px-3 py-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">
              Valor total da nota
            </p>
            <p className="mt-0.5 font-mono text-base font-semibold text-slate-900">
              {formatCurrency(total)}
            </p>
          </div>
          <p className="text-[9px] text-slate-400">
            Documento auxiliar — uso fiscal somente após autorização SEFAZ
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-300">
      <p className="bg-slate-100 px-3 py-1 text-[9px] font-medium uppercase tracking-wider text-slate-600">
        {title}
      </p>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  span = 1,
}: {
  label: string;
  value: string;
  span?: 1 | 2 | 3;
}) {
  const spanClass =
    span === 3 ? "col-span-3" : span === 2 ? "col-span-2" : "col-span-1";
  return (
    <div className={spanClass}>
      <p className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="truncate text-[11px] text-slate-900">{value || "—"}</p>
    </div>
  );
}
