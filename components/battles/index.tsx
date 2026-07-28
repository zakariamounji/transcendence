import { getProfile } from "@/lib/profile"
import { getBattles, getCurrentBattle } from "@/lib/battles-server"
import BattleBoard from "@/components/battles/board"

export default async function Battles(): Promise<React.JSX.Element> {

  const [profile, battles, current] = await Promise.all([
    getProfile(),
    getBattles(),
    getCurrentBattle()
  ])

  // the board takes it from here, the socket and a short poll keep it current
  return (
    <BattleBoard
      initialBattles={battles}
      initialCurrent={current}
      viewerId={profile.id}
    />
  )
}