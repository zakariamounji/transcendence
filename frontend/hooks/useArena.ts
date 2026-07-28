"use client"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import type { Battle, BattlePlayer, Submission } from "@/interfaces"
import { fetchBattle } from "@/lib/battles"
import { emitBattle, getSocket, isConnected, subscribeConnection } from "@/lib/socket"

const JUDGE_MS = 45000
const POLL_MS = 10000

export function useArena({
  initialBattle,
  viewerId
}: {
  initialBattle: Battle
  viewerId: string
}) {

  const battleId = initialBattle.bid

  const [battle, setBattle] = useState<Battle>(initialBattle)
  const [running, setRunning] = useState<boolean>(false)
  const [result, setResult] = useState<Submission | null>(null)

  const [activity, setActivity] = useState<Record<string, string>>({})

  const live = useSyncExternalStore(subscribeConnection, isConnected, () => false)

  const sync = useCallback(async (): Promise<void> => {
    const fresh = await fetchBattle(battleId)
    if (fresh) setBattle(fresh)
  }, [battleId])


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
      void sync()
      setBattle((current) => ({ ...current, status: "COMPLETED", winnerId: data.battle.winnerId }))
    }

    function onActivity(data: { battleId: string, activity: Record<string, string> }): void {
      if (data.battleId !== battleId) return
      setActivity(data.activity)
    }

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

    if (data?.verdict) {
      setResult(data)
      setRunning(false)
    }
  }

  return { battle, running, result, activity, live, submit }
}