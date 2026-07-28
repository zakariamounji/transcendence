import type { Challenge } from "@/interfaces"
import { serverFetch } from "@/lib/server-fetch"
import { getProfile } from "@/lib/profile"
import { getCurrentBattle } from "@/lib/battles-server"
import ChallengeCard from "@/components/challanges/card"
import ChallengeForm from "@/components/challanges/form"

async function readChallenges(response: Response): Promise<Challenge[]> {
  if (!response.ok) {
    throw new Error(`Backend answered ${response.status} for ${response.url}`)
  }

  const payload = await response.json()
  return payload.data ?? []
}

function Grid({
  challenges,
  empty,
  canEdit,
  canDelete,
  canPublish,
  inBattle
}: {
  challenges: Challenge[]
  empty: string
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
  inBattle: boolean
}): React.JSX.Element {

  if (challenges.length === 0) {
    return <p className="mt-4 text-[12px] text-faint"> {empty} </p>
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.cid}
          challenge={challenge}
          canEdit={canEdit}
          canDelete={canDelete}
          canPublish={canPublish}
          inBattle={inBattle}
        />
      ))}
    </div>
  )
}

export default async function Challanges(): Promise<React.JSX.Element> {

  const [profile, current, allResponse, myResponse] = await Promise.all([
    getProfile(),
    getCurrentBattle(),
    serverFetch("/challenges"),
    serverFetch("/challenges/me")
  ])

  const [all, mine] = await Promise.all([
    readChallenges(allResponse),
    readChallenges(myResponse)
  ])

  const isAdmin = profile.role === "ADMIN"

  // select only challenges that are not mine, and if I'm not admin, only published ones
  const others = all.filter((challenge) => (
    challenge.createdById !== profile.id && (isAdmin || challenge.isPublished)
  ))

  return (
    <section className="mt-4 w-full panel-sheen rounded-xl border border-line bg-surface-1 p-5 sm:p-8">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-gradient w-fit text-lg font-medium"> My challenges </h2>
          <p className="mt-0.5 text-[12px] text-dim">
            {mine.length} created, {mine.filter((challenge) => challenge.isPublished).length} published
          </p>
        </div>

        <ChallengeForm />
      </div>

      <Grid
        challenges={mine}
        empty="You have not created a challenge yet."
        canEdit
        canDelete
        canPublish={isAdmin}
        inBattle={current !== null}
      />

      <div className="mt-8 border-t border-line-soft pt-6">
        <h2 className="text-gradient w-fit text-lg font-medium"> All challenges </h2>
        <p className="mt-0.5 text-[12px] text-dim">
          {isAdmin ? "Everything other players created, published or not" : "Published by other players"}
        </p>

        <Grid
          challenges={others}
          empty="No challenge from anyone else yet."
          canEdit={false}
          canDelete={isAdmin}
          canPublish={isAdmin}
          inBattle={current !== null}
        />
      </div>

    </section>
  )
}
