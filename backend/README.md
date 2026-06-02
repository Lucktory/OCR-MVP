# backend — NF-OCR analyzer

FastAPI service. Accepts a multipart upload (PNG / JPG / WEBP / PDF), sends the image to a vision model, returns structured JSON describing whether it's a Brazilian nota fiscal and (if so) the extracted fields plus validation flags.

## Provider

Default: **Groq** (free tier, no credit card required).

Default model: `meta-llama/llama-4-scout-17b-16e-instruct` (Llama 4 Scout, vision-capable).

Swap to OpenAI by changing `PROVIDER` and `MODEL` in `.env`.

## Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate           # Windows PowerShell
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
copy .env.example .env            # Windows
# cp .env.example .env            # macOS / Linux
# edit .env: add your GROQ_API_KEY (from https://console.groq.com/keys)
```

## Run

```powershell
uvicorn main:app --reload --port 8000
```

Backend listens on `http://localhost:8000`. Next.js dev server proxies to it via `/api/analyze`.

## Endpoints

`GET /health` → `{"status": "ok"}`

`POST /analyze` → multipart form, field name `file` (image or PDF, ≤ 10 MB)

Response (invoice detected):

```json
{
  "is_invoice": true,
  "document_type": "DANFE",
  "confidence": "high",
  "reason_if_not_invoice": null,
  "extracted": {
    "numero": "000001234",
    "serie": "1",
    "data_emissao": "2026-06-02",
    "valor_total": 6845.00,
    "cnpj_emissor": "12345678000190",
    "cnpj_destinatario": "98765432000110",
    "itens": [
      {"descricao": "Notebook Pro 14", "quantidade": 1, "valor_unitario": 6500.00}
    ]
  },
  "validations": {
    "cnpj_emissor_valid": true,
    "cnpj_destinatario_valid": true,
    "soma_itens_bate_com_total": true
  }
}
```

Response (not an invoice):

```json
{
  "is_invoice": false,
  "document_type": "unknown",
  "confidence": "high",
  "reason_if_not_invoice": "imagem mostra um cartão de visita",
  "extracted": null,
  "validations": null
}
```

## Switching the vision model

If Groq deprecates the default model or you want to try another one:

1. Check the current list at https://console.groq.com/docs/models
2. Pick a model whose description includes "vision" or "multimodal" / "image"
3. Set `MODEL=<model-id>` in `.env`
4. Restart `uvicorn`
