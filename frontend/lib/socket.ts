import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let connectionPromise: Promise<void> | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log("[v0] Socket connected:", socket?.id)
    })

    socket.on('connect_error', (error) => {
      console.error("[v0] Socket connection error:", error)
    })

    socket.on('disconnect', (reason) => {
      console.log("[v0] Socket disconnected:", reason)
    })

    // Debug: Log all incoming events
    socket.onAny((eventName: string, ...args: any[]) => {
      if (!eventName.startsWith('connect') && !eventName.startsWith('disconnect')) {
        console.log("[v0] Socket event received:", eventName, args)
      }
    })
  }
  return socket
}

export function ensureSocketConnected(): Promise<void> {
  if (connectionPromise) return connectionPromise

  connectionPromise = new Promise((resolve, reject) => {
    const s = getSocket()
    
    if (s.connected) {
      console.log("[v0] Socket already connected")
      resolve()
      return
    }

    const timeout = setTimeout(() => {
      console.error("[v0] Socket connection timeout")
      reject(new Error("Socket connection timeout"))
    }, 5000)

    s.once('connect', () => {
      clearTimeout(timeout)
      console.log("[v0] Socket connected successfully")
      resolve()
    })

    s.once('connect_error', (error) => {
      clearTimeout(timeout)
      console.error("[v0] Socket failed to connect:", error)
      reject(error)
    })
  })

  return connectionPromise
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    connectionPromise = null
  }
}

// Battle action emitters
export function joinBattle(battleId: string, roomCode?: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Emitting joinBattle:", { battleId, roomCode })
      
      getSocket().emit('joinBattle', 
        { battleId, roomCode }, 
        (response: any) => {
          console.log("[v0] joinBattle response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] joinBattle error:", error)
      reject(error)
    }
  })
}

export function leaveBattle(battleId: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Emitting leaveBattle:", { battleId })
      
      getSocket().emit('leaveBattle',
        { battleId },
        (response: any) => {
          console.log("[v0] leaveBattle response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] leaveBattle error:", error)
      reject(error)
    }
  })
}

export function startBattle(battleId: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Emitting startBattle:", { battleId })
      
      getSocket().emit('startBattle',
        { battleId },
        (response: any) => {
          console.log("[v0] startBattle response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] startBattle error:", error)
      reject(error)
    }
  })
}

// Real-time event listeners - Battle events
export function onBattlePlayersUpdated(callback: (data: { battleId: string; players: any[] }) => void) {
  getSocket().on('battle:playersUpdated', callback)
}

export function onBattleStarted(callback: (data: { battle: any }) => void) {
  getSocket().on('battle:started', callback)
}

export function onBattleEnded(callback: (data: { battle: any }) => void) {
  getSocket().on('battle:ended', callback)
}

export function onBattlePlayerWon(callback: (data: { userId: string }) => void) {
  getSocket().on('battle:playerWon', callback)
}

// Code submission events
export function onCodeSubmitted(callback: (data: { userId: string; language: string; code: string }) => void) {
  getSocket().on('codeSubmitted', callback)
}

export function onCodeResult(callback: (data: { userId: string; result: any }) => void) {
  getSocket().on('codeResult', callback)
}

// Remove listeners
export function offBattlePlayersUpdated(callback: (data: { battleId: string; players: any[] }) => void) {
  getSocket().off('battle:playersUpdated', callback)
}

export function offBattleStarted(callback: (data: { battle: any }) => void) {
  getSocket().off('battle:started', callback)
}

export function offBattleEnded(callback: (data: { battle: any }) => void) {
  getSocket().off('battle:ended', callback)
}

export function offBattlePlayerWon(callback: (data: { userId: string }) => void) {
  getSocket().off('battle:playerWon', callback)
}

export function offCodeSubmitted(callback: (data: { userId: string; language: string; code: string }) => void) {
  getSocket().off('codeSubmitted', callback)
}

export function offCodeResult(callback: (data: { userId: string; result: any }) => void) {
  getSocket().off('codeResult', callback)
}

// Get battle players (Request-Response)
export function getBattlePlayers(battleId: string): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Requesting battle players:", battleId)
      
      getSocket().emit('getBattlePlayers',
        { battleId },
        (response: any) => {
          console.log("[v0] getBattlePlayers response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] getBattlePlayers error:", error)
      reject(error)
    }
  })
}

// Submit code for execution
export function submitCode(battleId: string, language: string, code: string, stdin?: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Submitting code for battle:", battleId)
      
      getSocket().emit('submitCode',
        { battleId, language, code, stdin },
        (response: any) => {
          console.log("[v0] submitCode response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] submitCode error:", error)
      reject(error)
    }
  })
}

// End battle
export function endBattle(battleId: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureSocketConnected()
      console.log("[v0] Emitting endBattle:", battleId)
      
      getSocket().emit('endBattle',
        { battleId },
        (response: any) => {
          console.log("[v0] endBattle response:", response)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      console.error("[v0] endBattle error:", error)
      reject(error)
    }
  })
}
