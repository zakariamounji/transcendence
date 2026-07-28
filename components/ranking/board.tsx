"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { ProfileInfo } from "@/interfaces"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { statusMeta } from "@/components/profile/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, UserShield01Icon } from "@hugeicons/core-free-icons"
import { promoteToAdmin } from "@/lib/admin"
import { cn } from "@/lib/utils"

const PER_PAGE = 10

const HEADS = ["#", "Player", "Level", "Wins", "Losses", "Win rate", "Status"]

type Filter = "ALL" | ProfileInfo["status"]

const FILTERS: { value: Filter, label: string }[] = [
  { value: "ALL", label: "Everyone" },
  { value: "ONLINE", label: "Online" },
  { value: "IN_BATTLE", label: "In battle" },
  { value: "OFFLINE", label: "Offline" }
]

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")

  return letters.toUpperCase() || "?"
}

function Cell({ children, className }: { children: React.ReactNode, className?: string }): React.JSX.Element {
  return <td className={cn("px-3 py-3 text-[13px] whitespace-nowrap", className)}> {children} </td>
}

// gold, silver and bronze for the podium, everyone else is just a number
const podium: Record<number, string> = {
  1: "border-amber-400/40 bg-amber-400/15 text-amber-300",
  2: "border-slate-300/40 bg-slate-300/15 text-slate-200",
  3: "border-orange-400/40 bg-orange-400/15 text-orange-300"
}

function Rank({ rank }: { rank: number }): React.JSX.Element {
  if (!podium[rank]) {
    return <span className="tabular-nums text-dim"> {rank} </span>
  }

  return (
    <span className={cn(
      "inline-flex size-6 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums",
      podium[rank]
    )}>
      {rank}
    </span>
  )
}

