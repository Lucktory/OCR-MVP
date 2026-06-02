"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DanfePreview from "./DanfePreview";
import { calculateTotal, formatCurrency } from "@/lib/formatters";
import type { InvoiceData, InvoiceItem } from "@/lib/types";

const DEFAULT_DATA: InvoiceData = {
  emitenteRazao: "Comércio de Eletrônicos Modelo Ltda.",
  emitenteCNPJ: "12345678000190",
  emitenteEndereco: "Av. Paulista, 1000 — São Paulo / SP",
  destinatarioNome: "Thiago C.",
  destinatarioCNPJ: "98765432000110",
  destinatarioEndereco: "Rua das Acácias, 250 — Rio de Janeiro / RJ",
  numero: "000.001.234",
  serie: "1",
  dataEmissao: "2026-06-02",
  naturezaOperacao: "Venda de mercadoria",
  itens: [
    { id: "1", descricao: "Notebook Pro 14", quantidade: 1, valorUnitario: 6500 },
    { id: "2", descricao: "Mouse sem fio", quantidade: 2, valorUnitario: 120 },
    { id: "3", descricao: "Cabo HDMI 2m", quantidade: 3, valorUnitario: 35 },
  ],
};

type Props = {
  open: boolean;
  initialData: InvoiceData | null;
  onClose: () => void;
  onSave: (data: InvoiceData) => void;
};

export default function InvoiceModal({
  open,
  initialData,
  onClose,
  onSave,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<InvoiceData>(initialData ?? DEFAULT_DATA);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setData(initialData ?? DEFAULT_DATA);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialData]);

  const total = useMemo(() => calculateTotal(data.itens), [data.itens]);

  function update<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(id: string, patch: Partial<Omit<InvoiceItem, "id">>) {
    setData((prev) => ({
      ...prev,
      itens: prev.itens.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setData((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: crypto.randomUUID(),
          descricao: "",
          quantidade: 1,
          valorUnitario: 0,
        },
      ],
    }));
  }

  function removeItem(id: string) {
    setData((prev) => ({
      ...prev,
      itens: prev.itens.filter((it) => it.id !== id),
    }));
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="w-full max-w-5xl rounded-xl"
    >
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <h2 className="text-sm font-medium tracking-tight text-zinc-50">
            Criar nota fiscal
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-50"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
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

        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
          <div className="overflow-y-auto border-b border-white/[0.08] px-5 py-5 md:border-b-0 md:border-r">
            <div className="space-y-6">
              <Group label="Emitente">
                <TextField
                  label="Razão social"
                  value={data.emitenteRazao}
                  onChange={(v) => update("emitenteRazao", v)}
                />
                <TextField
                  label="CNPJ"
                  value={data.emitenteCNPJ}
                  onChange={(v) =>
                    update("emitenteCNPJ", v.replace(/\D/g, "").slice(0, 14))
                  }
                  mono
                />
                <TextField
                  label="Endereço"
                  value={data.emitenteEndereco}
                  onChange={(v) => update("emitenteEndereco", v)}
                />
              </Group>

              <Group label="Destinatário">
                <TextField
                  label="Nome / Razão social"
                  value={data.destinatarioNome}
                  onChange={(v) => update("destinatarioNome", v)}
                />
                <TextField
                  label="CPF / CNPJ"
                  value={data.destinatarioCNPJ}
                  onChange={(v) =>
                    update(
                      "destinatarioCNPJ",
                      v.replace(/\D/g, "").slice(0, 14),
                    )
                  }
                  mono
                />
                <TextField
                  label="Endereço"
                  value={data.destinatarioEndereco}
                  onChange={(v) => update("destinatarioEndereco", v)}
                />
              </Group>

              <Group label="Nota">
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Número"
                    value={data.numero}
                    onChange={(v) => update("numero", v)}
                  />
                  <TextField
                    label="Série"
                    value={data.serie}
                    onChange={(v) => update("serie", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Data de emissão"
                    type="date"
                    value={data.dataEmissao}
                    onChange={(v) => update("dataEmissao", v)}
                  />
                  <TextField
                    label="Natureza"
                    value={data.naturezaOperacao}
                    onChange={(v) => update("naturezaOperacao", v)}
                  />
                </div>
              </Group>

              <Group
                label="Itens"
                action={
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-md px-2 py-0.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-50"
                  >
                    + Adicionar
                  </button>
                }
              >
                <div className="space-y-2">
                  {data.itens.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-xs text-zinc-500">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-zinc-500 transition hover:text-orange-300"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="space-y-2">
                        <ModalInput
                          value={item.descricao}
                          onChange={(v) =>
                            updateItem(item.id, { descricao: v })
                          }
                          placeholder="Descrição"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <ModalInput
                            type="number"
                            value={String(item.quantidade)}
                            onChange={(v) =>
                              updateItem(item.id, {
                                quantidade: Number(v) || 0,
                              })
                            }
                            placeholder="Qtd."
                            mono
                          />
                          <ModalInput
                            type="number"
                            step={0.01}
                            value={String(item.valorUnitario)}
                            onChange={(v) =>
                              updateItem(item.id, {
                                valorUnitario: Number(v) || 0,
                              })
                            }
                            placeholder="Valor unit."
                            mono
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Group>
            </div>
          </div>

          <div className="overflow-y-auto bg-zinc-900/40 px-5 py-5">
            <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/40">
              <DanfePreview data={data} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-3">
          <span className="font-mono text-sm text-zinc-300">
            {formatCurrency(total)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.12] bg-transparent px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave(data)}
              className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function Group({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {action}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      <ModalInput
        type={type}
        value={value}
        onChange={onChange}
        mono={mono}
      />
    </label>
  );
}

function ModalInput({
  type = "text",
  value,
  onChange,
  placeholder,
  step,
  mono = false,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: number;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/15 ${mono ? "font-mono" : ""}`}
    />
  );
}
