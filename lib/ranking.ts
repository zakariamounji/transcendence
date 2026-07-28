import { cache } from "react"
import { serverFetch } from "@/lib/server-fetch"
import type { ProfileInfo } from "@/interfaces"

// we got player ranked by backend by level, wins...
export const getPlayers = cache(async (): Promise<ProfileInfo[]> => {

  const response = await serverFetch("/user/all")

  if (!response.ok) {
    throw new Error(`Backend answered ${response.status} for ${response.url}`)
  }

  const payload = await response.json()
  return payload.data ?? []
})

export function rankOf(players: ProfileInfo[], id: string): number | null {
  const seat = players.findIndex((player) => player.id === id)
  return seat === -1 ? null : seat + 1
}