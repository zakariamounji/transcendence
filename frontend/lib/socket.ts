import { io, Socket, type ManagerOptions, type SocketOptions } from 'socket.io-client'
import type { Battle, User } from '@/interfaces'

/**
 * The realtime half of the API. Every event the client sends or receives is
 * declared here, so a change to the gateway contract breaks the build rather
 * than the running app. See docs/API.md for the server side.
 */

export interface CodeResult {
  verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'RATE_LIMITED' | string
  stdout?: string
  stderr?: string
  statusCode?: number
  cause?: string
  error_message?: string
}

export interface PlayersUpdatedEvent {
  battleId: string
  players: User[]
}

export interface BattleEvent {
  battle: Battle
}

export interface PlayerWonEvent {
  battleId: string
  userId: string
}

export interface CodeResultEvent {
  userId: string
  result: CodeResult
}

// A handler that failed answers with this instead of the value it would return.
interface ErrorAck {
  error?: string
}

let socket: Socket | null = null
let connectionPromise: Promise<void> | null = null

const CONNECT_TIMEOUT_MS = 5000

const socketOptions: Partial<ManagerOptions & SocketOptions> = {
  withCredentials: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
}

export function getSocket(): Socket {
  if (!socket) {
    // Without an explicit backend URL socket.io connects to the page origin,
    // which is what the HTTPS reverse proxy serves in production.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    socket = backendUrl ? io(backendUrl, socketOptions) : io(socketOptions)
  }
  return socket
}

export function ensureSocketConnected(): Promise<void> {
  if (connectionPromise) return connectionPromise

  connectionPromise = new Promise<void>((resolve, reject) => {
    const s = getSocket()

    if (s.connected) {
      resolve()
      return
    }

    const timeout = setTimeout(
      () => reject(new Error('Socket connection timeout')),
      CONNECT_TIMEOUT_MS
    )

    s.once('connect', () => {
      clearTimeout(timeout)
      resolve()
    })

    s.once('connect_error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
  })

  // A failed attempt must not stay cached, otherwise one dropped connection
  // would make every later action fail without ever retrying.
  connectionPromise.catch(() => {
    connectionPromise = null
  })

  return connectionPromise
}

/**
 * Emits an event and resolves with the server's acknowledgement. The gateway
 * reports failures as `{ error }` rather than throwing, so those become
 * rejections here and callers can use a plain try/catch.
 */
async function request<T>(event: string, payload: unknown): Promise<T> {
  await ensureSocketConnected()

  return new Promise<T>((resolve, reject) => {
    getSocket().emit(event, payload, (response: T & ErrorAck) => {
      if (response?.error) {
        reject(new Error(response.error))
      } else {
        resolve(response)
      }
    })
  })
}

export function joinBattle(battleId: string, roomCode?: string): Promise<Battle> {
  return request<Battle>('joinBattle', { battleId, roomCode })
}

export function leaveBattle(battleId: string): Promise<Battle> {
  return request<Battle>('leaveBattle', { battleId })
}

export function startBattle(battleId: string): Promise<Battle> {
  return request<Battle>('startBattle', { battleId })
}

export function submitCode(
  battleId: string,
  language: string,
  code: string,
  stdin?: string
): Promise<CodeResult> {
  return request<CodeResult>('submitCode', { battleId, language, code, stdin })
}

// Listeners. Each `on*` has a matching `off*` so effects can clean up.
export function onBattlePlayersUpdated(callback: (data: PlayersUpdatedEvent) => void) {
  getSocket().on('battle:playersUpdated', callback)
}

export function offBattlePlayersUpdated(callback: (data: PlayersUpdatedEvent) => void) {
  getSocket().off('battle:playersUpdated', callback)
}

export function onBattleStarted(callback: (data: BattleEvent) => void) {
  getSocket().on('battle:started', callback)
}

export function offBattleStarted(callback: (data: BattleEvent) => void) {
  getSocket().off('battle:started', callback)
}

export function onBattleEnded(callback: (data: BattleEvent) => void) {
  getSocket().on('battle:ended', callback)
}

export function offBattleEnded(callback: (data: BattleEvent) => void) {
  getSocket().off('battle:ended', callback)
}

export function onBattlePlayerWon(callback: (data: PlayerWonEvent) => void) {
  getSocket().on('battle:playerWon', callback)
}

export function offBattlePlayerWon(callback: (data: PlayerWonEvent) => void) {
  getSocket().off('battle:playerWon', callback)
}

export function onCodeResult(callback: (data: CodeResultEvent) => void) {
  getSocket().on('codeResult', callback)
}

export function offCodeResult(callback: (data: CodeResultEvent) => void) {
  getSocket().off('codeResult', callback)
}
