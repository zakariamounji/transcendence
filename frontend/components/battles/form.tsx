"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Battle, Challenge } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { FlashIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { announceBattleChange, emitBattle } from "@/lib/socket"
import { cn } from "@/lib/utils"

const fieldClassName = "border-line bg-transparent hover:border-line-strong dark:bg-transparent"

const MODES: { value: Battle["mode"], label: string }[] = [
  { value: "SOLO", label: "Solo — 1 player" },
  { value: "DUO", label: "Duo — 2 players" },
  { value: "GROUP", label: "Group — up to 8 players" }
]

const VISIBILITIES: { value: Battle["visibility"], label: string }[] = [
  { value: "PUBLIC", label: "Public — anyone can join" },
  { value: "PRIVATE", label: "Private — room code only" }
]

export default function BattleForm({
  challenge,
  busy
}: {
  challenge: Challenge
  busy: boolean
}): React.JSX.Element {

  const router = useRouter()

  const [open, setOpen] = useState<boolean>(false)
  const [pending, setPending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<Battle["mode"]>("DUO")
  const [visibility, setVisibility] = useState<Battle["visibility"]>("PUBLIC")

  function onOpenChange(next: boolean): void {
    setOpen(next)
    setError(null)
  }

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (pending) return

    const minutes = Number(challenge.timeLimitMin)

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
      setError("The battle has to run between 1 and 120 minutes.")
      return
    }

    setPending(true)
    setError(null)

    const { error: message } = await emitBattle("createBattle", {
      challengeId: challenge.cid,
      mode,
      visibility,
      durationSeconds: minutes * 60
    })

    setPending(false)

    if (message) {
      setError(message)
      return
    }

    setOpen(false)
    announceBattleChange()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogTrigger
        disabled={busy}
        title={busy ? "You are already in a battle." : undefined}
        render={
          <Button
            className={cn(
              "h-9 flex-1 cursor-pointer border border-line bg-surface-3 text-[12px] text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
              busy && "cursor-not-allowed opacity-50"
            )}
          />
        }
      >
        <HugeiconsIcon icon={FlashIcon} size={16} strokeWidth={1.8} />
        Battle
      </DialogTrigger>

      <DialogContent className="panel-sheen bg-surface-1 text-foreground ring-line sm:max-w-md">

        <DialogHeader>
          <DialogTitle> Create battle </DialogTitle>
          <DialogDescription className="text-dim">
            Everyone solves {challenge.title} at once, and the first correct answer takes it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="grid gap-4">

          <div className="grid gap-2">
            <Label htmlFor="battle-mode"> Mode </Label>
            <Select value={mode} onValueChange={(value) => setMode(value as Battle["mode"])}>
              <SelectTrigger id="battle-mode" disabled={pending} className={cn(fieldClassName, "h-10 w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((item) => (
                  <SelectItem key={item.value} value={item.value}> {item.label} </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="battle-visibility"> Visibility </Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as Battle["visibility"])}
            >
              <SelectTrigger id="battle-visibility" disabled={pending} className={cn(fieldClassName, "h-10 w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}> {item.label} </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-faint">
              A private battle gets a room code, and only the players who have it can come in.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="battle-duration"> Duration (min) </Label>
            <Input
              id="battle-duration"
              name="minutes"
              type="number"
              min={1}
              max={60}
              step={1}
              defaultValue={challenge.timeLimitMin}
              disabled={true}
              className={cn(fieldClassName, "h-10")}
            />
          </div>

          {error && (
            <p role="alert" className="text-[12px] text-red-500"> {error} </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose
              render={
                <Button
                  type="button"
                  disabled={pending}
                  className="h-10 cursor-pointer border border-line bg-transparent px-4 text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3"
                />
              }
            >
              Cancel
            </DialogClose>

            <Button
              type="submit"
              disabled={pending}
              className="btn-brand h-10 cursor-pointer px-4 disabled:opacity-100"
            >
              {pending ? (
                <HugeiconsIcon icon={Loading03Icon} size={20} strokeWidth={1.5} className="animate-spin" />
              ) : (
                "Create battle"
              )}
            </Button>
          </div>

        </form>

      </DialogContent>
    </Dialog>
  )
}
