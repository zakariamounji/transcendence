const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

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

    if (Array.isArray(message)) return message.join(" ")

    return typeof message === "string" && message
      ? message
      : `The request failed with ${response.status}.`
  } catch {
    return "The server could not be reached. Please try again."
  }
}