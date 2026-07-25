'use client'
import { useState, useEffect } from 'react'
import type { Battle, User } from '@/interfaces'
import { submitCode, joinBattle, onCodeResult, offCodeResult, onBattlePlayerWon, offBattlePlayerWon, onBattleEnded, offBattleEnded } from '@/lib/socket'
import type { CodeResult, CodeResultEvent } from '@/lib/socket'
import CodeEditor from './codeEditor'
import PlayerStatus from './playerStatus'
import PasswordPrompt from './passwordPrompt'
import { AlertCircle, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BattleArenaProps {
  battle: Battle
  currentUser: User
  onBattleEnd?: () => void
}

export default function BattleArena({
  battle: initialBattle,
  currentUser,
  onBattleEnd
}: BattleArenaProps): React.JSX.Element {
  const [battle, setBattle] = useState(initialBattle)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codeResults, setCodeResults] = useState<Record<string, CodeResult>>({})
  const [winner, setWinner] = useState<string | null>(null)
  // a private battle can only be entered once the server accepted the room code
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(
    initialBattle.visibility === 'PRIVATE' &&
    !initialBattle.players.some((player) => player.id === currentUser.id)
  )
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    // Listen for code results
    const handleCodeResult = (data: CodeResultEvent) => {
      setCodeResults((prev) => ({
        ...prev,
        [data.userId]: data.result
      }))
    }

    // Listen for battle winner
    const handlePlayerWon = (data: { battleId: string; userId: string }) => {
      if (data.battleId === initialBattle.bid) {
        setWinner(data.userId)
      }
    }

    // Listen for battle end
    const handleBattleEnded = (data: { battle: Battle }) => {
      if (data.battle.bid !== initialBattle.bid) return
      setBattle(data.battle)
      if (data.battle.winnerId) {
        setWinner(data.battle.winnerId)
      }
    }

    onCodeResult(handleCodeResult)
    onBattlePlayerWon(handlePlayerWon)
    onBattleEnded(handleBattleEnded)

    return () => {
      offCodeResult(handleCodeResult)
      offBattlePlayerWon(handlePlayerWon)
      offBattleEnded(handleBattleEnded)
    }
  }, [initialBattle.bid])

  const handlePasswordSubmit = async (roomCode: string) => {
    setIsPasswordLoading(true)
    setPasswordError('')

    try {
      // only the server knows the room code, it rejects the join when it is wrong
      const joined = await joinBattle(battle.bid, roomCode)
      setBattle(joined)
      setShowPasswordPrompt(false)
    } catch (error) {
      setPasswordError((error as Error).message || 'Invalid battle code')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleCodeSubmit = async (code: string, stdin: string) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const result = await submitCode(battle.bid, battle.challenge.language, code, stdin)

      setCodeResults((prev) => ({
        ...prev,
        [currentUser.id]: result
      }))
    } catch (error) {
      setSubmitError((error as Error).message || 'Failed to submit code')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showPasswordPrompt) {
    return (
      <PasswordPrompt
        onSubmit={handlePasswordSubmit}
        isLoading={isPasswordLoading}
        error={passwordError}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">{battle.challenge.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{battle.challenge.description}</p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              battle.status === 'RUNNING'
                ? 'bg-green-500/20 text-green-400'
                : battle.status === 'COMPLETED'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 text-gray-400'
            }`}>
              {battle.status}
            </div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Difficulty</p>
            <p className="text-sm font-semibold text-card-foreground capitalize">{battle.challenge.difficulty}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time Limit</p>
            <p className="text-sm font-semibold text-card-foreground">{battle.challenge.timeLimitMin} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reward</p>
            <p className="text-sm font-semibold text-card-foreground">{battle.challenge.expReward} XP</p>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {winner && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <Trophy className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-400">Battle Completed!</p>
            <p className="text-sm text-green-400/80">
              {winner === currentUser.id ? 'You won the battle!' : `${battle.players.find(p => p.id === winner)?.name} won!`}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Code Editor - Left */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {submitError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{submitError}</p>
            </div>
          )}
          <CodeEditor
            language={battle.challenge.language}
            onSubmit={handleCodeSubmit}
            isSubmitting={isSubmitting}
            disabled={battle.status !== 'RUNNING' || !!winner}
          />
        </div>

        {/* Player Status - Right */}
        <div className="flex flex-col gap-4 min-h-0">
          <PlayerStatus
            players={battle.players}
            currentUserId={currentUser.id}
            winnerId={winner}
            codeResults={codeResults}
          />

          {battle.status === 'COMPLETED' && (
            <Button
              onClick={onBattleEnd}
              variant="outline"
              className="w-full"
            >
              Back to Battles
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
