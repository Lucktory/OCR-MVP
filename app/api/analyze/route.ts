import type { AnalysisResult, ExtractedInvoice } from "@/lib/types";
import {
  validateDocumento,
  validateSomaItens,
} from "@/lib/validators";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const MAX_SIZE = 4 * 1024 * 1024;
const ACCEPTED = new Set(["image/png", "image/jpeg", "image/webp"]);

const PROMPT = `Você é um analisador de documentos fiscais brasileiros.

Analise a imagem e determine se é uma nota fiscal brasileira (DANFE, NFC-e ou NF-e impressa).

Responda APENAS com um objeto JSON válido, sem markdown, sem texto adicional, seguindo EXATAMENTE este schema:

{
  "is_invoice": boolean,
  "document_type": "DANFE" | "NFC-e" | "NF-e" | "unknown",
  "confidence": "high" | "medium" | "low",
  "reason_if_not_invoice": string | null,
  "extracted": {
    "numero": string | null,
    "serie": string | null,
    "data_emissao": string | null,
    "valor_total": number | null,
    "cnpj_emissor": string | null,
    "cnpj_destinatario": string | null,
    "itens": [
      { "descricao": string, "quantidade": number, "valor_unitario": number }
    ]
  } | null
}

Regras:
- Se NÃO for uma nota fiscal brasileira, retorne is_invoice: false, extracted: null, e preencha reason_if_not_invoice com uma descrição curta em português.
- Se FOR uma nota fiscal, extraia todos os campos visíveis. Use null para campos não visíveis.
- CNPJ/CPF: APENAS os dígitos, sem pontos, barras ou traços.
- Valores monetários: números (não strings).
- data_emissao no formato YYYY-MM-DD.
- NÃO invente valores. Use null quando algo não estiver legível.`;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return jsonError(500, "GROQ_API_KEY não configurada no servidor");
  }

  const model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "Falha ao ler o upload");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "Arquivo ausente");
  }
  if (!ACCEPTED.has(file.type)) {
    return jsonError(400, "Envie uma imagem PNG, JPG ou WEBP");
  }
  if (file.size > MAX_SIZE) {
    return jsonError(400, "Arquivo maior que 4 MB");
  }
  if (file.size === 0) {
    return jsonError(400, "Arquivo vazio");
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  let groqResponse: Response;
  try {
    groqResponse = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch failed";
    return jsonError(502, `Falha ao contactar a Groq: ${message}`);
  }

  if (!groqResponse.ok) {
    const text = await groqResponse.text();
    return jsonError(502, `Groq retornou ${groqResponse.status}: ${text.slice(0, 200)}`);
  }

  let groqJson: unknown;
  try {
    groqJson = await groqResponse.json();
  } catch {
    return jsonError(502, "Resposta da Groq não é JSON");
  }

  const content = extractMessageContent(groqJson);
  if (!content) {
    return jsonError(502, "Resposta vazia da Groq");
  }

  let raw: RawAnalysis;
  try {
    raw = JSON.parse(extractJsonObject(content)) as RawAnalysis;
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid JSON";
    return jsonError(502, `Falha ao parsear JSON: ${message}`);
  }

  if (!raw.is_invoice) {
    const result: AnalysisResult = {
      is_invoice: false,
      document_type: raw.document_type ?? "unknown",
      confidence: raw.confidence ?? "high",
      reason_if_not_invoice: raw.reason_if_not_invoice ?? null,
      extracted: null,
      validations: null,
    };
    return Response.json(result);
  }

  const extracted = normalizeExtracted(raw.extracted);
  const result: AnalysisResult = {
    is_invoice: true,
    document_type: raw.document_type ?? "unknown",
    confidence: raw.confidence ?? "medium",
    reason_if_not_invoice: null,
    extracted,
    validations: {
      cnpj_emissor_valid: validateDocumento(extracted.cnpj_emissor),
      cnpj_destinatario_valid: validateDocumento(extracted.cnpj_destinatario),
      soma_itens_bate_com_total: validateSomaItens(extracted),
    },
  };
  return Response.json(result);
}

type RawAnalysis = {
  is_invoice: boolean;
  document_type?: AnalysisResult["document_type"];
  confidence?: AnalysisResult["confidence"];
  reason_if_not_invoice?: string | null;
  extracted?: Partial<ExtractedInvoice> | null;
};

function jsonError(status: number, detail: string): Response {
  return Response.json({ detail }, { status });
}

function extractMessageContent(payload: unknown): string | null {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "choices" in payload &&
    Array.isArray((payload as { choices?: unknown[] }).choices)
  ) {
    const choices = (payload as { choices: Array<{ message?: { content?: unknown } }> })
      .choices;
    const content = choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
  }
  return null;
}

function extractJsonObject(content: string): string {
  let s = content.trim();
  const fenceMatch = s.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) s = fenceMatch[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Nenhum objeto JSON encontrado");
  }
  return s.slice(start, end + 1);
}

function normalizeExtracted(
  raw: Partial<ExtractedInvoice> | null | undefined,
): ExtractedInvoice {
  return {
    numero: raw?.numero ?? null,
    serie: raw?.serie ?? null,
    data_emissao: raw?.data_emissao ?? null,
    valor_total:
      typeof raw?.valor_total === "number" ? raw.valor_total : null,
    cnpj_emissor: raw?.cnpj_emissor ?? null,
    cnpj_destinatario: raw?.cnpj_destinatario ?? null,
    itens: Array.isArray(raw?.itens)
      ? raw.itens.map((item) => ({
          descricao: String(item.descricao ?? ""),
          quantidade: Number(item.quantidade ?? 0),
          valor_unitario: Number(item.valor_unitario ?? 0),
        }))
      : [],
  };
}
