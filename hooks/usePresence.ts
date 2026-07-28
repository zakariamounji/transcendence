"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

type Presence = "ONLINE" | "OFFLINE"

const ENDPOINT = "/api/status"

export function usePresence(): void {

  const router = useRouter()
  const sent = useRef<Presence | null>(null)

  useEffect(() => {

    function send(status: Presence): void {
      // nothing changed, so skip the round trip
      if (sent.current === status) return
      sent.current = status

      const body = JSON.stringify({ status })

      // going offline means the tab is already dying, and only a beacon survives that
      if (status === "OFFLINE") {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }))
        return
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      })
        // the page was rendered before this request landed, so its status is one step stale
        .then(() => router.refresh())
        .catch(() => { sent.current = null })
    }

    function onVisibilityChange(): void {
      send(document.visibilityState === "hidden" ? "OFFLINE" : "ONLINE")
    }

    function onPageHide(): void {
      send("OFFLINE")
    }

    send("ONLINE")

    // pagehide covers closing and navigating away, visibilitychange covers mobile,
    // where the tab is often frozen without pagehide ever firing
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", onPageHide)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", onPageHide)
    }
  }, [router])
}