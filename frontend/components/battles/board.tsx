"use client"
import type { Battle } from "@/interfaces"
import { useBattles } from "@/hooks/useBattles"
import BattleCard from "@/components/battles/card"
import CurrentBattle from "@/components/battles/current"
import { cn } from "@/lib/utils"

export default function BattleBoard({
  initialBattles,
  initialCurrent,
  viewerId
}: {
  initialBattles:  Battle[]
  initialCurrent: Battle | null
  viewerId: string
}): React.JSX.Element {

  const { battles, current, live, pending, error, notice, join, leave, start, cancel } = useBattles({
    initialBattles,
    initialCurrent,
    viewerId
  })

  const waiting = battles.filter((battle) => battle.status === "WAITING").length
  const running = battles.filter((battle) => battle.status === "RUNNING").length

  // the only the battles you could actually walk into
  const open = battles.filter((battle) => (
    battle.status === "WAITING" && !battle.players.some((player) => player.id === viewerId)
  ))

  return (
    <section className="mt-4 w-full panel-sheen rounded-xl border border-line bg-surface-1 p-5 sm:p-8">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-gradient w-fit text-lg font-medium"> Battles </h2>
          <p className="mt-0.5 text-[12px] text-dim">
            {waiting} waiting, {running} running
          </p>
        </div>

        <span className="flex items-center gap-2 text-[11px] text-dim">
          <span className={cn(
            "size-2 rounded-full",
            live ? "bg-emerald-400 text-emerald-400 dot-glow" : "bg-faint"
          )} />
          {live ? "Live" : "Reconnecting"}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
          {error}
        </p>
      )}

      {notice && (
        <p className="mt-4 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-[12px] text-brand-bright">
          {notice}
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-[13px] font-medium"> Your battle </h3>

        {current ? (
          <div className="mt-3">
            <CurrentBattle
              battle={current}
              viewerId={viewerId}
              pending={pending}
              onStart={start}
              onCancel={cancel}
              onLeave={leave}
            />
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-faint">
            You are not in a battle. Start one from any published challenge above, or join an open one below.
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-line-soft pt-6">
        <h3 className="text-[13px] font-medium"> Open battles </h3>
        <p className="mt-0.5 text-[12px] text-dim">
          Waiting for players. One battle at a time, per player.
        </p>

        {open.length === 0 ? (
          <p className="mt-4 text-[12px] text-faint"> Nobody is waiting for an opponent right now. </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {open.map((battle) => (
              <BattleCard
                key={battle.bid}
                battle={battle}
                busy={current !== null}
                pending={pending === `join:${battle.bid}`}
                onJoin={join}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  )
}