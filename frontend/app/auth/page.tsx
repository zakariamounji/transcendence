import AuthClient from "@/components/authClient"
import { serverFetch } from "@/lib/server-fetch"
import { redirect } from "next/navigation"

export default async function Auth(): Promise<React.JSX.Element> {

  const response = await serverFetch("/user/me")

  if (response.status === 200 && response.ok) {
    redirect("/")
  }

  return <AuthClient />
}