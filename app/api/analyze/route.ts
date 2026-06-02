export const runtime = "nodejs";
export const maxDuration = 60;

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();

  try {
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Backend unreachable";
    return Response.json(
      { detail: `Falha ao contactar o backend: ${message}` },
      { status: 502 },
    );
  }
}
