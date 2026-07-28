import { getProfile } from "@/lib/profile"
import { getPlayers } from "@/lib/ranking"
import RankingBoard from "@/components/ranking/board"

export default async function Ranking(): Promise<React.JSX.Element> {

  const [profile, profiles] = await Promise.all([getProfile(), getPlayers()])

  // searching and paging both happen in the browser, the table is small enough for it
  return <RankingBoard profiles={profiles} viewerId={profile.id} viewerRole={profile.role} />
}
