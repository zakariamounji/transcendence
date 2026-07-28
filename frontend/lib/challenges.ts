import type { Challenge } from "@/interfaces"

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`

export async function challengeRequest(path: string, options: RequestInit): Promise<string | null> {
  try {

    const response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options
    })

    if (response.ok) return null

    const payload = await response.json().catch(() => null)
    const message = payload?.message

    if (Array.isArray(message)) return message.join(" ")

    return typeof message === "string" && message
      ? message
      : `The request failed with ${response.status}.`
  } catch {
    return "The server could not be reached. Please try again."
  }
}

export async function fetchChallenge(cid: string): Promise<Challenge | null> {
  try {
    const response = await fetch(`${BASE_URL}/${cid}`, { credentials: "include" })

    if (!response.ok) return null

    const payload = await response.json()
    return payload?.data ?? payload ?? null
  } catch {
    return null
  }
}