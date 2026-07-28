import { cache } from "react"
import { serverFetch } from "@/lib/server-fetch"
import type { Battle } from "@/interfaces"

// the board re-reads both from the browser every few seconds, so a bad answer here
// only costs the first paint and never has to take the whole page down with it
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

// cache() keeps these to a single request per render, however many components ask
export const getBattles = cache(async (): Promise<Battle[]> => read<Battle[]>("/battles/all", []))

export const getCurrentBattle = cache(async (): Promise<Battle | null> => (
  read<Battle | null>("/battles/current", null)
))
