import { cache } from "react"
import { serverFetch } from "@/lib/server-fetch"
import type { Battle } from "@/interfaces"

async function read<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await serverFetch(url)

    if (!response.ok) return fallback

    const payload = await response.json()
    return payload?.data ?? fallback
  } catch {
    return fallback
  }
}

export const getBattles = cache(async (): Promise<Battle[]> => read<Battle[]>("/battles/all", []))

export const getCurrentBattle = cache(async (): Promise<Battle | null> => (
  read<Battle | null>("/battles/current", null)
))