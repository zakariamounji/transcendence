"use client"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

// the create dialog sits in the challenge card, far from the board, and this is how
// the two find each other without threading a callback through half the tree
const BATTLE_CHANGE = "battles:changed"

/**
 * One connection for the whole tab. The handshake carries the session cookie and
 * the gateway reads it back off handshake.headers, so nothing else has to be sent.
 *
 * The transport is pinned to websocket on purpose: the gateway answers with
 * `cors: { origin: "*", credentials: true }`, and a browser refuses a credentialed
 * polling request against a wildcard origin. A websocket never goes through that check.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
      transports: ["websocket"]
    })
  }
  return socket
}

/** Tells whoever is listening that the battles have to be read again. */
export function announceBattleChange(): void {
  window.dispatchEvent(new Event(BATTLE_CHANGE))
}

export function subscribeBattleChange(onChange: () => void): () => void {
  window.addEventListener(BATTLE_CHANGE, onChange)
  return () => window.removeEventListener(BATTLE_CHANGE, onChange)
}

/** The connection state, shaped for useSyncExternalStore. */
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

// every http answer leaves the backend through a transform interceptor, and the
// socket acks come out of the same pipe
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

type Answer<T> = { data: T | null, error: string | null }

/**
 * Emits and waits for the ack.
 *
 * A gateway handler that throws never calls the ack, the error comes back as a
 * separate `exception` event instead, so both have to be watched. The UI only ever
 * has one action running at a time, which is what makes attributing that event safe.
 */
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
