import { cookies } from "next/headers"

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies()

  return (
    store.get("__Secure-better-auth.session_token")?.value ??
    store.get("better-auth.session_token")?.value
  )
}
