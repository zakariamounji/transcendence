import type { Battle, Challenge, User } from "@/interfaces"
import { myfetch } from "@/lib/myfectch"
import Profile from "@/components/profile"
import { redirect } from "next/navigation"
import Challenges from "@/components/challenges"
import Ranking from "@/components/ranking"
import Battels from "@/components/battles"

export default async function Home(): Promise<React.JSX.Element> {

  const [allRes, myRes, userData, rankingData, battlesData, currentBattleData] = await Promise.all([
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`),
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges/me`),
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`),
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/all`),
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/battles/all`),
    myfetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/battles/current`),
  ])

  if (!allRes.ok || !myRes.ok || !userData.ok || !rankingData.ok || !battlesData.ok || !currentBattleData.ok) {
    redirect("/auth")
  }

  const [allData, myData, userDataJson, rankingDataJson, battlesDataJson, currentBattleDataJson]: [
    { data: Challenge[] },
    { data: Challenge[] },
    { data: User },
    { data: User[] },
    { data: Battle[] },
    { data: Battle | null }
  ] = await Promise.all([
    allRes.json(),
    myRes.json(),
    userData.json(),
    rankingData.json(),
    battlesData.json(),
    currentBattleData.json()
  ])

  const user = userDataJson.data
  const ranking = rankingDataJson.data

  const allChallenges = allData.data.filter((challenge) => user.role === "ADMIN" || challenge.isPublished)
  const myChallenges = myData.data

  const battles = battlesDataJson.data
  const currentBattle = currentBattleDataJson.data

  return (
    <div className="flex justify-center items-center w-full px-8 max-md:px-4 py-8">
      <div className="max-w-370 w-full">

        <Profile user={user} myRank={ranking.findIndex((u) => u.id === user.id) + 1}/>

        <Challenges
          isAdmin={user.role === "ADMIN"}
          allChallenges={allChallenges}
          myChallenges={myChallenges}
          createdById={user.id}
        />

        <Ranking ranking={ranking} myId={user.id}/>

        <Battels
          battles={battles}
          currentBattle={currentBattle}
          currentUser={user}
        />

      </div>
    </div>
  )
}
