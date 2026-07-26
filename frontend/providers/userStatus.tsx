"use client"
import { useEffect } from "react"

export default function UserStatusProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/status`

    const updateStatus = async (status: "ONLINE" | "OFFLINE") => {
      try {
        await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        })
      } catch {}
    }

    // User opened the site
    updateStatus("ONLINE")

    // Keep user alive every 20 seconds
    const heartbeat = setInterval(() => {
      updateStatus("ONLINE")
    }, 20000)

    // User switches tabs
    const handleVisibility = () => {
      if (!document.hidden) {
        updateStatus("ONLINE")
      }
    }

    // Best effort when browser/page closes
    const handlePageHide = () => {
      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify({ status: "OFFLINE" })], {
          type: "application/json",
        })
      )
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      clearInterval(heartbeat)

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      )

      window.removeEventListener(
        "pagehide",
        handlePageHide
      )

      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify({ status: "OFFLINE" })], {
          type: "application/json",
        })
      )
    }
  }, [])

  return children
}