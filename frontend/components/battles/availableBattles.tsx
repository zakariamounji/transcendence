"use client"
import type { Battle } from "@/interfaces"
import { useState, useMemo, useEffect } from "react"
import BattleFilters from "./battleFilters"
import BattleCard from "./battleCard"
import { onBattlePlayersUpdated, offBattlePlayersUpdated } from "@/lib/socket"

export default function AvailableBattles({
  battles: initialBattles
}: {
  battles: Battle[]
}): React.JSX.Element {
  const [battles, setBattles] = useState(initialBattles)
  const [selectedModes, setSelectedModes] = useState<string[]>(["SOLO", "DUO", "GROUP"])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["C", "CPP"])

  useEffect(() => {
    // Listen for real-time battle updates
    const handlePlayersUpdated = (data: { battleId: string; players: any[] }) => {
      console.log("[v0] Battle players updated:", data.battleId)
      setBattles((prev) =>
        prev.map((b) =>
          b.bid === data.battleId ? { ...b, players: data.players } : b
        )
      )
    }

    onBattlePlayersUpdated(handlePlayersUpdated)

    return () => {
      offBattlePlayersUpdated(handlePlayersUpdated)
    }
  }, [])

  const filteredBattles = useMemo(() => {
    return battles.filter(
      (battle) =>
        selectedModes.includes(battle.mode) &&
        selectedLanguages.includes(battle.challenge.language)
    )
  }, [battles, selectedModes, selectedLanguages])

  return (
    <div className="space-y-4">
      <BattleFilters
          selectedModes={selectedModes}
  selectedLanguages={selectedLanguages}
  onModeChange={mode => {
    setSelectedModes(prev => {
      if (prev.includes(mode)) {
        return prev.filter(m => m !== mode)
      } else {
        return [...prev, mode]
      }
    })
  }}
  onLanguageChange={language => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language)
      } else {
        return [...prev, language]
      }
    })
  }}
      />

      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredBattles.length} of {battles.length} battles
      </div>

      {filteredBattles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No battles found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBattles.map((battle) => (
            <BattleCard key={battle.bid} battle={battle} />
          ))}
        </div>
      )}
    </div>
  )
}
