import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analyzer import analyze_invoice
from validators import validate_documento, validate_soma_itens

load_dotenv()

app = FastAPI(title="NF-OCR Analyzer")

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://localhost:3006,http://localhost:3007",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class InvoiceItem(BaseModel):
    descricao: str
    quantidade: float
    valor_unitario: float


class ExtractedInvoice(BaseModel):
    numero: str | None = None
    serie: str | None = None
    data_emissao: str | None = None
    valor_total: float | None = None
    cnpj_emissor: str | None = None
    cnpj_destinatario: str | None = None
    itens: list[InvoiceItem] = []


class Validations(BaseModel):
    cnpj_emissor_valid: bool
    cnpj_destinatario_valid: bool
    soma_itens_bate_com_total: bool


class AnalysisResult(BaseModel):
    is_invoice: bool
    document_type: Literal["DANFE", "NFC-e", "NF-e", "unknown"]
    confidence: Literal["high", "medium", "low"]
    reason_if_not_invoice: str | None = None
    extracted: ExtractedInvoice | None = None
    validations: Validations | None = None


ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp", "application/pdf"}
MAX_SIZE = 10 * 1024 * 1024


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Formato não suportado")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo maior que 10 MB")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    try:
        raw = analyze_invoice(contents, file.content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Falha na análise: {e}")

    if not raw.get("is_invoice"):
        return AnalysisResult(
            is_invoice=False,
            document_type=raw.get("document_type", "unknown"),
            confidence=raw.get("confidence", "high"),
            reason_if_not_invoice=raw.get("reason_if_not_invoice"),
            extracted=None,
            validations=None,
        )

    extracted_raw = raw.get("extracted") or {}
    validations = Validations(
        cnpj_emissor_valid=validate_documento(extracted_raw.get("cnpj_emissor")),
        cnpj_destinatario_valid=validate_documento(
            extracted_raw.get("cnpj_destinatario")
        ),
        soma_itens_bate_com_total=validate_soma_itens(extracted_raw),
    )

    return AnalysisResult(
        is_invoice=True,
        document_type=raw.get("document_type", "unknown"),
        confidence=raw.get("confidence", "medium"),
        reason_if_not_invoice=None,
        extracted=ExtractedInvoice(**extracted_raw),
        validations=validations,
    )
