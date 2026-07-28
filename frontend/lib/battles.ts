import type { Battle } from "@/interfaces"

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/battles`

async function readBattles(response: Response): Promise<Battle[]> {
  if (!response.ok) return []
  const payload = await response.json().catch(() => null)
  return payload?.data ?? []
}

export type BattleDraft = {
  challengeId: string
  mode: Battle["mode"]
  visibility: Battle["visibility"]
  durationSeconds: number
}

export async function fetchBattles(): Promise<Battle[]> {
  try {
    return await readBattles(await fetch(`${BASE_URL}/all`, { credentials: "include" }))
  } catch {
    return []
  }
}

export async function fetchBattle(battleId: string): Promise<Battle | null> {
  try {
    const response = await fetch(`${BASE_URL}/${battleId}`, { credentials: "include" })

    if (!response.ok) return null

    const payload = await response.json().catch(() => null)
    return payload?.data ?? null
  } catch {
    return null
  }
}

export async function fetchCurrentBattle(): Promise<Battle | null> {
  try {
    const response = await fetch(`${BASE_URL}/current`, { credentials: "include" })

    if (!response.ok) return null

    const payload = await response.json().catch(() => null)
    return payload?.data ?? null
  } catch {
    return null
  }
}