"use client"
import type { Challenge } from "@/interfaces"
import CreateChallengePrompt from "@/components/challenges/createChallengePrompt"
import ChallengeGrid from "./challengeGrid"

export default function Challenges({
  allChallenges,
  myChallenges,
  isAdmin,
  createdById
}: {
  allChallenges: Challenge[]
  myChallenges: Challenge[]
  isAdmin: boolean
  createdById: string
}): React.JSX.Element {
  return (
    <div className="mt-4">

      <CreateChallengePrompt />

      <p className="text-lg font-bold mt-6"> Your Challenges </p>

      <ChallengeGrid chanllenges={myChallenges} isAdmin={isAdmin} createdById={createdById}/>

      <p className="text-lg font-bold mt-6"> All Challenges </p>

      <ChallengeGrid chanllenges={allChallenges} isAdmin={isAdmin} createdById={createdById}/>

    </div>
  )
}