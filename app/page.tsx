"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InvoiceModal from "@/components/InvoiceModal";
import InvoiceSection from "@/components/InvoiceSection";
import InvoiceUploader from "@/components/InvoiceUploader";
import type { InvoiceData } from "@/lib/types";

export default function Home() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <InvoiceSection
            invoice={invoice}
            onOpenModal={() => setModalOpen(true)}
          />
          <InvoiceUploader />
        </div>
      </main>

      <InvoiceModal
        open={modalOpen}
        initialData={invoice}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          setInvoice(data);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
