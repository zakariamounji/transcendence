"use client"
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import type { Battle, BattlePlayer } from "@/interfaces"
import { fetchBattles, fetchCurrentBattle } from "@/lib/battles"
import { emitBattle, getSocket, isConnected, subscribeBattleChange, subscribeConnection } from "@/lib/socket"

type Action = "join" | "leave" | "start" | "cancel"

const EVENT_BY_ACTION: Record<"join" | "leave" | "start" | "cancel", string> = {
  join: "joinBattle",
  leave: "leaveBattle",
  start: "startBattle",
  cancel: "cancelBattle"
}

const POLL_MS = 15000

export function useBattles({
  initialBattles,
  initialCurrent,
  viewerId
}: {
  initialBattles: Battle[]
  initialCurrent: Battle | null
  viewerId: string
}) {

  const router = useRouter()

  const [battles, setBattles] = useState<Battle[]>(initialBattles)
  const [current, setCurrent] = useState<Battle | null>(initialCurrent)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const live = useSyncExternalStore(subscribeConnection, isConnected, () => false)

  const readId = useRef<number>(0)

  const sync = useCallback(async (): Promise<void> => {
    readId.current += 1
    const id = readId.current

    const [all, mine] = await Promise.all([fetchBattles(), fetchCurrentBattle()])

    if (id !== readId.current) return

    setBattles(all)
    setCurrent(mine)
  }, [])

  // the create dialog lives over in the challenge cards and has no way down to here
  useEffect(() => subscribeBattleChange(() => { void sync() }), [sync])

  useEffect(() => {
    const socket = getSocket()

    function patch(battleId: string, change: Partial<Battle>): void {
      setBattles((list) => list.map((battle) => (
        battle.bid === battleId ? { ...battle, ...change } : battle
      )))
      setCurrent((mine) => (mine && mine.bid === battleId ? { ...mine, ...change } : mine))
    }

    function onConnect(): void {
      void sync()
    }

    function onLobbyChanged(): void {
      void sync()
    }

    function onPlayersUpdated(data: { battleId: string, players?: BattlePlayer[] }): void {
      if (!data.players) {
        void sync()
        return
      }
      patch(data.battleId, { players: data.players })
    }

    function onStarted(data: { battle: Battle }): void {
      patch(data.battle.bid, { status: "RUNNING", startedAt: data.battle.startedAt })
      router.refresh()
    }

    function onEnded(data: { battle: Battle }): void {
      patch(data.battle.bid, { status: "COMPLETED", winnerId: data.battle.winnerId })
      void sync()
      router.refresh()
    }

    function onPlayerWon(data: { userId: string }): void {
      setNotice(data.userId === viewerId ? "You solved it first. The battle is yours." : "Another player solved it first.")
    }

    socket.on("connect", onConnect)
    socket.on("lobby:changed", onLobbyChanged)
    socket.on("battle:playersUpdated", onPlayersUpdated)
    socket.on("battle:started", onStarted)
    socket.on("battle:ended", onEnded)
    socket.on("battle:playerWon", onPlayerWon)

    return () => {
      socket.off("connect", onConnect)
      socket.off("lobby:changed", onLobbyChanged)
      socket.off("battle:playersUpdated", onPlayersUpdated)
      socket.off("battle:started", onStarted)
      socket.off("battle:ended", onEnded)
      socket.off("battle:playerWon", onPlayerWon)
    }
  }, [sync, router, viewerId])

  useEffect(() => {
    function readWhenVisible(): void {
      if (document.visibilityState === "visible") void sync()
    }

    const timer = setInterval(readWhenVisible, POLL_MS)
    document.addEventListener("visibilitychange", readWhenVisible)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", readWhenVisible)
    }
  }, [sync])

  async function run(action: Action, battleId: string, roomCode?: string): Promise<boolean> {
    if (pending) return false

    setPending(`${action}:${battleId}`)
    setError(null)
    setNotice(null)

    const s = (await emitBattle(EVENT_BY_ACTION[action], action === "join" ? { battleId, roomCode } : { battleId }))
    const message = s?.error || (typeof s?.message === "string" ? s?.message : Array.isArray(s?.message) ? s?.message.join(" ") : null)

    setPending(null)

    if (message) {
      setError(message)
      return false
    }

    await sync()
    router.refresh()
    return true
  }

  return {
    battles,
    current,
    live,
    pending,
    error,
    notice,
    join: (battleId: string, roomCode?: string) => run("join", battleId, roomCode),
    leave: (battleId: string) => run("leave", battleId),
    start: (battleId: string) => run("start", battleId),
    cancel: (battleId: string) => run("cancel", battleId)
  }
}