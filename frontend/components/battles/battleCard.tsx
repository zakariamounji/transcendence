"use client"
import type { Battle } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Users, Clock, Trophy } from "lucide-react"
import { useState } from "react"
import { joinBattle } from "@/lib/socket"
import PasswordPrompt from "./passwordPrompt"

export default function BattleCard({ battle }: { battle: Battle }): React.JSX.Element {
  const [isJoining, setIsJoining] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleJoinBattle = async () => {
    // If private, show password prompt first
    if (battle.visibility === 'PRIVATE') {
      setShowPasswordPrompt(true)
      return
    }

    // Otherwise join directly
    await submitJoinBattle()
  }

  const handlePasswordSubmit = async (password: string) => {
    setIsJoining(true)
    setPasswordError('')

    try {
      // Submit with the provided password/room code
      console.log("[v0] Starting join battle with password for:", battle.bid)
      const response = await joinBattle(battle.bid, password)
      console.log("[v0] Battle joined successfully:", response)
      setShowPasswordPrompt(false)
    } catch (error) {
      console.error("[v0] Error joining battle:", error)
      const errorMsg = (error as Error).message || "Failed to join battle"
      setPasswordError(errorMsg)
    } finally {
      setIsJoining(false)
    }
  }

  const submitJoinBattle = async () => {
    setIsJoining(true)
    try {
      console.log("[v0] Starting join battle for:", battle.bid)
      const response = await joinBattle(battle.bid)
      console.log("[v0] Battle joined successfully:", response)
    } catch (error) {
      console.error("[v0] Error joining battle:", error)
      const errorMsg = (error as Error).message || "Failed to join battle"
      alert(errorMsg)
    } finally {
      setIsJoining(false)
    }
  }

  if (showPasswordPrompt) {
    return (
      <PasswordPrompt
        battleId={battle.bid}
        onSubmit={handlePasswordSubmit}
        isLoading={isJoining}
        error={passwordError}
      />
    )
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-500/20 text-green-400"
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400"
      case "HARD":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const isFull = battle.players.length >= battle.maxPlayers

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent transition-all hover:shadow-lg">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-semibold text-card-foreground line-clamp-1">
          {battle.challenge.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Created by <span className="font-medium">{battle.creator.name || "Anonymous"}</span>
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getModeColor(battle.mode)}`}>
          {battle.mode === "SOLO" && "🏁"}
          {battle.mode === "DUO" && "👥"}
          {battle.mode === "GROUP" && "🎯"} {battle.mode}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(battle.challenge.difficulty)}`}>
          {battle.challenge.difficulty}
        </span>
        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400">
          {battle.challenge.language}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="w-3 h-3" />
            Players
          </div>
          <div className="text-sm font-semibold text-card-foreground">
            {battle.players.length}/{battle.maxPlayers}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            Duration
          </div>
          <div className="text-sm font-semibold text-card-foreground">
            {battle.challenge.timeLimitMin} m
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Trophy className="w-3 h-3" />
            Reward
          </div>
          <div className="text-sm font-semibold text-green-400">
            {battle.challenge.expReward} XP
          </div>
        </div>
      </div>

      {/* Players Preview */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Players in battle:</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {battle.players.slice(0, 3).map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-1 px-2 py-1 rounded bg-background text-xs text-card-foreground"
              title={player.name || player.name}
            >
              {player.image && (
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="truncate max-w-[80px]">{player.name || player.name}</span>
            </div>
          ))}
          {battle.players.length > 3 && (
            <div className="text-xs text-muted-foreground px-2 py-1">
              +{battle.players.length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Join Button */}
      <Button
        className="w-full"
        onClick={handleJoinBattle}
        disabled={isJoining || isFull}
        variant={isFull ? "outline" : "default"}
      >
        {isJoining ? "Joining..." : isFull ? "Battle Full" : "Join Battle"}
      </Button>
    </div>
  )
}
