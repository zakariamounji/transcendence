"use server"
import { cookies } from "next/headers"

function getBackendUrl(url: string) {
  const backendBaseUrl =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:3000"

  if (/^https?:\/\//i.test(url)) {
    const parsedUrl = new URL(url)
    return new URL(parsedUrl.pathname + parsedUrl.search + parsedUrl.hash, backendBaseUrl)
  }

  return new URL(url, backendBaseUrl)
}

export async function myfetch(url: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const resolvedUrl = getBackendUrl(url)

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