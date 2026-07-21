import type { Challenge, User } from "@/interfaces"
import { myfetch } from "@/lib/myfectch"
import Profile from "@/components/profile"
import { redirect } from "next/navigation"
import Challenges from "@/components/challenges"
import Ranking from "@/components/ranking"

export default async function Home(): Promise<React.JSX.Element> {

  const [allRes, myRes, userData, rankingData] = await Promise.all([
    myfetch("/challenges"),
    myfetch("/challenges/me"),
    myfetch("/user/me"),
    myfetch("/user/all")
  ])

  if (!allRes.ok || !myRes.ok || !userData.ok || !rankingData.ok) {
    redirect("/auth")
  }

  const [allData, myData, userDataJson, rankingDataJson]: [
    { data: Challenge[] },
    { data: Challenge[] },
    { data: User },
    { data: User[] }
  ] = await Promise.all([
    allRes.json(),
    myRes.json(),
    userData.json(),
    rankingData.json()
  ])

  const user = userDataJson.data
  const ranking = rankingDataJson.data

  const allChallenges = allData.data.filter((challenge) => {
    if (user.role === "ADMIN") return true
    return challenge.isPublished
  })
  const myChallenges = myData.data

  return (
    <div className="flex justify-center items-center w-full p-8">
      <div className="max-w-370 w-full">

        <Profile user={user} myRank={ranking.findIndex((u) => u.id === user.id) + 1}/>

        <Challenges
          isAdmin={user.role === "ADMIN"}
          allChallenges={allChallenges}
          myChallenges={myChallenges}
          createdById={user.id}
        />

        <Ranking ranking={ranking} myId={user.id}/>

      </div>
    </div>
  )
}