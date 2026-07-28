const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

/**
 * Hands a player the admin role. The backend is the one that checks the caller is an
 * admin, the button is only hidden from everyone else so nobody is invited to try.
 * Returns an error message, or null when the call succeeded.
 */
export async function promoteToAdmin(userId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/user/adminRole`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
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
