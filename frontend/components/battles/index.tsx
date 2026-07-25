"use client"
import type { Battle, User } from "@/interfaces"
import { useState } from "react"
import CurrentBattle from "./currentBattle"
import AvailableBattles from "./availableBattles"
import BattleArena from "./battleArena"

export default function Battles({
  battles,
  currentBattle,
  currentUser
}: {
  battles: Battle[]
  currentBattle: Battle | null
  currentUser: User
}): React.JSX.Element {
  // The server props stay authoritative. The only local state is which battle
  // the player has just finished, so the arena closes without waiting for a refresh.
  const [dismissedBattleId, setDismissedBattleId] = useState<string | null>(null)

  const userBattle =
    currentBattle && currentBattle.bid !== dismissedBattleId ? currentBattle : null
  const showArena = userBattle?.status === 'RUNNING'

  if (showArena && userBattle) {
    return (
      <div className="mt-4">
        <BattleArena
          battle={userBattle}
          currentUser={currentUser}
          onBattleEnd={() => setDismissedBattleId(userBattle.bid)}
        />
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-8">
      {/* Current Battle Section */}
      {userBattle && (
        <div>
          <p className="text-lg font-bold mb-4">Your Battle</p>
          <CurrentBattle battle={userBattle} currentUser={currentUser} />
        </div>
      )}

      {/* Available Battles Section */}
      <div>
        <p className="text-lg font-bold mb-4">Available Battles</p>
        <AvailableBattles battles={battles} />
      </div>
    </div>
  )
}
