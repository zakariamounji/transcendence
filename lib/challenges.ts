import type { Challenge } from "@/interfaces"

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`

/**
 * Calls the challenges API from the browser and returns an error message,
 * or null when the call succeeded.
 */
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

    // nest hands back one message per broken rule, and they run together without a join
    if (Array.isArray(message)) return message.join(" ")

    return typeof message === "string" && message
      ? message
      : `The request failed with ${response.status}.`
  } catch {
    return "The server could not be reached. Please try again."
  }
}

/**
 * Reads one challenge in full. The list endpoints are free to leave fields out,
 * so the edit form asks for the whole record before it opens.
 */
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
