import type { InvoiceItem } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatDateBR(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function calculateTotal(items: InvoiceItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.quantidade * item.valorUnitario,
    0,
  );
}

export function generateChaveAcesso(numero: string, dataEmissao: string): string {
  const digitsOnly = (numero + dataEmissao).replace(/\D/g, "");
  const seed = digitsOnly.padEnd(44, "0").slice(0, 44);
  return seed.replace(/(.{4})/g, "$1 ").trim();
}
