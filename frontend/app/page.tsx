import type { Battle, Challenge, User } from "@/interfaces"
import { serverFetch } from "@/lib/fetcher"
import Profile from "@/components/profile"
import { redirect } from "next/navigation"
import Challenges from "@/components/challenges"
import Ranking from "@/components/ranking"
import Battles from "@/components/battles"

export default async function Home(): Promise<React.JSX.Element> {

  const responses = await Promise.all([
    serverFetch("/challenges"),
    serverFetch("/challenges/me"),
    serverFetch("/user/me"),
    serverFetch("/user/all"),
    serverFetch("/battles/all"),
    serverFetch("/battles/current"),
  ])

  // proxy.ts sends /auth back to / as long as the session cookie exists, so only a
  // rejected session may redirect here. Anything else has to surface as an error,
  // otherwise the two redirects loop forever.
  if (responses.some((res) => res.status === 401 || res.status === 403)) {
    redirect("/auth")
  }

  const failed = responses.find((res) => !res.ok)

  if (failed) {
    throw new Error(`Backend answered ${failed.status} for ${failed.url}`)
  }

  const [allRes, myRes, userRes, rankingRes, battlesRes, currentBattleRes] = responses

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
    userRes.json(),
    rankingRes.json(),
    battlesRes.json(),
    currentBattleRes.json()
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

        <Battles
          battles={battles}
          currentBattle={currentBattle}
          currentUser={user}
        />

      </div>
    </div>
  )
}
