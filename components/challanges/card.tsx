"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Challenge } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Loading03Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { challengeRequest } from "@/lib/challenges"
import ChallengeForm from "@/components/challanges/form"
import BattleForm from "@/components/battles/form"
import { cn } from "@/lib/utils"

const difficultyStyle: Record<Challenge["difficulty"], string> = {
  EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  HARD: "border-red-500/30 bg-red-500/10 text-red-400"
}

const actionClassName = "h-9 flex-1 cursor-pointer border border-line bg-surface-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80"

function Fact({ label, value }: { label: string, value: string | number }): React.JSX.Element {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-dim uppercase"> {label} </dt>
      <dd className="mt-1 text-[13px] font-medium"> {value} </dd>
    </div>
  )
}

export default function ChallengeCard({
  challenge,
  canEdit,
  canDelete,
  canPublish,
  inBattle
}: {
  challenge: Challenge
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
  // a player holds one battle at a time, so the button stays there but turns down
  inBattle: boolean
}): React.JSX.Element {

  const router = useRouter()

  const [pending, setPending] = useState<"delete" | "publish" | null>(null)
  const [askDelete, setAskDelete] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: "delete" | "publish", options: RequestInit): Promise<void> {
    setPending(action)
    setError(null)

    const message = await challengeRequest(`/${challenge.cid}`, options)

    setPending(null)

    if (message) {
      setError(message)
      return
    }

    setAskDelete(false)
    router.refresh()
  }

  return (
    <article className="card-lift flex flex-col rounded-lg border border-line-soft bg-surface-2 p-4">

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-medium"> {challenge.title} </h3>
        <span className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
          difficultyStyle[challenge.difficulty]
        )}>
          {challenge.difficulty}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-[12px] text-dim"> {challenge.description} </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-line-soft py-3 text-center">
        <Fact label="Language" value={challenge.language} />
        <Fact label="Reward" value={`${challenge.expReward} XP`} />
        <Fact label="Limit" value={`${challenge.timeLimitMin} m`} />
      </dl>

      {!challenge.isPublished && (
        <p className="mt-3 text-[11px] text-amber-400"> Not published yet </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] text-red-500"> {error} </p>
      )}

      {(challenge.isPublished || canEdit || canDelete || canPublish) && (
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">

          {askDelete ? (
            <>
              <p className="flex-1 text-[11px] text-dim"> Delete this challenge? </p>

              <Button
                type="button"
                onClick={() => setAskDelete(false)}
                disabled={pending === "delete"}
                className="h-9 cursor-pointer border border-line bg-transparent px-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => run("delete", { method: "DELETE" })}
                disabled={pending === "delete"}
                className="h-9 cursor-pointer border border-red-500/30 bg-red-500/10 px-3 text-[12px] text-red-400 hover:bg-red-500/20 disabled:opacity-100"
              >
                {pending === "delete" ? (
                  <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </>
          ) : (
            <>
              {/* anyone can open a battle on a challenge that went public */}
              {challenge.isPublished && <BattleForm challenge={challenge} busy={inBattle} />}

              {canEdit && <ChallengeForm challenge={challenge} />}

              {canPublish && (
                <Button
                  type="button"
                  onClick={() => run("publish", {
                    method: "POST",
                    body: JSON.stringify({ isPublished: !challenge.isPublished })
                  })}
                  disabled={pending === "publish"}
                  className={cn(actionClassName, "disabled:opacity-100")}
                >
                  {pending === "publish" ? (
                    <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={challenge.isPublished ? ViewOffIcon : ViewIcon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      {challenge.isPublished ? "Unpublish" : "Publish"}
                    </>
                  )}
                </Button>
              )}

              {canDelete && (
                <Button
                  type="button"
                  onClick={() => setAskDelete(true)}
                  aria-label="Delete challenge"
                  className="size-9 shrink-0 cursor-pointer border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />
                </Button>
              )}
            </>
          )}

        </div>
      )}

    </article>
  )
}
