import { cookies } from "next/headers"

function resolveBackendUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  const baseUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
}

export async function serverFetch(url: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const resolvedUrl = resolveBackendUrl(url)

  const res = await fetch(resolvedUrl, {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: cookieHeader
    },
    cache: "no-store"
  })
  return res
}