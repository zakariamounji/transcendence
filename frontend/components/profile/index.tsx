import Avatar, { statusMeta } from "@/components/profile/avatar"
import SignOut from "@/components/profile/sign-out"
import { getProfile } from "@/lib/profile"
import { getPlayers, rankOf } from "@/lib/ranking"
import { cn } from "@/lib/utils"

const EXP_PER_LEVEL = 100

const lastSeenFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC"
})

function Badge({
  children,
  brand
}: {
  children: React.ReactNode
  brand?: boolean
}): React.JSX.Element {
  return (
    <span className={cn(
      "rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase",
      brand
        ? "border-brand/40 bg-brand/15 text-brand-bright"
        : "border-line bg-surface-3 text-dim"
    )}>
      {children}
    </span>
  )
}

function Stat({
  label,
  value,
  tone,
  accent
}: {
  label: string
  value: string | number
  tone?: string
  accent?: string
}): React.JSX.Element {
  return (
    <div className={cn("card-lift rounded-lg border bg-surface-2 px-4 py-3", accent ?? "border-line-soft")}>
      <p className="text-[10px] tracking-wide text-dim uppercase"> {label} </p>
      <p className={cn("mt-1 text-lg font-medium tabular-nums", tone)}> {value} </p>
    </div>
  )
}

export default async function Profile(): Promise<React.JSX.Element> {

  const [profile, players] = await Promise.all([getProfile(), getPlayers()])

  const rank = rankOf(players, profile.id)

  const battles = profile.wins + profile.losses
  const winRate = battles === 0 ? 0 : Math.round((profile.wins / battles) * 100)

  const exp = Math.max(0, Math.min(EXP_PER_LEVEL, profile.exp))
  const levelProgress = (exp / EXP_PER_LEVEL) * 100

  const lastSeen = new Date(profile.lastSeen)
  const lastSeenLabel = Number.isNaN(lastSeen.getTime()) ? null : lastSeenFormat.format(lastSeen)

  return (
    <section className="w-full panel-sheen rounded-xl border border-line bg-surface-1 p-5 sm:p-8">

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">

        <Avatar name={profile.name} image={profile.image} status={profile.status} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="truncate text-xl font-medium"> {profile.name} </h1>
            {profile.role === "ADMIN" && <Badge brand>Admin</Badge>}
            <Badge>{statusMeta[profile.status].label}</Badge>
          </div>

          <p className="mt-1 truncate text-[12px] text-dim"> {profile.email} </p>

          {profile.status === "OFFLINE" && lastSeenLabel && (
            <p className="mt-0.5 text-[11px] text-faint"> Last seen {lastSeenLabel} UTC </p>
          )}
        </div>

        <div className="flex items-center gap-3 max-sm:w-full sm:shrink-0">
          <div className="flex-1 rounded-lg border border-line-soft bg-surface-2 px-5 py-3 text-center sm:flex-none">
            <p className="text-[10px] tracking-wide text-dim uppercase"> Global rank </p>
            <p className="text-gradient mt-1 text-2xl font-medium tabular-nums">
              {rank === null ? "—" : `#${rank}`}
            </p>
          </div>

          <SignOut />
        </div>

      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between text-[12px] text-dim">
          <span> Level <span className="font-medium text-brand-bright">{profile.level}</span> </span>
          <span className="tabular-nums"> {exp} / {EXP_PER_LEVEL} XP </span>
        </div>

        <div
          role="progressbar"
          aria-label={`Level ${profile.level} progress`}
          aria-valuenow={exp}
          aria-valuemin={0}
          aria-valuemax={EXP_PER_LEVEL}
          className="mt-2 h-2 w-full overflow-hidden rounded-full border border-line-soft bg-surface-2"
        >
          <div
            className={cn(
              "fill-brand h-full rounded-full transition-[width] duration-500",
              "shadow-[0_0_12px_-2px_var(--brand-amber)]"
            )}
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Battles" value={battles} tone="text-brand-bright" accent="border-brand/40" />
        <Stat label="Wins" value={profile.wins} tone="text-status-success" accent="border-status-success/30" />
        <Stat label="Losses" value={profile.losses} tone="text-status-danger" accent="border-status-danger/30" />
        <Stat label="Win rate" value={`${winRate}%`} tone="text-brand-bright" />
        <Stat label="Played" value={profile.totalChallengesPlayed} tone="text-brand-amber" />
        <Stat label="Created" value={profile.totalChallengesCreated} tone="text-brand-amber-bright" />
      </div>

    </section>
  )
}