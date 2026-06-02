import type { InvoiceItem } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCNPJ(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  }
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  }
  return value;
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
