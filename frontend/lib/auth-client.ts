import { createAuthClient } from "better-auth/react"

// An empty baseURL means same origin, which is what the HTTPS reverse proxy serves
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || ""
})