import Image from "next/image"
import type { ProfileInfo } from "@/interfaces"
import { cn } from "@/lib/utils"

const statusMeta: Record<ProfileInfo["status"], { label: string, dot: string }> = {
  ONLINE: { label: "Online", dot: "bg-status-success" },
  IN_BATTLE: { label: "In battle", dot: "bg-brand-amber" },
  OFFLINE: { label: "Offline", dot: "bg-faint" }
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

export default function Avatar({
  name,
  image,
  status,
  className
}: {
  name: string
  image: string | null
  status: ProfileInfo["status"]
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn("relative size-20 shrink-0 sm:size-24 select-none", className)}>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 640px) 96px, 80px"
          priority
          draggable={false}
          className="rounded-full border border-line object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-full items-center justify-center rounded-full border border-line bg-surface-3 text-xl font-medium text-dim"
        >
          {initials(name)}
        </div>
      )}

      <span
        className={cn(
          "absolute right-0.5 bottom-0.5 size-4 rounded-full border-2 border-surface-1",
          statusMeta[status].dot
        )}
      />
    </div>
  )
}

export { statusMeta }