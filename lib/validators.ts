import type { ExtractedInvoice } from "./types";

function digits(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/\D/g, "");
}

export function validateCNPJ(value: string | null | undefined): boolean {
  const d = digits(value);
  if (d.length !== 14 || new Set(d).size === 1) return false;
  const nums = d.split("").map(Number);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const s1 = w1.reduce((acc, w, i) => acc + nums[i] * w, 0);
  const dv1 = s1 % 11 < 2 ? 0 : 11 - (s1 % 11);
  if (dv1 !== nums[12]) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const s2 = w2.reduce((acc, w, i) => acc + nums[i] * w, 0);
  const dv2 = s2 % 11 < 2 ? 0 : 11 - (s2 % 11);
  return dv2 === nums[13];
}

export function validateCPF(value: string | null | undefined): boolean {
  const d = digits(value);
  if (d.length !== 11 || new Set(d).size === 1) return false;
  const nums = d.split("").map(Number);
  let s1 = 0;
  for (let i = 0; i < 9; i++) s1 += nums[i] * (10 - i);
  const dv1 = s1 % 11 < 2 ? 0 : 11 - (s1 % 11);
  if (dv1 !== nums[9]) return false;
  let s2 = 0;
  for (let i = 0; i < 10; i++) s2 += nums[i] * (11 - i);
  const dv2 = s2 % 11 < 2 ? 0 : 11 - (s2 % 11);
  return dv2 === nums[10];
}

export function validateDocumento(value: string | null | undefined): boolean {
  const d = digits(value);
  if (d.length === 14) return validateCNPJ(d);
  if (d.length === 11) return validateCPF(d);
  return false;
}

export function validateSomaItens(extracted: ExtractedInvoice): boolean {
  if (!extracted.itens || extracted.itens.length === 0) return true;
  if (extracted.valor_total === null || extracted.valor_total === undefined) {
    return true;
  }
  const soma = extracted.itens.reduce(
    (acc, item) => acc + item.quantidade * item.valor_unitario,
    0,
  );
  return Math.abs(soma - extracted.valor_total) < 0.05;
}
