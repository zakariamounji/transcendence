import { serverFetch } from "@/lib/server-fetch"

const allowed = new Set(["ONLINE", "OFFLINE"])

export async function POST(request: Request): Promise<Response> {

  const payload = await request.json().catch(() => null)
  const status = payload?.status

  if (!allowed.has(status)) {
    return new Response("Expected a status of ONLINE or OFFLINE", { status: 400 })
  }

  const response = await serverFetch("/user/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })

  return new Response(null, { status: response.ok ? 204 : response.status })
}