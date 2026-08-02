import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SourceCodeCircleIcon } from "@hugeicons/core-free-icons"

const links = [
  { href: "/#challenges", label: "Challenges" },
  { href: "/#battles", label: "Battles" },
  { href: "/#ranking", label: "Ranking" }
] as const

export default function SiteHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-surface-1/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-8">

        <Link href="/" className="flex items-center gap-2 select-none">
          <span className="fill-brand flex size-7 items-center justify-center rounded-lg text-white shadow-[0_4px_16px_-6px_var(--brand-amber)]">
            <HugeiconsIcon icon={SourceCodeCircleIcon} size={17} strokeWidth={2} />
          </span>
          <span className="text-gradient text-[15px] font-semibold tracking-tight"> Code Battle </span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-[12px] text-dim transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

      </div>
    </header>
  )
}
