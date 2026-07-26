"use client"
import type { Battle } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Users, Clock, Zap, Code } from "lucide-react"
import { useState, useEffect } from "react"
import { leaveBattle, startBattle, onBattlePlayersUpdated, onBattleStarted, onBattlePlayerWon, offBattlePlayersUpdated, offBattleStarted, offBattlePlayerWon } from "@/lib/socket"

export default function CurrentBattle({ battle }: { battle: Battle }): React.JSX.Element {
  const [isLeavingBattle, setIsLeavingBattle] = useState(false)
  const [isStartingBattle, setIsStartingBattle] = useState(false)
  const [currentBattle, setCurrentBattle] = useState(battle)

  useEffect(() => {
    // Listen for real-time updates
    const handlePlayersUpdated = (data: { battleId: string; players: any[] }) => {
      console.log("[v0] Battle players updated:", data)
      if (data.battleId === battle.bid) {
        setCurrentBattle((prev) => ({
          ...prev,
          players: data.players
        }))
      }
    }

    const handleBattleStarted = (data: { battle: any }) => {
      console.log("[v0] Battle started:", data)
      if (data.battle.bid === battle.bid) {
        setCurrentBattle(data.battle)
      }
    }

    const handlePlayerWon = (data: { userId: string }) => {
      console.log("[v0] Player won:", data)
      setCurrentBattle((prev) => ({
        ...prev,
        status: "COMPLETED"
      }))
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
    try {
      console.log("[v0] Starting leave battle for:", battle.bid)
      const response = await leaveBattle(battle.bid)
      console.log("[v0] Left battle successfully:", response)
      alert("You left the battle!")
    } catch (error) {
      console.error("[v0] Error leaving battle:", error)
      const errorMsg = (error as Error).message || "Failed to leave battle"
      alert(errorMsg)
    } finally {
      setIsLeavingBattle(false)
    }
  }

  const handleStartBattle = async () => {
    setIsStartingBattle(true)
    try {
      console.log("[v0] Starting battle for:", battle.bid)
      const response = await startBattle(battle.bid)
      console.log("[v0] Battle started successfully:", response)
      alert("Battle started!")
    } catch (error) {
      console.error("[v0] Error starting battle:", error)
      const errorMsg = (error as Error).message || "Failed to start battle"
      alert(errorMsg)
    } finally {
      setIsStartingBattle(false)
    }
  }

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
                X min
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {currentBattle.status === "WAITING" && currentBattle.players.length === currentBattle.maxPlayers && (
              <Button
                className="flex-1"
                onClick={handleStartBattle}
                disabled={isStartingBattle}
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
