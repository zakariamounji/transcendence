"use client"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

const BATTLE_CHANGE = "battles:changed"

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
      transports: ["websocket"]
    })
  }
  return socket
}

// add event listener to the window
export function announceBattleChange(): void {
  window.dispatchEvent(new Event(BATTLE_CHANGE))
}

export function subscribeBattleChange(onChange: () => void): () => void {
  window.addEventListener(BATTLE_CHANGE, onChange)
  return () => window.removeEventListener(BATTLE_CHANGE, onChange)
}

export function subscribeConnection(onChange: () => void): () => void {
  const socket = getSocket()

  socket.on("connect", onChange)
  socket.on("disconnect", onChange)

  return () => {
    socket.off("connect", onChange)
    socket.off("disconnect", onChange)
  }
}

export function isConnected(): boolean {
  return getSocket().connected
}

// the gateway that make the data as orderly as possible
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "statusCode" in payload && "data" in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function readMessage(payload: unknown): string {
  if (typeof payload === "string") return payload

  const message = (payload as { message?: unknown } | null)?.message

  if (Array.isArray(message)) return message.join(" ")
  if (typeof message === "string" && message) return message

  return "The action failed. Please try again."
}

type Answer<T> = { data: T | null, error: string | null, message?: string | string[] | null }

export function emitBattle<T>(event: string, payload: unknown, timeoutMs: number = 8000): Promise<Answer<T>> {
  const socket = getSocket()

  return new Promise((resolve) => {
    let done = false

    function finish(answer: Answer<T>): void {
      if (done) return
      done = true
      socket.off("exception", onException)
      resolve(answer)
    }

    function onException(reason: unknown): void {
      finish({ data: null, error: readMessage(reason) })
    }

    socket.on("exception", onException)

    socket.timeout(timeoutMs).emit(event, payload, (timeout: Error | null, answer: unknown) => {
      if (timeout) {
        finish({ data: null, error: "The server did not answer in time." })
        return
      }
      finish({ data: unwrap<T>(answer), error: null })
    })
  })
}
