import type { InvoiceData, InvoiceItem } from "./types";

type Area =
  | "tech"
  | "geral"
  | "moveis"
  | "papelaria"
  | "auto"
  | "farma"
  | "construcao"
  | "alimentos"
  | "textil";

const COMPANIES: Array<{ nome: string; area: Area }> = [
  { nome: "Comércio de Eletrônicos Estrela", area: "tech" },
  { nome: "Tech Solutions Brasil", area: "tech" },
  { nome: "Informática Pinheiros", area: "tech" },
  { nome: "Distribuidora Norte Sul", area: "geral" },
  { nome: "Móveis & Design Continental", area: "moveis" },
  { nome: "Papelaria Aurora", area: "papelaria" },
  { nome: "Auto Peças Veloz", area: "auto" },
  { nome: "Farmácia São Lucas", area: "farma" },
  { nome: "Materiais Construir Bem", area: "construcao" },
  { nome: "Casa do Café Mineiro", area: "alimentos" },
  { nome: "Indústria Têxtil Algodão", area: "textil" },
];

const SUFFIXES = ["Ltda.", "S.A.", "ME", "EIRELI"];

const CIDADES: Array<{ cidade: string; uf: string; ruas: string[] }> = [
  {
    cidade: "São Paulo",
    uf: "SP",
    ruas: [
      "Av. Paulista",
      "Rua Augusta",
      "Av. Brigadeiro Faria Lima",
      "Av. Rebouças",
    ],
  },
  {
    cidade: "Rio de Janeiro",
    uf: "RJ",
    ruas: ["Av. Atlântica", "Rua Visconde de Pirajá", "Av. Rio Branco"],
  },
  {
    cidade: "Belo Horizonte",
    uf: "MG",
    ruas: ["Av. Afonso Pena", "Rua da Bahia", "Av. do Contorno"],
  },
  {
    cidade: "Curitiba",
    uf: "PR",
    ruas: ["Rua XV de Novembro", "Av. Sete de Setembro"],
  },
  {
    cidade: "Porto Alegre",
    uf: "RS",
    ruas: ["Av. Borges de Medeiros", "Rua dos Andradas"],
  },
  { cidade: "Salvador", uf: "BA", ruas: ["Av. Tancredo Neves"] },
  { cidade: "Recife", uf: "PE", ruas: ["Av. Boa Viagem"] },
  { cidade: "Florianópolis", uf: "SC", ruas: ["Av. Beira-Mar Norte"] },
];

const PRIMEIROS_NOMES = [
  "Ana",
  "Carlos",
  "Mariana",
  "João",
  "Beatriz",
  "Felipe",
  "Camila",
  "Rafael",
  "Juliana",
  "Lucas",
  "Fernanda",
  "Bruno",
  "Patrícia",
  "Thiago",
  "Larissa",
  "André",
  "Aline",
  "Marcelo",
  "Bianca",
  "Eduardo",
  "Renata",
];

const SOBRENOMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Lima",
  "Pereira",
  "Ferreira",
  "Costa",
  "Rodrigues",
  "Almeida",
  "Gomes",
  "Ribeiro",
  "Carvalho",
  "Martins",
  "Araújo",
  "Barbosa",
  "Cardoso",
];

const ITENS_POR_AREA: Record<
  Area,
  Array<{ descricao: string; min: number; max: number }>
