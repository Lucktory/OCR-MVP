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
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[640px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251, 146, 60, 0.18), rgba(251, 146, 60, 0.04) 40%, transparent 70%)",
        }}
      />

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <section className="mb-12 max-w-3xl sm:mb-16">
          <h1 className="text-4xl font-medium tracking-tight text-zinc-50 sm:text-5xl">
            Notas fiscais,
            <br />
            <span className="text-zinc-400">decodificadas.</span>
          </h1>
          <p className="mt-5 max-w-xl font-mono text-sm text-zinc-500">
            DANFE · NFC-e · NF-e
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
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
