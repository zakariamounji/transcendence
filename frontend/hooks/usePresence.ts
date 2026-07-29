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

      if (sent.current === status) return
      sent.current = status

      const body = JSON.stringify({ status })

      // going offline means the fetch request may not complete, sendBeacon is more reliable in that case.
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
      // .then(() => router.refresh())
      .then(() => console.log("Presence updated"))
      .catch(() => { sent.current = null })
    }

    function onVisibilityChange(): void {
      send(document.visibilityState === "hidden" ? "OFFLINE" : "ONLINE")
    }

    function onPageHide(): void {
      send("OFFLINE")
    }

    send("ONLINE")

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", onPageHide)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", onPageHide)
    }
  }, [router])
}