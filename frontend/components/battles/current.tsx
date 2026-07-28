"use client"
import Link from "next/link"
import type { Battle } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Cancel01Icon, Loading03Icon, Logout03Icon, PlayIcon } from "@hugeicons/core-free-icons"
import { Countdown, Fact, Players, StatusPill, modeLabel } from "@/components/battles/parts"
import { cn } from "@/lib/utils"

export default function CurrentBattle({
  battle,
  viewerId,
  pending,
  onStart,
  onCancel,
  onLeave
}: {
  battle: Battle
  viewerId: string
  pending: string | null
  onStart: (battleId: string) => Promise<boolean>
  onCancel: (battleId: string) => Promise<boolean>
  onLeave: (battleId: string) => Promise<boolean>
}): React.JSX.Element {

  const isHost = battle.creatorId === viewerId
  const isWaiting = battle.status === "WAITING"

  const canLeave = (!isHost || !isWaiting) && (isWaiting || battle.status === "RUNNING")

  function busy(action: string): boolean {
    return pending === `${action}:${battle.bid}`
  }

  return (
    <div className="rounded-lg border border-brand/30 bg-surface-2 p-4 ring-1 ring-brand/10">

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium"> {battle.challenge?.title ?? "Challenge"} </h3>
          <p className="mt-0.5 text-[12px] text-dim">
            {isHost ? "You are hosting this one." : "You joined this one."}
          </p>
        </div>

        <StatusPill status={battle.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line-soft py-3 text-center sm:grid-cols-4">
        <Fact label="Mode" value={modeLabel[battle.mode]} />
        <Fact label="Players" value={`${battle.players.length} / ${battle.maxPlayers}`} />
        <Fact label={battle.status === "RUNNING" ? "Left" : "Time"} value={<Countdown battle={battle} />} />
        <Fact
          label="Room code"
          value={battle.visibility === "PRIVATE" ? (battle.roomCode ?? "—") : "Public"}
        />
      </dl>

      <Players battle={battle} />

      <div className="mt-4 flex flex-wrap items-center gap-2">

        {battle.status === "RUNNING" && (
          <Link
            href={`/battles/${battle.bid}`}
            className="btn-brand flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-4 text-[12px] font-medium"
            suppressHydrationWarning
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
            Enter battle
          </Link>
        )}

        {isHost && isWaiting && (
          <Button
            type="button"
            onClick={() => onStart(battle.bid)}
            disabled={pending !== null}
            className={cn(
              "btn-brand h-9 cursor-pointer px-4 text-[12px]",
              pending !== null && "cursor-not-allowed opacity-50"
            )}
          >
            {busy("start") ? (
              <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
            ) : (
              <>
                <HugeiconsIcon icon={PlayIcon} size={16} strokeWidth={1.8} />
                Start battle
              </>
            )}
          </Button>
        )}

        {isHost && isWaiting && (
          <Button
            type="button"
            onClick={() => onCancel(battle.bid)}
            disabled={pending !== null}
            className={cn(
              "h-9 cursor-pointer border border-red-500/30 bg-red-500/10 px-4 text-[12px] text-red-400 hover:bg-red-500/20",
              pending !== null && "cursor-not-allowed opacity-50"
            )}
          >
            {busy("cancel") ? (
              <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
            ) : (
              <>
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
                Cancel battle
              </>
            )}
          </Button>
        )}

        {canLeave && (
          <Button
            type="button"
            onClick={() => onLeave(battle.bid)}
            disabled={pending !== null}
            className={cn(
              "h-9 cursor-pointer border border-line bg-surface-3 px-4 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
              pending !== null && "cursor-not-allowed opacity-50"
            )}
          >
            {busy("leave") ? (
              <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
            ) : (
              <>
                <HugeiconsIcon icon={Logout03Icon} size={16} strokeWidth={1.8} />
                Leave battle
              </>
            )}
          </Button>
        )}

        {battle.status === "RUNNING" && (
          <p className="text-[11px] text-faint">
            Leaving a running battle counts as a loss.
          </p>
        )}

      </div>

    </div>
  )
}