"use client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Logout03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export default function SignOut({ className }: { className?: string }): React.JSX.Element {

  const { signOut, signInOut } = useAuth()

  return (
    <Button
      type="button"
      onClick={() => signOut()}
      disabled={signInOut}
      className={cn(
        `h-auto cursor-pointer self-stretch rounded-lg border border-line bg-surface-3
        px-4 text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80 disabled:opacity-100`,
        className,
        "flex flex-col gap-4"
      )}
    >
      <HugeiconsIcon
        icon={signInOut ? Loading03Icon : Logout03Icon}
        size={28}
        strokeWidth={1.5}
        className={signInOut ? "animate-spin" : undefined}
      />
      <span className="max-sm:sr-only text-[10px]"> Sign out </span>
    </Button>
  )
}