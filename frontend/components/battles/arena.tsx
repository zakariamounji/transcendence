"use client"
import { useState } from "react"
import Link from "next/link"
import type { Battle, Challenge } from "@/interfaces"
import { useArena } from "@/hooks/useArena"
import { Button } from "@/components/ui/button"
import Editor from "@/components/battles/editor"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ChampionIcon, FlashIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { Countdown, Players, StatusPill, verdictLook } from "@/components/battles/parts"
import { cn } from "@/lib/utils"

const difficultyStyle: Record<Challenge["difficulty"], string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HARD: "border-red-200 bg-red-50 text-red-700"
}

const template: Record<Challenge["language"], string> = {
  C: "#include <stdio.h>\n\nint main(void)\n{\n\t\n\treturn (0);\n}\n",
  CPP: "#include <iostream>\n\nint main()\n{\n\t\n\treturn (0);\n}\n"
}

function Panel({
  title,
  children,
  className
}: {
  title: string
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <section className={cn("panel-sheen rounded-xl border border-line bg-surface-1 p-5", className)}>
      <h2 className="text-[13px] font-medium"> {title} </h2>
      {children}
    </section>
  )
}

function Outcome({ battle, viewerId }: { battle: Battle, viewerId: string }): React.JSX.Element {

  const won = battle.winnerId === viewerId
  const winner = battle.players.find((player) => player.id === battle.winnerId)

  const message = battle.status === "CANCELLED"
    ? "The host called this battle off."
    : won
      ? "You solved it first. The battle is yours."
      : winner
        ? `${winner.name} solved it first.`
        : "Time ran out before anyone solved it."

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-5",
      won ? "border-emerald-200 bg-emerald-50" : "border-line bg-surface-1"
    )}>
      <div className="flex items-center gap-3">
        <HugeiconsIcon
          icon={ChampionIcon}
          size={22}
          strokeWidth={1.8}
          className={won ? "text-emerald-600" : "text-dim"}
        />
        <div>
          <p className="font-medium"> Battle over </p>
          <p className="mt-0.5 text-[12px] text-dim"> {message} </p>
        </div>
      </div>

      <Link
        href="/"
        className="btn-brand flex h-9 items-center gap-1.5 rounded-md px-4 text-[12px] font-medium"
        suppressHydrationWarning
      >
        Back home
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
      </Link>
    </div>
  )
}

export default function Arena({
  initialBattle,
  viewerId
}: {
  initialBattle: Battle
  viewerId: string
}): React.JSX.Element {

  const { battle, running, result, activity, live, submit } = useArena({ initialBattle, viewerId })

  const challenge = battle.challenge
  const language = challenge?.language ?? "C"

  const [code, setCode] = useState<string>(template[language])

  const isOver = battle.status === "COMPLETED" || battle.status === "CANCELLED"
  const isRunning = battle.status === "RUNNING"

  return (
    <div className="flex w-full justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-6xl">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href="/" className="text-[12px] text-dim transition-colors hover:text-brand-bright">
              ← Back home
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-medium"> {challenge?.title ?? "Battle"} </h1>
              {challenge && (
                <span className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  difficultyStyle[challenge.difficulty]
                )}>
                  {challenge.difficulty}
                </span>
              )}
              <StatusPill status={battle.status} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[11px] text-dim">
              <span className={cn("size-2 rounded-full", live ? "bg-status-success text-status-success dot-glow" : "bg-faint")} />
              {live ? "Live" : "Reconnecting"}
            </span>

            <div className="rounded-lg border border-line-soft bg-surface-2 px-4 py-2 text-center">
              <p className="text-[10px] tracking-wide text-dim uppercase">
                {isRunning ? "Time left" : "Time"}
              </p>
              <p className="mt-0.5 text-lg font-medium tabular-nums">
                <Countdown battle={battle} />
              </p>
            </div>
          </div>
        </div>

        {isOver && (
          <div className="mt-4">
            <Outcome battle={battle} viewerId={viewerId} />
          </div>
        )}

        {battle.status === "WAITING" && (
          <p className="mt-4 panel-sheen rounded-xl border border-line bg-surface-1 p-5 text-[12px] text-dim">
            The host has not started this battle yet. It begins for everyone at once.
          </p>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-3">

          <div className="grid gap-4 lg:col-span-2">

            <Panel title="The problem">
              <p className="mt-2 text-[13px] text-dim"> {challenge?.description} </p>

              <p className="mt-4 text-[10px] tracking-wide text-dim uppercase"> Standard input </p>

              {/* a challenge is allowed to hand the program nothing at all */}
              {challenge?.subject ? (
                <pre className="mt-1 overflow-x-auto rounded-lg border border-line-soft bg-surface-2 p-3 text-[12px]">
                  {challenge.subject}
                </pre>
              ) : (
                <p className="mt-1 text-[12px] text-faint">
                  Nothing. Your program has nothing to read, it only has to print.
                </p>
              )}

              <p className="mt-3 text-[11px] text-faint">
                Print exactly what the challenge asks for, on standard output. The first player whose
                output matches takes the battle.
              </p>
            </Panel>

            <Panel title={`Your solution, in ${language}`}>
              <Editor
                code={code}
                onChange={setCode}
                language={language}
                disabled={!isRunning || running}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => submit(code)}
                  disabled={!isRunning || running}
                  className={cn(
                    "btn-brand h-10 cursor-pointer px-4",
                    (!isRunning || running) && "cursor-not-allowed opacity-50"
                  )}
                >
                  {running ? (
                    <HugeiconsIcon icon={Loading03Icon} size={18} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon icon={FlashIcon} size={16} strokeWidth={1.8} />
                      Run and submit
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-faint">
                  {running ? "The judge is compiling and running it." : "Five submissions per minute."}
                </p>
              </div>

              {result && (
                <div className="mt-4">
                  <p className="text-[13px]">
                    <span className="text-dim"> Verdict: </span>
                    <span className={cn("font-medium", verdictLook(result.verdict).tone)}>
                      {verdictLook(result.verdict).word}
                    </span>
                  </p>

                  {result.stdout && (
                    <>
                      <p className="mt-3 text-[10px] tracking-wide text-dim uppercase"> What it printed </p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg border border-line-soft bg-surface-2 p-3 text-[12px]">
                        {result.stdout}
                      </pre>
                    </>
                  )}

                  {/* a crash comes back with nothing on stderr, and only cause says why */}
                  {(result.stderr || result.error_message || result.cause) && (
                    <>
                      <p className="mt-3 text-[10px] tracking-wide text-dim uppercase"> What went wrong </p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
                        {result.stderr || result.error_message || result.cause}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </Panel>

          </div>

          <Panel title={`Players (${battle.players.length})`} className="h-fit">
            <p className="mt-0.5 text-[12px] text-dim"> What everyone is doing, as they do it. </p>
            <Players battle={battle} activity={activity} />
          </Panel>

        </div>

      </div>
    </div>
  )
}
