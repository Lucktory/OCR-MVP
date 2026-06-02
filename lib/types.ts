export type InvoiceItem = {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

export type InvoiceData = {
  emitenteRazao: string;
  emitenteCNPJ: string;
  emitenteEndereco: string;
  destinatarioNome: string;
  destinatarioCNPJ: string;
  destinatarioEndereco: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  naturezaOperacao: string;
  itens: InvoiceItem[];
};

export type ExtractedItem = {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
};

export type ExtractedInvoice = {
  numero: string | null;
  serie: string | null;
  data_emissao: string | null;
  valor_total: number | null;
  cnpj_emissor: string | null;
  cnpj_destinatario: string | null;
  itens: ExtractedItem[];
};

export type Validations = {
  cnpj_emissor_valid: boolean;
  cnpj_destinatario_valid: boolean;
  soma_itens_bate_com_total: boolean;
};

export type AnalysisResult = {
  is_invoice: boolean;
  document_type: "DANFE" | "NFC-e" | "NF-e" | "unknown";
  confidence: "high" | "medium" | "low";
  reason_if_not_invoice: string | null;
  extracted: ExtractedInvoice | null;
  validations: Validations | null;
};

export type AnalysisRecord = {
  id: string;
  timestamp: number;
  fileName: string;
  result: AnalysisResult;
};
