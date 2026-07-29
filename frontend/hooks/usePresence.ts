"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

type Presence = "ONLINE" | "OFFLINE"

const ENDPOINT = "/api/status"
const KEY = "presence"

// the last status this tab reported. it has to outlive the react tree and the page
// itself, because router.refresh() on a not found page is a full reload, so a ref
// would be reset on every reload and the refresh below would keep feeding itself.
let sent: Presence | null = null

function readSent(): Presence | null {
  try {
    const stored = window.sessionStorage.getItem(KEY)
    return stored === "ONLINE" || stored === "OFFLINE" ? stored : null
  } catch {
    return sent
  }
}

function writeSent(status: Presence | null): void {
  sent = status
  try {
    if (status === null) window.sessionStorage.removeItem(KEY)
    else window.sessionStorage.setItem(KEY, status)
  } catch {}
}

export function usePresence(): void {

  const router = useRouter()

  useEffect(() => {

    function send(status: Presence): void {

      if (readSent() === status) return
      writeSent(status)

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
      .then((response) => {
        // this hook also runs on /auth, where the endpoint answers 401. forgetting the
        // status there is what lets the real ONLINE go out once the session exists.
        if (!response.ok) {
          writeSent(null)
          return
        }
        router.refresh()
      })
      .catch(() => writeSent(null))
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
    // pagehide marked us offline, coming back from the back forward cache has to undo that.
    window.addEventListener("pageshow", onVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", onPageHide)
      window.removeEventListener("pageshow", onVisibilityChange)
    }
  }, [router])
}