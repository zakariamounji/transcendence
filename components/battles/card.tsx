"use client"
import { useState } from "react"
import type { Battle } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { GlobalIcon, Loading03Icon, Login03Icon, LockIcon } from "@hugeicons/core-free-icons"
import { Fact, Players, StatusPill, modeLabel } from "@/components/battles/parts"
import { cn } from "@/lib/utils"

export default function BattleCard({
  battle,
  busy,
  pending,
  onJoin
}: {
  battle: Battle
  // the player already holds a battle, so this one is only there to be looked at
  busy: boolean
  pending: boolean
  onJoin: (battleId: string, roomCode?: string) => Promise<boolean>
}): React.JSX.Element {

  const [roomCode, setRoomCode] = useState<string>("")

  const isPrivate = battle.visibility === "PRIVATE"
  const isFull = battle.players.length >= battle.maxPlayers
  const isOpen = !busy && !isFull && battle.status === "WAITING"

  // a private battle turns away an empty code anyway, so it is not worth the trip
  const canJoin = isOpen && (!isPrivate || roomCode.trim().length > 0)

  return (
    <article className="card-lift flex flex-col rounded-lg border border-line-soft bg-surface-2 p-4">

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-medium"> {battle.challenge?.title ?? "Challenge"} </h3>
        <StatusPill status={battle.status} />
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-dim">
        <HugeiconsIcon
          icon={isPrivate ? LockIcon : GlobalIcon}
          size={13}
          strokeWidth={1.8}
        />
        {isPrivate ? "Private" : "Public"} · hosted by {battle.creator?.name ?? "a player"}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-line-soft py-3 text-center">
        <Fact label="Mode" value={modeLabel[battle.mode]} />
        <Fact label="Players" value={`${battle.players.length} / ${battle.maxPlayers}`} />
        <Fact label="Time" value={`${Math.round(battle.durationSeconds / 60)} m`} />
      </dl>

      <Players battle={battle} />

      <div className="mt-auto flex items-center gap-2 pt-4">

        {isPrivate && isOpen && (
          <Input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            maxLength={6}
            placeholder="CODE"
            aria-label="Room code"
            className="h-9 w-24 border-line bg-transparent text-center font-mono text-[12px]
            tracking-widest hover:border-line-strong dark:bg-transparent"
          />
        )}

        <Button
          type="button"
          onClick={() => onJoin(battle.bid, isPrivate ? roomCode.trim() : undefined)}
          disabled={!canJoin || pending}
          title={busy ? "You are already in a battle." : undefined}
          className={cn(
            "h-9 flex-1 cursor-pointer border border-line bg-surface-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
            (!canJoin || pending) && "cursor-not-allowed opacity-50"
          )}
        >
          {pending ? (
            <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />
          ) : (
            <>
              <HugeiconsIcon icon={Login03Icon} size={16} strokeWidth={1.8} />
              {isFull ? "Full" : "Join"}
            </>
          )}
        </Button>

      </div>

    </article>
  )
}
