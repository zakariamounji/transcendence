"use client"
import { useEffect } from "react"

// An empty NEXT_PUBLIC_BACKEND_URL means same origin, which is what the HTTPS reverse proxy serves
const STATUS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/user/status`
const HEARTBEAT_MS = 20000

export default function UserStatusProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  useEffect(() => {
    const setOnline = async () => {
      try {
        await fetch(STATUS_URL, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "ONLINE" }),
        })
      } catch {}
    }

    // A normal fetch is cancelled when the page goes away, sendBeacon survives it
    const setOffline = () => {
      navigator.sendBeacon(
        STATUS_URL,
        new Blob([JSON.stringify({ status: "OFFLINE" })], {
          type: "application/json",
        })
      )
    }

    // User switches tabs
    const handleVisibility = () => {
      if (!document.hidden) {
        setOnline()
      }
    }

    // User opened the site
    setOnline()

    // Keep user alive every 20 seconds
    const heartbeat = setInterval(setOnline, HEARTBEAT_MS)

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", setOffline)

    return () => {
      clearInterval(heartbeat)

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      )

      window.removeEventListener(
        "pagehide",
        setOffline
      )
    }
  }, [])

  return children
}