export default function RankingBoard({
  profiles,
  viewerId,
  viewerRole
}: {
  // already ordered by the backend: level, then exp, then wins
  profiles: ProfileInfo[]
  viewerId: string
  viewerRole: ProfileInfo["role"]
}): React.JSX.Element {

  const router = useRouter()

  const [query, setQuery] = useState<string>("")
  const [filter, setFilter] = useState<Filter>("ALL")
  const [page, setPage] = useState<number>(1)

  // only an admin can hand out the role, so only an admin is shown the column
  const canPromote = viewerRole === "ADMIN"

  const [promoting, setPromoting] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  async function promote(id: string): Promise<void> {
    if (promoting) return

    setPromoting(id)
    setProblem(null)

    const message = await promoteToAdmin(id)

    setPromoting(null)

    if (message) {
      setProblem(message)
      return
    }

    // the board is fed by a server component, this is what makes it read the new role
    router.refresh()
  }

  // the rank is the seat at the table, so it is handed out before anything is filtered
  const ranked = profiles.map((profile, index) => ({ profile, rank: index + 1 }))

  const needle = query.trim().toLowerCase()

  const found = ranked.filter(({ profile }) => (
    (filter === "ALL" || profile.status === filter) &&
    (needle === "" || profile.name.toLowerCase().includes(needle))
  ))

  const pages = Math.max(1, Math.ceil(found.length / PER_PAGE))

  // a filter can shrink the list under the page that is being read
  const current = Math.min(page, pages)
  const rows = found.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  return (
    <section className="mt-4 w-full panel-sheen rounded-xl border border-line bg-surface-1 p-5 sm:p-8">

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-gradient w-fit text-lg font-medium"> Ranking </h2>
          <p className="mt-0.5 text-[12px] text-dim">
            {profiles.length} players, by level then experience then wins
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search a player"
            aria-label="Search a player"
            className="h-9 w-44 border-line bg-transparent text-[12px] hover:border-line-strong dark:bg-transparent"
          />

          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as Filter)
              setPage(1)
            }}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className="h-9 w-36 border-line bg-transparent text-[12px] hover:border-line-strong dark:bg-transparent"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((item) => (
                <SelectItem key={item.value} value={item.value}> {item.label} </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {problem && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
          {problem}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-6 text-[12px] text-faint"> Nobody matches that. </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-line-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-soft bg-surface-2/80 text-left">
                {(canPromote ? [...HEADS, "Role"] : HEADS).map((head) => (
                  <th
                    key={head}
                    className="px-3 py-2 text-[10px] font-medium tracking-wide text-dim uppercase whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map(({ profile, rank }) => {
                const played = profile.wins + profile.losses
                const winRate = played === 0 ? 0 : Math.round((profile.wins / played) * 100)

                return (
                  <tr
                    key={profile.id}
                    className={cn(
                      "border-b border-line-soft transition-colors last:border-0 hover:bg-surface-2/60",
                      // your own row is the one you came to find
                      profile.id === viewerId &&
                        "bg-brand/10 hover:bg-brand/15 ring-1 ring-inset ring-brand/25"
                    )}
                  >
                    <Cell> <Rank rank={rank} /> </Cell>

                    <Cell>
                      <span className="flex items-center gap-2">
                        <span className="relative size-6 shrink-0 select-none">
                          {profile.image ? (
                            <Image
                              src={profile.image}
                              alt=""
                              fill
                              sizes="24px"
                              draggable={false}
                              className="rounded-full border border-line object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="flex size-full items-center justify-center rounded-full border border-line bg-surface-3 text-[9px] text-dim"
                            >
                              {initials(profile.name)}
                            </span>
                          )}
                        </span>

                        <span className="max-w-40 truncate"> {profile.name} </span>
                        {profile.id === viewerId && (
                          <span className={cn(
                            "rounded-full border border-brand/40 bg-brand/15 px-1.5",
                            "text-[9px] tracking-wide text-brand-bright uppercase"
                          )}> You </span>
                        )}
                      </span>
                    </Cell>

                    <Cell className="font-medium tabular-nums text-brand-bright"> {profile.level} </Cell>
                    <Cell className="tabular-nums text-emerald-400"> {profile.wins} </Cell>
                    <Cell className="tabular-nums text-red-400/80"> {profile.losses} </Cell>
                    <Cell className="tabular-nums text-dim"> {winRate}% </Cell>

                    <Cell>
                      <span className="flex items-center gap-2 text-dim">
                        <span className={cn("size-2 rounded-full", statusMeta[profile.status].dot)} />
                        {statusMeta[profile.status].label}
                      </span>
                    </Cell>

                    {canPromote && (
                      <Cell>
                        {profile.role === "ADMIN" ? (
                          <span className={cn(
                            "rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5",
                            "text-[9px] tracking-wide text-brand-bright uppercase"
                          )}> Admin </span>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => promote(profile.id)}
                            disabled={promoting !== null}
                            className={cn(
                              `h-7 cursor-pointer gap-1.5 border border-line bg-surface-3 px-2.5 text-[11px]
                              text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80`,
                              promoting !== null && "cursor-not-allowed opacity-50"
                            )}
                          >
                            <HugeiconsIcon
                              icon={promoting === profile.id ? Loading03Icon : UserShield01Icon}
                              size={13}
                              strokeWidth={1.8}
                              className={promoting === profile.id ? "animate-spin" : undefined}
                            />
                            Make admin
                          </Button>
                        )}
                      </Cell>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-dim">
          {found.length === 0
            ? "No player"
            : `${(current - 1) * PER_PAGE + 1}–${(current - 1) * PER_PAGE + rows.length} of ${found.length}`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
            className={cn(
              "h-9 cursor-pointer border border-line bg-surface-3 px-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
              current <= 1 && "cursor-not-allowed opacity-50"
            )}
          >
            Previous
          </Button>

          <span className="text-[12px] text-dim tabular-nums"> {current} / {pages} </span>

          <Button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current >= pages}
            className={cn(
              "h-9 cursor-pointer border border-line bg-surface-3 px-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
              current >= pages && "cursor-not-allowed opacity-50"
            )}
          >
            Next
          </Button>
        </div>
      </div>

    </section>
  )
}
