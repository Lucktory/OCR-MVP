import DanfePreview from "./DanfePreview";
import type { InvoiceData } from "@/lib/types";

type Props = {
  invoice: InvoiceData | null;
  onOpenModal: () => void;
};

export default function InvoiceSection({ invoice, onOpenModal }: Props) {
  if (!invoice) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8">
        <button
          type="button"
          onClick={onOpenModal}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Criar nota fiscal
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={onOpenModal}
          className="text-xs font-medium text-slate-600 transition hover:text-slate-900"
        >
          Editar
        </button>
      </div>
      <DanfePreview data={invoice} />
    </div>
  );
}
