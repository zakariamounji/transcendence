import { cache } from "react"
import { redirect } from "next/navigation"
import { serverFetch } from "@/lib/server-fetch"
import type { ProfileInfo } from "@/interfaces"

// cache() keeps this to a single request per render,
// however many components ask for it.
export const getProfile = cache(async (): Promise<ProfileInfo> => {

  const response = await serverFetch("/user/me")

  if (response.status === 401 || response.status === 403) {
    redirect("/auth")
  }

  if (!response.ok) {
    throw new Error(`Backend answered ${response.status} for ${response.url}`)
  }

  const payload = await response.json()
  return payload.data
})