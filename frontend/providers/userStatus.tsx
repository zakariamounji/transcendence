"use client"
import { useEffect } from "react"

export default function UserStatusProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"
    const url = `${backendUrl}/user/status`

    async function updateStatus(status: "ONLINE" | "OFFLINE") {
      try {
        await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        })
      } catch {}
    }

    updateStatus("ONLINE")

    function handleVisibility() {
      updateStatus(document.hidden ? "OFFLINE" : "ONLINE")
    }

    function handlePageHide() {
      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify({ status: "OFFLINE" })], {
          type: "application/json"
        })
      )
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      )
      window.removeEventListener("pagehide", handlePageHide)

      updateStatus("OFFLINE")
    }
  }, [])

  return children
}