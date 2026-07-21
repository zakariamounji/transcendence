import type { Challenge } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatUnlockIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import ChallengeInfoPrompt from "@/components/challenges/challangeInfoPrompt"

export default function ChallengeGrid({
  chanllenges,
  isAdmin,
  createdById
}: {
  chanllenges: Challenge[]
  isAdmin: boolean
  createdById: string
}): React.JSX.Element {
  return (
    <div className="mt-2 grid *:grid-cols-1 gap-2">

      {chanllenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chanllenges.map((challenge) => <ChallengeCard key={challenge.cid} challenge={challenge} isAdmin={isAdmin} createdById={createdById} /> )}
        </div>
      ) : (
        <span className="text-gray-300 text-[12px]"> No challenges yet </span>
      )}

    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    EASY: "bg-green-500/20 text-green-400",
    MEDIUM: "bg-yellow-500/20 text-yellow-400",
    HARD: "bg-red-500/20 text-red-400"
  }
  return (
    <div className={cn(colors[difficulty as keyof typeof colors], "px-2 py-1 rounded-full text-xs font-semibold")}>
      {difficulty}
    </div>
  )
}

function ChallengeCard({ challenge, isAdmin, createdById }: { challenge: Challenge; isAdmin: boolean; createdById: string }): React.JSX.Element {

  const createBattle = async () => {

    /* create better here */

  }

  const publishChallenge = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"
    const res = await fetch(`${backendUrl}/challenges/${challenge.cid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        isPublished: true
      })
    })

    if (res.ok) {
      alert("Challenge published successfully")
    } else {
      alert("Failed to publish challenge")
    }
  }

  const deleteChallenge = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"
    const res = await fetch(`${backendUrl}/challenges/${challenge.cid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })

    if (res.ok) {
      alert("Challenge deleted successfully")
    } else {
      alert("Failed to delete challenge")
    }
  }

  return (
    <div className="relative bg-card border border-border rounded-lg p-4 hover:border-accent transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-card-foreground">{challenge.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <DifficultyBadge difficulty={challenge.difficulty} />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Language</div>
          <div className="font-semibold text-sm text-card-foreground">{challenge.language}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Reward</div>
          <div className="font-semibold text-sm text-card-foreground">{challenge.expReward} XP</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Time Limit</div>
          <div className="font-semibold text-sm text-card-foreground">{challenge.timeLimitMin || 5} m</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">

        <Button
          className="flex-1 h-12 w-full"
          onClick={createBattle}
        >
          <Play className="w-4 h-4 mr-2" />
          Create Battle
        </Button>

        {isAdmin && !challenge.isPublished && (
          <Button
            className="h-12 w-12 shrink-0 bg-blue-100 hover:bg-blue-200"
            onClick={publishChallenge}
          >
            <HugeiconsIcon
              icon={BubbleChatUnlockIcon}
              size={20}
              color="blue"
              strokeWidth={2}
            />
          </Button>
        )}

        {(createdById === challenge.createdById || isAdmin) && (
          <Button
            className="h-12 w-12 shrink-0 bg-red-100 hover:bg-red-200"
            onClick={deleteChallenge}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              size={20}
              color="red"
              strokeWidth={2}
            />
          </Button>
        )}

      </div>

      <ChallengeInfoPrompt challenge={challenge} />

    </div>
  )
}