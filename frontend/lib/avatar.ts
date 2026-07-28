import { authClient } from "@/lib/auth-client"

const MAX_BYTES = 2 * 1024 * 1024

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif"

export async function changeAvatar(file: File): Promise<string | null> {
  if (file.size > MAX_BYTES) return "The picture cannot pass 2 MB."

  try {
    const body = new FormData()
    body.append("file", file)

    const response = await fetch("/api/avatar", { method: "POST", body })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      return payload?.message ?? `The upload failed with ${response.status}.`
    }

    const { error } = await authClient.updateUser({ image: payload.path })

    if (error) {
      return error.message || "The picture was saved but the profile would not take it."
    }

    return null
  } catch {
    return "The server could not be reached. Please try again."
  }
}

export { ACCEPT, MAX_BYTES }