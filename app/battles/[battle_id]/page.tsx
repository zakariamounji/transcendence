import { redirect } from "next/navigation"
import type { Battle } from "@/interfaces"
import { getProfile } from "@/lib/profile"
import { serverFetch } from "@/lib/server-fetch"
import Arena from "@/components/battles/arena"

async function readBattle(battleId: string): Promise<Battle | null> {
  try {
    const response = await serverFetch(`/battles/${encodeURIComponent(battleId)}`)

    if (!response.ok) return null

    const payload = await response.json()
    return payload?.data ?? null
  } catch {
    return null
  }
}

export default async function BattlePage({
  params
}: {
  params: Promise<{ battle_id: string }>
}): Promise<React.JSX.Element> {

  const { battle_id } = await params

  const [profile, battle] = await Promise.all([
    getProfile(),
    readBattle(battle_id)
  ])

  // a battle that does not exist, and one you are not playing, are the same door
  if (!battle || !battle.players.some((player) => player.id === profile.id)) {
    redirect("/")
  }

  return <Arena initialBattle={battle} viewerId={profile.id} />
}
