import base64
import json
import os
import re

import fitz
from openai import OpenAI

PROVIDER = os.getenv("PROVIDER", "groq").lower()

if PROVIDER == "groq":
    API_KEY_ENV = "GROQ_API_KEY"
    BASE_URL = "https://api.groq.com/openai/v1"
    DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
elif PROVIDER == "openai":
    API_KEY_ENV = "OPENAI_API_KEY"
    BASE_URL = None
    DEFAULT_MODEL = "gpt-4o"
else:
    raise RuntimeError(f"Unsupported PROVIDER: {PROVIDER}")

MODEL = os.getenv("MODEL", DEFAULT_MODEL)

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv(API_KEY_ENV)
        if not api_key:
            raise RuntimeError(f"{API_KEY_ENV} not set")
        if BASE_URL:
            _client = OpenAI(api_key=api_key, base_url=BASE_URL)
        else:
            _client = OpenAI(api_key=api_key)
    return _client


PROMPT = """Você é um analisador de documentos fiscais brasileiros.

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
- Se NÃO for uma nota fiscal brasileira, retorne is_invoice: false, extracted: null, e preencha reason_if_not_invoice com uma descrição curta em português (ex: "imagem mostra um cartão de visita", "documento ilegível").
- Se FOR uma nota fiscal, extraia todos os campos visíveis. Use null para campos não visíveis.
- CNPJ/CPF: APENAS os dígitos, sem pontos, barras ou traços.
- Valores monetários: números (não strings).
- data_emissao no formato YYYY-MM-DD.
- NÃO invente valores. Use null quando algo não estiver legível.
"""


def _pdf_first_page_to_png(pdf_bytes: bytes) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        page = doc[0]
        pix = page.get_pixmap(dpi=200)
        return pix.tobytes("png")
    finally:
        doc.close()


def _strip_markdown_fences(content: str) -> str:
    content = content.strip()
    fence_match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```$", content, re.DOTALL)
    if fence_match:
        return fence_match.group(1).strip()
    return content


def _extract_json_object(content: str) -> str:
    content = _strip_markdown_fences(content)
    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise RuntimeError(f"No JSON object found in model response: {content[:200]}")
    return content[start : end + 1]


def analyze_invoice(file_bytes: bytes, mime: str) -> dict:
    if mime == "application/pdf":
        image_bytes = _pdf_first_page_to_png(file_bytes)
        image_mime = "image/png"
    else:
        image_bytes = file_bytes
        image_mime = mime

    b64 = base64.b64encode(image_bytes).decode()
    data_url = f"data:{image_mime};base64,{b64}"

    response = _get_client().chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        response_format={"type": "json_object"},
        max_tokens=2000,
        temperature=0,
    )

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response from model")

    cleaned = _extract_json_object(content)
    return json.loads(cleaned)
