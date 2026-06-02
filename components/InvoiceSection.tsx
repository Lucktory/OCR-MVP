import DanfePreview from "./DanfePreview";
import type { InvoiceData } from "@/lib/types";

type Props = {
  invoice: InvoiceData | null;
  onOpenModal: () => void;
};

export default function InvoiceSection({ invoice, onOpenModal }: Props) {
  if (!invoice) {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8">
        <p className="text-sm text-zinc-500">
          Sem nota fiscal para testar?
        </p>
        <button
          type="button"
          onClick={onOpenModal}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200"
        >
          Criar nota fiscal
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[460px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={onOpenModal}
          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-50"
        >
          Editar
        </button>
      </div>
      <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/40">
        <DanfePreview data={invoice} />
      </div>
    </div>
  );
}
