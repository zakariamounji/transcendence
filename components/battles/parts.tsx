"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import type { Battle, BattlePlayer } from "@/interfaces"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChampionIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const statusStyle: Record<Battle["status"], string> = {
  WAITING: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  RUNNING: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  COMPLETED: "border-line bg-surface-3 text-dim",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400"
}

const statusLabel: Record<Battle["status"], string> = {
  WAITING: "Waiting",
  RUNNING: "Running",
  COMPLETED: "Finished",
  CANCELLED: "Cancelled"
}

const modeLabel: Record<Battle["mode"], string> = {
  SOLO: "Solo",
  DUO: "Duo",
  GROUP: "Group"
}

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")

  return letters.toUpperCase() || "?"
}

function StatusPill({ status }: { status: Battle["status"] }): React.JSX.Element {
  return (
    <span className={cn(
      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
      statusStyle[status]
    )}>
      {statusLabel[status]}
    </span>
  )
}

function Fact({ label, value }: { label: string, value: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-dim uppercase"> {label} </dt>
      <dd className="mt-1 text-[13px] font-medium"> {value} </dd>
    </div>
  )
}

// what a player is doing, in one word. The judge answers with the short forms, the
// arena adds "running" and "won" on top of them
const verdictWord: Record<string, string> = {
  running: "running",
  won: "won",
  AC: "accepted",
  WA: "wrong answer",
  RE: "crashed",
  SIG: "crashed",
  CE: "did not compile",
  TLE: "too slow",
  RATE_LIMITED: "slow down",
  ERROR: "not sent",
  EMPTY: "nothing to run"
}

const verdictTone: Record<string, string> = {
  running: "text-amber-400",
  won: "text-emerald-400",
  AC: "text-emerald-400",
  TLE: "text-amber-400",
  RATE_LIMITED: "text-amber-400",
  EMPTY: "text-faint"
}

function verdictLook(verdict: string): { word: string, tone: string } {
  return {
    word: verdictWord[verdict] ?? verdict.toLowerCase(),
    tone: verdictTone[verdict] ?? "text-red-400"
  }
}

function Player({
  player,
  battle,
  doing
}: {
  player: BattlePlayer
  battle: Battle
  // only the arena has anything to say here
  doing?: string
}): React.JSX.Element {

  const isCreator = player.id === battle.creatorId
  const isWinner = player.id === battle.winnerId
  const look = doing ? verdictLook(doing) : null

  return (
    <li className="flex items-center gap-2 rounded-full border border-line-soft bg-surface-2 py-1 pr-3 pl-1">

      <span className="relative size-6 shrink-0 select-none">
        {player.image ? (
          <Image
            src={player.image}
            alt=""
            fill
            sizes="24px"
            draggable={false}
            className="rounded-full border border-line object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center rounded-full border border-line bg-surface-3 text-[9px] font-medium text-dim"
          >
            {initials(player.name)}
          </span>
        )}
      </span>

      <span className="max-w-32 truncate text-[12px]"> {player.name} </span>

      {isWinner && (
        <HugeiconsIcon icon={ChampionIcon} size={14} strokeWidth={1.8} className="text-amber-400" />
      )}

      {look ? (
        <span className={cn("flex items-center gap-1 text-[10px]", look.tone)}>
          <span className={cn("size-1.5 rounded-full bg-current", doing === "running" && "animate-pulse")} />
          {look.word}
        </span>
      ) : isCreator && !isWinner && (
        <span className="text-[10px] tracking-wide text-faint uppercase"> Host </span>
      )}

    </li>
  )
}

function Players({
  battle,
  activity
}: {
  battle: Battle
  activity?: Record<string, string>
}): React.JSX.Element {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {battle.players.map((player) => (
        <Player key={player.id} player={player} battle={battle} doing={activity?.[player.id]} />
      ))}

      {battle.players.length === 0 && (
        <li className="text-[12px] text-faint"> Nobody in this battle yet. </li>
      )}
    </ul>
  )
}

function clock(seconds: number): string {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`
}

/**
 * Counts a running battle down. The gateway owns the real deadline and closes the
 * battle itself, this is only here so the page does not sit still while it runs.
 */
function Countdown({ battle }: { battle: Battle }): React.JSX.Element {

  const [left, setLeft] = useState<number | null>(null)

  const running = battle.status === "RUNNING" && battle.startedAt !== null

  useEffect(() => {
    if (!running || !battle.startedAt) return

    const endsAt = new Date(battle.startedAt).getTime() + battle.durationSeconds * 1000

    function tick(): void {
      setLeft(Math.round((endsAt - Date.now()) / 1000))
    }

    // the browser clock is only read once this is mounted, so the server render and
    // the first client render still agree on what they paint
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 1000)

    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [running, battle.startedAt, battle.durationSeconds])

  if (!running) {
    return <> {Math.round(battle.durationSeconds / 60)} m </>
  }

  return <> {clock(left ?? battle.durationSeconds)} </>
}

export { Countdown, Fact, Players, StatusPill, modeLabel, statusLabel, verdictLook }
