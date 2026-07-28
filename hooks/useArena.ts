"use client"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import type { Battle, BattlePlayer, Submission } from "@/interfaces"
import { fetchBattle } from "@/lib/battles"
import { emitBattle, getSocket, isConnected, subscribeConnection } from "@/lib/socket"

// compiling and running takes as long as it takes, and the ack only comes back after
const JUDGE_MS = 45000

// the room carries everything, this only catches an event that never arrived
const POLL_MS = 10000

export function useArena({
  initialBattle,
  viewerId
}: {
  initialBattle: Battle
  viewerId: string
}) {

  const router = useRouter()
  const battleId = initialBattle.bid

  const [battle, setBattle] = useState<Battle>(initialBattle)
  const [running, setRunning] = useState<boolean>(false)
  const [result, setResult] = useState<Submission | null>(null)

  // what each player is doing, by id, owned by the gateway and shown next to the name
  const [activity, setActivity] = useState<Record<string, string>>({})

  const live = useSyncExternalStore(subscribeConnection, isConnected, () => false)

  const sync = useCallback(async (): Promise<void> => {
    const fresh = await fetchBattle(battleId)
    if (fresh) setBattle(fresh)
  }, [battleId])

  /**
   * The room is where every battle event is sent, and a socket that just connected is
   * in no room at all. The gateway turns this down for anyone who is not a player,
   * which is the same door the page itself was guarded with.
   */
  useEffect(() => {
    if (!live) return

    void emitBattle<Battle>("watchBattle", { battleId }).then(({ data, error }) => {
      if (error?.includes("not in this battle")) {
        router.replace("/")
        return
      }
      if (data) setBattle(data)
    })
  }, [live, battleId, router])

  useEffect(() => {
    const socket = getSocket()

    function onPlayersUpdated(data: { battleId: string, players?: BattlePlayer[] }): void {
      if (data.battleId !== battleId || !data.players) return
      setBattle((current) => ({ ...current, players: data.players as BattlePlayer[] }))
    }

    function onStarted(data: { battle: Battle }): void {
      if (data.battle.bid !== battleId) return
      setBattle((current) => ({ ...current, status: "RUNNING", startedAt: data.battle.startedAt }))
    }

    function onEnded(data: { battle: Battle }): void {
      if (data.battle.bid !== battleId) return
      setRunning(false)
      // the payload has no players on it, and the winner is worth reading properly
      void sync()
      setBattle((current) => ({ ...current, status: "COMPLETED", winnerId: data.battle.winnerId }))
    }

    // the gateway keeps this for the whole battle and sends the lot every time it
    // moves, so there is nothing here to miss and nothing to accumulate
    function onActivity(data: { battleId: string, activity: Record<string, string> }): void {
      if (data.battleId !== battleId) return
      setActivity(data.activity)
    }

    // only your own result has a body worth reading, everyone else is a word
    function onCodeResult(data: { userId: string, result: Submission }): void {
      if (data.userId !== viewerId) return

      setResult(data.result)
      setRunning(false)
    }

    socket.on("battle:playersUpdated", onPlayersUpdated)
    socket.on("battle:started", onStarted)
    socket.on("battle:ended", onEnded)
    socket.on("battle:activity", onActivity)
    socket.on("codeResult", onCodeResult)

    return () => {
      socket.off("battle:playersUpdated", onPlayersUpdated)
      socket.off("battle:started", onStarted)
      socket.off("battle:ended", onEnded)
      socket.off("battle:activity", onActivity)
      socket.off("codeResult", onCodeResult)
    }
  }, [battleId, viewerId, sync])

  // a finished battle has nothing left to say
  const settled = battle.status === "COMPLETED" || battle.status === "CANCELLED"

  useEffect(() => {
    if (settled) return

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void sync()
    }, POLL_MS)

    return () => clearInterval(timer)
  }, [settled, sync])

  async function submit(code: string): Promise<void> {
    if (running || battle.status !== "RUNNING") return

    if (!code.trim()) {
      setResult({ verdict: "EMPTY", stderr: "There is nothing to run yet." })
      return
    }

    setRunning(true)
    setResult(null)

    const { data, error } = await emitBattle<Submission>("submitCode", {
      battleId,
      language: (battle.challenge?.language ?? "C").toLowerCase(),
      code
    }, JUDGE_MS)

    if (error) {
      setResult({ verdict: "ERROR", stderr: error })
      setRunning(false)
      return
    }

    // the ack only carries a verdict when the judge never ran, a real one comes back
    // on codeResult, and a winning one ends the battle instead
    if (data?.verdict) {
      setResult(data)
      setRunning(false)
    }
  }

  return { battle, running, result, activity, live, submit }
}
