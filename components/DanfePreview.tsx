import {
  calculateTotal,
  formatCNPJ,
  formatCurrency,
  formatDateBR,
  generateChaveAcesso,
} from "@/lib/formatters";
import type { InvoiceData, InvoiceItem } from "@/lib/types";

type DanfePreviewProps = {
  data: InvoiceData;
};

const NCM_POOL = [
  "8471.30.12",
  "8473.30.99",
  "8528.52.20",
  "8517.62.41",
  "9403.10.00",
  "4820.10.00",
  "3304.99.90",
  "8704.21.10",
];

const ICMS_ALIQ = 18;

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseEndereco(end: string): {
  rua: string;
  cidade: string;
  uf: string;
} {
  const m = end.match(/^(.+?)\s*—\s*(.+?)\s*\/\s*(\w+)$/);
  if (m) return { rua: m[1], cidade: m[2], uf: m[3] };
  return { rua: end, cidade: "—", uf: "—" };
}

function pseudoFromCNPJ(cnpj: string, length: number): string {
  const digits = cnpj.replace(/\D/g, "");
  let out = "";
  for (let i = 0; i < length; i++) {
    out += digits[(i * 7 + 3) % digits.length];
  }
  return out;
}

function formatInscricaoEstadual(cnpj: string): string {
  const d = pseudoFromCNPJ(cnpj, 12);
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}.${d.slice(9, 12)}`;
}

function formatCEP(cnpj: string): string {
  const d = pseudoFromCNPJ(cnpj, 8);
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

function formatTelefone(cnpj: string): string {
  const d = pseudoFromCNPJ(cnpj, 10);
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
}

function bairroFromCidade(cidade: string): string {
  const bairros = [
    "Centro",
    "Jardins",
    "Vila Madalena",
    "Pinheiros",
    "Botafogo",
    "Copacabana",
    "Savassi",
    "Batel",
    "Moinhos de Vento",
    "Boa Viagem",
  ];
  let hash = 0;
  for (let i = 0; i < cidade.length; i++) hash = (hash + cidade.charCodeAt(i)) % bairros.length;
  return bairros[hash];
}

function buildProtocolo(numero: string, dataEmissao: string): string {
  const ano = dataEmissao.slice(2, 4);
  const seq = numero.replace(/\D/g, "").padStart(9, "0");
  return `135${ano}${seq}`.padEnd(15, "0").slice(0, 15);
}

const COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

export default function DanfePreview({ data }: DanfePreviewProps) {
  const total = calculateTotal(data.itens);
  const chave = generateChaveAcesso(data.numero, data.dataEmissao);
  const emitenteAddr = parseEndereco(data.emitenteEndereco);
  const destAddr = parseEndereco(data.destinatarioEndereco);
  const inscEst = formatInscricaoEstadual(data.emitenteCNPJ);
  const cepEmit = formatCEP(data.emitenteCNPJ);
  const cepDest = formatCEP(data.destinatarioCNPJ);
  const telEmit = formatTelefone(data.emitenteCNPJ);
  const telDest = formatTelefone(data.destinatarioCNPJ);
  const bairroDest = bairroFromCidade(destAddr.cidade);
  const protocolo = buildProtocolo(data.numero, data.dataEmissao);
  const baseICMS = total;
  const valorICMS = +(total * (ICMS_ALIQ / 100)).toFixed(2);

  return (
    <div
      id="danfe-preview"
      className="w-[820px] bg-white px-7 py-8 font-sans text-[10px] leading-tight text-slate-900"
    >
      {/* RECEBEMOS strip */}
      <div className="border border-b-0 border-slate-700 px-2 py-1 text-[8.5px]">
        RECEBEMOS DE <span className="font-semibold">{data.emitenteRazao}</span>{" "}
        OS PRODUTOS / SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO.
        EMISSÃO: {formatDateBR(data.dataEmissao)} — VALOR TOTAL R${" "}
        {formatNumber(total)}
      </div>
      <div className="grid grid-cols-12 border border-b-0 border-slate-700">
        <Cell label="Data de recebimento" cols={2} mono />
        <Cell
          label="Identificação e assinatura do recebedor"
          cols={9}
          borderRight
        />
        <div className="col-span-1 flex items-center justify-center border-l border-slate-700 px-1 py-1 text-[8.5px] font-semibold">
          NF-e
          <br />
          Nº {data.numero}
        </div>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-12 border border-slate-700">
        <div className="col-span-5 flex items-start gap-2 border-r border-slate-700 p-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-slate-400 text-[8px] font-semibold tracking-wider text-slate-400">
            LOGO
          </div>
          <div className="text-[9.5px] leading-snug">
            <p className="font-bold uppercase tracking-tight">
              {data.emitenteRazao}
            </p>
            <p className="mt-1 text-[9px]">{emitenteAddr.rua}</p>
            <p className="text-[9px]">
              {bairroFromCidade(emitenteAddr.cidade)} — CEP {cepEmit}
            </p>
            <p className="text-[9px]">
              {emitenteAddr.cidade} / {emitenteAddr.uf} — Tel {telEmit}
            </p>
          </div>
        </div>

        <div className="col-span-3 flex flex-col items-center border-r border-slate-700 p-2 text-center">
          <p className="text-[13px] font-bold tracking-[0.2em]">DANFE</p>
          <p className="mt-0.5 text-[8px] leading-tight">
            Documento Auxiliar da
            <br />
            Nota Fiscal Eletrônica
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-[8px]">
            <div className="flex items-center gap-1">
              <span>0-ENTRADA</span>
              <span className="inline-block h-3 w-3 border border-slate-700" />
            </div>
            <div className="flex items-center gap-1">
              <span>1-SAÍDA</span>
              <span className="inline-flex h-3 w-3 items-center justify-center border border-slate-700 font-bold">
                X
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px]">
            Nº <span className="font-semibold">{data.numero}</span>
          </p>
          <p className="font-mono text-[10px]">
            SÉRIE <span className="font-semibold">{data.serie}</span>
          </p>
          <p className="mt-1 text-[8.5px]">FOLHA 1/1</p>
        </div>

        <div className="col-span-4 p-2">
          <Barcode seed={chave} />
          <p className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
            Chave de acesso
          </p>
          <p className="break-all font-mono text-[8.5px] leading-tight">
            {chave}
          </p>
          <p className="mt-1 text-[7.5px] leading-snug text-slate-500">
            Consulta de autenticidade no portal nacional da NF-e
            <br />
            www.nfe.fazenda.gov.br/portal ou no site da SEFAZ autorizadora
          </p>
        </div>
      </div>

      {/* NATUREZA + PROTOCOLO */}
      <div className="grid grid-cols-12 border border-t-0 border-slate-700">
        <Cell label="Natureza da operação" cols={7} borderRight>
          {data.naturezaOperacao}
        </Cell>
        <Cell label="Protocolo de autorização de uso" cols={5} mono>
          {protocolo} {formatDateBR(data.dataEmissao)} 14:32:11
        </Cell>
      </div>

      {/* INSCRIÇÃO ESTADUAL */}
      <div className="grid grid-cols-12 border border-t-0 border-slate-700">
        <Cell label="Inscrição estadual" cols={4} mono borderRight>
          {inscEst}
        </Cell>
        <Cell
          label="Inscrição estadual do subst. trib."
          cols={4}
          mono
          borderRight
        >
          ISENTO
        </Cell>
        <Cell label="CNPJ" cols={4} mono>
          {formatCNPJ(data.emitenteCNPJ)}
        </Cell>
      </div>

      {/* DESTINATÁRIO */}
      <SectionTitle>Destinatário / Remetente</SectionTitle>
      <div className="border border-t-0 border-slate-700">
        <div className="grid grid-cols-12 border-b border-slate-700">
          <Cell label="Nome / Razão social" cols={7} borderRight>
            {data.destinatarioNome}
          </Cell>
          <Cell label="CNPJ / CPF" cols={3} mono borderRight>
            {formatCNPJ(data.destinatarioCNPJ)}
          </Cell>
          <Cell label="Data de emissão" cols={2} mono>
            {formatDateBR(data.dataEmissao)}
          </Cell>
        </div>
        <div className="grid grid-cols-12 border-b border-slate-700">
          <Cell label="Endereço" cols={6} borderRight>
            {destAddr.rua}
          </Cell>
          <Cell label="Bairro / distrito" cols={3} borderRight>
            {bairroDest}
          </Cell>
          <Cell label="CEP" cols={3} mono>
            {cepDest}
          </Cell>
        </div>
        <div className="grid grid-cols-12">
          <Cell label="Município" cols={5} borderRight>
            {destAddr.cidade}
          </Cell>
          <Cell label="Telefone / Fax" cols={3} mono borderRight>
            {telDest}
          </Cell>
          <Cell label="UF" cols={1} borderRight>
            {destAddr.uf}
          </Cell>
          <Cell label="Inscrição estadual" cols={3} mono>
            ISENTO
          </Cell>
        </div>
      </div>

      {/* CÁLCULO DO IMPOSTO */}
      <SectionTitle>Cálculo do imposto</SectionTitle>
      <div className="grid grid-cols-8 border border-t-0 border-slate-700">
        <SmallBox label="Base cálc. ICMS" value={formatNumber(baseICMS)} />
        <SmallBox label="Valor do ICMS" value={formatNumber(valorICMS)} />
        <SmallBox label="BC ICMS subst." value="0,00" />
        <SmallBox label="Valor ICMS subst." value="0,00" />
        <SmallBox label="V. total produtos" value={formatNumber(total)} />
        <SmallBox label="Valor do frete" value="0,00" />
        <SmallBox label="Valor do seguro" value="0,00" />
        <SmallBox label="Desconto" value="0,00" last />
      </div>
      <div className="grid grid-cols-3 border border-t-0 border-slate-700">
        <SmallBox label="Outras despesas" value="0,00" />
        <SmallBox label="Valor total do IPI" value="0,00" />
        <SmallBox
          label="Valor total da nota"
          value={formatCurrency(total)}
          bold
          last
        />
      </div>

      {/* PRODUTOS / SERVIÇOS */}
      <SectionTitle>Dados dos produtos / serviços</SectionTitle>
      <table className="w-full border-collapse border border-t-0 border-slate-700 text-[8.5px]">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-100 text-[7.5px] uppercase tracking-wider text-slate-700">
            <th className="border-r border-slate-700 px-1 py-1 text-left">
              Cód
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-left">
              Descrição
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              NCM / SH
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              CST
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              CFOP
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              UN
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              Qtde.
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              V. Unit.
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              V. Total
            </th>
            <th className="border-r border-slate-700 px-1 py-1 text-right">
              V. ICMS
            </th>
            <th className="px-1 py-1 text-right">Alíq.</th>
          </tr>
        </thead>
        <tbody>
          {data.itens.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="px-2 py-3 text-center text-slate-400"
              >
                Sem itens
              </td>
            </tr>
          ) : (
            data.itens.map((item, idx) => (
              <ItemRow key={item.id} item={item} idx={idx} />
            ))
          )}
        </tbody>
      </table>

      {/* DADOS ADICIONAIS */}
      <SectionTitle>Dados adicionais</SectionTitle>
      <div className="border border-t-0 border-slate-700">
        <div className="border-b border-slate-700 px-2 py-1">
          <p className="text-[7.5px] uppercase tracking-wider text-slate-500">
            Informações complementares
          </p>
          <p className="mt-0.5 text-[9px] text-slate-700">
            Documento emitido por ME ou EPP optante pelo Simples Nacional. Não
            gera direito a crédito fiscal de IPI. Consulte a autenticidade
            deste documento em www.nfe.fazenda.gov.br/portal.
          </p>
        </div>
        <div className="px-2 py-1">
          <p className="text-[7.5px] uppercase tracking-wider text-slate-500">
            Reservado ao fisco
          </p>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  cols,
  mono = false,
  borderRight = false,
  children,
}: {
  label: string;
  cols: number;
  mono?: boolean;
  borderRight?: boolean;
  children?: React.ReactNode;
}) {
  const colClass = COL_SPAN[cols] ?? "col-span-1";
  return (
    <div
      className={`${colClass} ${borderRight ? "border-r border-slate-700" : ""} px-1.5 py-1`}
    >
      <p className="text-[7.5px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`text-[10px] text-slate-900 ${mono ? "font-mono" : ""}`}>
        {children ?? " "}
      </p>
    </div>
  );
}

function SmallBox({
  label,
  value,
  bold = false,
  last = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`${last ? "" : "border-r border-slate-700"} px-1.5 py-1`}>
      <p className="text-[7.5px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`text-right font-mono ${bold ? "text-[11px] font-semibold" : "text-[10px]"} text-slate-900`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-b-0 border-slate-700 bg-slate-200/70 px-1.5 py-0.5 text-[7.5px] font-semibold uppercase tracking-wider text-slate-700">
      {children}
    </p>
  );
}

function ItemRow({ item, idx }: { item: InvoiceItem; idx: number }) {
  const total = item.quantidade * item.valorUnitario;
  const icms = +(total * (ICMS_ALIQ / 100)).toFixed(2);
  return (
    <tr className="border-b border-slate-300 last:border-b-0">
      <td className="border-r border-slate-300 px-1 py-0.5 font-mono">
        {String(idx + 1).padStart(3, "0")}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 truncate">
        {item.descricao}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        {NCM_POOL[idx % NCM_POOL.length]}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        060
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        5102
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right">UN</td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        {item.quantidade}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        {formatNumber(item.valorUnitario)}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        {formatNumber(total)}
      </td>
      <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono">
        {formatNumber(icms)}
      </td>
      <td className="px-1 py-0.5 text-right font-mono">18,00</td>
    </tr>
  );
}

function Barcode({ seed }: { seed: string }) {
  const digits = seed.replace(/\D/g, "");
  const bars = [];
  for (let i = 0; i < 80; i++) {
    const d = parseInt(digits[i % digits.length] || "5", 10);
    const isBlack = d % 2 === 0;
    const width = (d % 3) + 1;
    bars.push({ isBlack, width });
  }
  let x = 0;
  return (
    <svg viewBox="0 0 220 36" preserveAspectRatio="none" className="h-10 w-full">
      {bars.map((b, i) => {
        const rect = b.isBlack ? (
          <rect key={i} x={x} y={0} width={b.width} height={36} fill="#000" />
        ) : null;
        x += b.width + 1;
        return rect;
      })}
    </svg>
  );
}
