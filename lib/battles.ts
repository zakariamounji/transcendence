import type { Battle } from "@/interfaces"

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/battles`

async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null)
  const message = payload?.message

  // nest hands back one message per broken rule, and they run together without a join
  if (Array.isArray(message)) return message.join(" ")

  return typeof message === "string" && message
    ? message
    : `The request failed with ${response.status}.`
}

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

/** Cancelling is the one thing left that the gateway has no event for. */
export async function cancelBattle(battleId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/${battleId}/cancel`, {
      method: "PATCH",
      credentials: "include"
    })

    return response.ok ? null : await readError(response)
  } catch {
    return "The server could not be reached. Please try again."
  }
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