> = {
  tech: [
    { descricao: "Notebook Pro 14", min: 4500, max: 8500 },
    { descricao: "Mouse sem fio", min: 80, max: 200 },
    { descricao: "Teclado mecânico", min: 250, max: 700 },
    { descricao: "Monitor 27 polegadas", min: 1200, max: 2800 },
    { descricao: "Cabo HDMI 2m", min: 25, max: 60 },
    { descricao: "Webcam Full HD", min: 180, max: 450 },
    { descricao: "Headset bluetooth", min: 150, max: 400 },
    { descricao: "SSD 1TB NVMe", min: 380, max: 750 },
  ],
  geral: [
    { descricao: "Pacote de café 500g", min: 18, max: 35 },
    { descricao: "Caixa papel A4 5000fls", min: 200, max: 320 },
    { descricao: "Detergente 5L", min: 28, max: 60 },
    { descricao: "Suporte para monitor", min: 80, max: 180 },
  ],
  moveis: [
    { descricao: "Cadeira ergonômica", min: 800, max: 2200 },
    { descricao: "Mesa de escritório 1.40m", min: 600, max: 1500 },
    { descricao: "Armário 4 portas", min: 450, max: 1200 },
    { descricao: "Estante de aço", min: 280, max: 750 },
  ],
  papelaria: [
    { descricao: "Caderno universitário 200fls", min: 22, max: 45 },
    { descricao: "Caneta esferográfica (cx 50)", min: 80, max: 140 },
    { descricao: "Grampeador médio", min: 35, max: 85 },
    { descricao: "Pasta arquivo morto", min: 8, max: 18 },
    { descricao: "Calculadora 12 dígitos", min: 45, max: 120 },
  ],
  auto: [
    { descricao: "Filtro de óleo", min: 35, max: 90 },
    { descricao: "Pastilha de freio dianteira", min: 120, max: 380 },
    { descricao: "Velas de ignição (jogo 4)", min: 80, max: 220 },
    { descricao: "Bateria 60Ah", min: 480, max: 820 },
  ],
  farma: [
    { descricao: "Dipirona 500mg cx 20cp", min: 8, max: 18 },
    { descricao: "Vitamina D 2000UI 30cp", min: 35, max: 75 },
    { descricao: "Termômetro digital", min: 25, max: 55 },
    { descricao: "Álcool 70% 1L", min: 12, max: 28 },
  ],
  construcao: [
    { descricao: "Saco cimento 50kg", min: 35, max: 55 },
    { descricao: "Tinta acrílica 18L", min: 280, max: 580 },
    { descricao: "Furadeira de impacto", min: 180, max: 480 },
  ],
  alimentos: [
    { descricao: "Café especial 250g", min: 28, max: 60 },
    { descricao: "Pão de queijo congelado 1kg", min: 25, max: 45 },
    { descricao: "Queijo minas frescal 500g", min: 30, max: 55 },
  ],
  textil: [
    { descricao: "Camisa polo (un.)", min: 65, max: 140 },
    { descricao: "Calça jeans (un.)", min: 120, max: 280 },
    { descricao: "Tecido algodão (metro)", min: 18, max: 45 },
  ],
};

const NATUREZAS = [
  "Venda de mercadoria",
  "Venda ao consumidor",
  "Prestação de serviço",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateCNPJ(): string {
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) sum1 += base[i] * weights1[i];
  const d1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const withD1 = [...base, d1];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) sum2 += withD1[i] * weights2[i];
  const d2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return [...withD1, d2].join("");
}

function generateCPF(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  let sum1 = 0;
  for (let i = 0; i < 9; i++) sum1 += base[i] * (10 - i);
  const d1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  const withD1 = [...base, d1];
  let sum2 = 0;
  for (let i = 0; i < 10; i++) sum2 += withD1[i] * (11 - i);
  const d2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return [...withD1, d2].join("");
}

function todayMinusDays(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function formatNumeroNota(n: number): string {
  const padded = String(n).padStart(9, "0");
  return `${padded.slice(0, 3)}.${padded.slice(3, 6)}.${padded.slice(6, 9)}`;
}

export function generateRandomInvoice(): InvoiceData {
  const company = pick(COMPANIES);
  const cidadeEmitente = pick(CIDADES);
  const cidadeDest = pick(CIDADES);

  const isB2B = Math.random() < 0.4;
  let destinatarioNome: string;
  let destinatarioCNPJ: string;

  if (isB2B) {
    const destCompany = pick(COMPANIES);
    destinatarioNome = `${destCompany.nome} ${pick(SUFFIXES)}`;
    destinatarioCNPJ = generateCNPJ();
  } else {
    const primeiro = pick(PRIMEIROS_NOMES);
    const meio = pick(SOBRENOMES);
    const ultimo = pick(SOBRENOMES);
    destinatarioNome = `${primeiro} ${meio} ${ultimo}`;
    destinatarioCNPJ = generateCPF();
  }

  const itemPool = ITENS_POR_AREA[company.area];
  const itemCount = randomInt(2, Math.min(5, itemPool.length));
  const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
  const itens: InvoiceItem[] = shuffled.slice(0, itemCount).map((item) => ({
    id: crypto.randomUUID(),
    descricao: item.descricao,
    quantidade: randomInt(1, 5),
    valorUnitario: randomFloat(item.min, item.max),
  }));

  return {
    emitenteRazao: `${company.nome} ${pick(SUFFIXES)}`,
    emitenteCNPJ: generateCNPJ(),
    emitenteEndereco: `${pick(cidadeEmitente.ruas)}, ${randomInt(50, 9999)} — ${cidadeEmitente.cidade} / ${cidadeEmitente.uf}`,
    destinatarioNome,
    destinatarioCNPJ,
    destinatarioEndereco: `${pick(cidadeDest.ruas)}, ${randomInt(50, 9999)} — ${cidadeDest.cidade} / ${cidadeDest.uf}`,
    numero: formatNumeroNota(randomInt(1000, 999999)),
    serie: String(randomInt(1, 3)),
    dataEmissao: todayMinusDays(randomInt(0, 60)),
    naturezaOperacao: pick(NATUREZAS),
    itens,
  };
}
