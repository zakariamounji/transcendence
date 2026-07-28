import { cache } from "react"
import { serverFetch } from "@/lib/server-fetch"
import type { ProfileInfo } from "@/interfaces"

/**
 * Every player, in the order the backend ranks them: level, then experience, then
 * wins. cache() keeps this to a single request per render, so the profile card and
 * the board below it read the same list and can never disagree about a rank.
 */
export const getPlayers = cache(async (): Promise<ProfileInfo[]> => {

  const response = await serverFetch("/user/all")

  if (!response.ok) {
    throw new Error(`Backend answered ${response.status} for ${response.url}`)
  }

  const payload = await response.json()
  return payload.data ?? []
})

/**
 * The seat at that table. Not globalRank, which the database hands out on sign up
 * and never touches again.
 */
export function rankOf(players: ProfileInfo[], id: string): number | null {
  const seat = players.findIndex((player) => player.id === id)
  return seat === -1 ? null : seat + 1
}
