"use client"
import type { Battle, User } from "@/interfaces"
import { useEffect, useState } from "react"
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
  const [allBattles, setAllBattles] = useState<Battle[]>(battles)
  const [userBattle, setUserBattle] = useState<Battle | null>(currentBattle)
  const [showArena, setShowArena] = useState(false)

  useEffect(() => {
    setAllBattles(battles)
    setUserBattle(currentBattle)
    // If battle is RUNNING and user is in it, show arena
    if (currentBattle && currentBattle.status === 'RUNNING') {
      setShowArena(true)
    } else {
      setShowArena(false)
    }
  }, [currentBattle])

  // Show battle arena if battle is running
  if (showArena && userBattle) {
    return (
      <div className="mt-4">
        <BattleArena
          battle={userBattle}
          currentUser={currentUser}
          onBattleEnd={() => {
            setShowArena(false)
            setUserBattle(null)
          }}
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
          <CurrentBattle battle={userBattle} />
        </div>
      )}

      {/* Available Battles Section */}
      <div>
        <p className="text-lg font-bold mb-4">Available Battles</p>
        <AvailableBattles battles={allBattles} />
      </div>
    </div>
  )
}
