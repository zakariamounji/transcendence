"use client"
import type { Battle, User } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Users, Clock, Zap, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { leaveBattle, startBattle, onBattlePlayersUpdated, onBattleStarted, onBattlePlayerWon, offBattlePlayersUpdated, offBattleStarted, offBattlePlayerWon } from "@/lib/socket"
import type { PlayersUpdatedEvent, BattleEvent } from "@/lib/socket"

export default function CurrentBattle({
  battle,
  currentUser
}: {
  battle: Battle
  currentUser: User
}): React.JSX.Element {
  const [isLeavingBattle, setIsLeavingBattle] = useState(false)
  const [isStartingBattle, setIsStartingBattle] = useState(false)
  const [currentBattle, setCurrentBattle] = useState(battle)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    // Listen for real-time updates
    const handlePlayersUpdated = (data: PlayersUpdatedEvent) => {
      if (data.battleId === battle.bid) {
        setCurrentBattle((prev) => ({
          ...prev,
          players: data.players
        }))
      }
    }

    const handleBattleStarted = (data: BattleEvent) => {
      if (data.battle.bid === battle.bid) {
        setCurrentBattle(data.battle)
      }
    }

    const handlePlayerWon = (data: { battleId: string; userId: string }) => {
      if (data.battleId === battle.bid) {
        setCurrentBattle((prev) => ({
          ...prev,
          status: "COMPLETED",
          winnerId: data.userId
        }))
      }
    }

    onBattlePlayersUpdated(handlePlayersUpdated)
    onBattleStarted(handleBattleStarted)
    onBattlePlayerWon(handlePlayerWon)

    return () => {
      offBattlePlayersUpdated(handlePlayersUpdated)
      offBattleStarted(handleBattleStarted)
      offBattlePlayerWon(handlePlayerWon)
    }
  }, [battle.bid])

  const handleLeaveBattle = async () => {
    setIsLeavingBattle(true)
    setActionError("")
    try {
      await leaveBattle(battle.bid)
    } catch (error) {
      setActionError((error as Error).message || "Failed to leave battle")
    } finally {
      setIsLeavingBattle(false)
    }
  }

  const handleStartBattle = async () => {
    setIsStartingBattle(true)
    setActionError("")
    try {
      await startBattle(battle.bid)
    } catch (error) {
      setActionError((error as Error).message || "Failed to start battle")
    } finally {
      setIsStartingBattle(false)
    }
  }

  const isCreator = currentBattle.creator.id === currentUser.id
  const isLobbyFull = currentBattle.players.length === currentBattle.maxPlayers

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-blue-500/20 text-blue-400"
      case "RUNNING":
        return "bg-green-500/20 text-green-400"
      case "COMPLETED":
        return "bg-purple-500/20 text-purple-400"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "SOLO":
        return "bg-amber-500/20 text-amber-400"
      case "DUO":
        return "bg-cyan-500/20 text-cyan-400"
      case "GROUP":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="bg-card border border-accent rounded-lg p-6 hover:border-primary/50 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Battle Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              {currentBattle.challenge.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentBattle.challenge.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(currentBattle.status)}`}>
              {currentBattle.status}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getModeColor(currentBattle.mode)}`}>
              {currentBattle.mode}
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400">
              {currentBattle.challenge.language}
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
              {currentBattle.challenge.expReward} XP
            </div>
          </div>

          {/* Battle Stats Grid */}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-border">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5" />
                Players
              </div>
              <div className="font-semibold text-card-foreground">
                {currentBattle.players.length} / {currentBattle.maxPlayers}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                Duration
              </div>
              <div className="font-semibold text-card-foreground">
                {currentBattle.challenge.timeLimitMin} m
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Players & Actions */}
        <div className="space-y-4">
          {/* Players List */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Participants</h3>
            <div className="space-y-2">
              {currentBattle.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    {player.image && (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">Lvl {player.level}</p>
                    </div>
                  </div>
                  {player.status && (
                    <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                      {player.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {actionError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{actionError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {/* only the creator may start the battle, the backend enforces it too */}
            {currentBattle.status === "WAITING" && isCreator && (
              <Button
                className="flex-1"
                onClick={handleStartBattle}
                disabled={isStartingBattle || !isLobbyFull}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isStartingBattle ? "Starting..." : "Start Battle"}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleLeaveBattle}
              disabled={isLeavingBattle}
            >
              Leave Battle
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
