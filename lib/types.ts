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
