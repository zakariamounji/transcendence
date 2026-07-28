import { useEffect, useState } from 'react'
import {
  onBattlePlayersUpdated,
  onBattleStarted,
  onBattleEnded,
  onBattlePlayerWon,
  onCodeSubmitted,
  onCodeResult,
  offBattlePlayersUpdated,
  offBattleStarted,
  offBattleEnded,
  offBattlePlayerWon,
  offCodeSubmitted,
  offCodeResult,
  submitCode,
} from '@/lib/socket'
import type { Battle } from '@/interfaces'

export interface BattleState {
  battle: Battle | null
  players: any[]
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | null
  codeSubmissions: Map<string, any>
  codeResults: Map<string, any>
  winner: string | null
}

export function useBattle(battleId: string | null) {
  const [state, setState] = useState<BattleState>({
    battle: null,
    players: [],
    status: null,
    codeSubmissions: new Map(),
    codeResults: new Map(),
    winner: null,
  })

  useEffect(() => {
    if (!battleId) return

    // Handlers for battle events
    const handlePlayersUpdated = (data: { battleId: string; players: any[] }) => {
      if (data.battleId === battleId) {
        console.log('[v0] Players updated:', data.players.length)
        setState((prev) => ({
          ...prev,
          players: data.players,
        }))
      }
    }

    const handleBattleStarted = (data: { battle: Battle }) => {
      if (data.battle.bid === battleId) {
        console.log('[v0] Battle started')
        setState((prev) => ({
          ...prev,
          status: 'RUNNING',
          battle: data.battle,
        }))
      }
    }

    const handleBattleEnded = (data: { battle: Battle }) => {
      if (data.battle.bid === battleId) {
        console.log('[v0] Battle ended')
        setState((prev) => ({
          ...prev,
          status: 'COMPLETED',
          battle: data.battle,
        }))
      }
    }

    const handlePlayerWon = (data: { userId: string }) => {
      console.log('[v0] Player won:', data.userId)
      setState((prev) => ({
        ...prev,
        winner: data.userId,
        status: 'COMPLETED',
      }))
    }

    const handleCodeSubmitted = (data: { userId: string; language: string; code: string }) => {
      console.log('[v0] Code submitted by:', data.userId)
      setState((prev) => {
        const submissions = new Map(prev.codeSubmissions)
        submissions.set(data.userId, { language: data.language, code: data.code, timestamp: Date.now() })
        return { ...prev, codeSubmissions: submissions }
      })
    }

    const handleCodeResult = (data: { userId: string; result: any }) => {
      console.log('[v0] Code result for:', data.userId, data.result.verdict)
      setState((prev) => {
        const results = new Map(prev.codeResults)
        results.set(data.userId, { ...data.result, timestamp: Date.now() })
        return { ...prev, codeResults: results }
      })
    }

    // Subscribe to events
    onBattlePlayersUpdated(handlePlayersUpdated)
    onBattleStarted(handleBattleStarted)
    onBattleEnded(handleBattleEnded)
    onBattlePlayerWon(handlePlayerWon)
    onCodeSubmitted(handleCodeSubmitted)
    onCodeResult(handleCodeResult)

    return () => {
      offBattlePlayersUpdated(handlePlayersUpdated)
      offBattleStarted(handleBattleStarted)
      offBattleEnded(handleBattleEnded)
      offBattlePlayerWon(handlePlayerWon)
      offCodeSubmitted(handleCodeSubmitted)
      offCodeResult(handleCodeResult)
    }
  }, [battleId])

  const submitBattleCode = async (language: string, code: string, stdin?: string) => {
    if (!battleId) throw new Error('No battle ID')
    return submitCode(battleId, language, code, stdin)
  }

  return {
    ...state,
    submitBattleCode,
  }
}
