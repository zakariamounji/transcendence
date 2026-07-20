"use server"
import { cookies } from "next/headers"

export async function myfetch(url: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: cookieHeader
    },
    cache: "no-store"
  })

  return res
}