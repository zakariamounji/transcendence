"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Challenge } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Add01Icon, Edit02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { challengeRequest, fetchChallenge } from "@/lib/challenges"
import { cn } from "@/lib/utils"

const DIFFICULTIES: Challenge["difficulty"][] = ["EASY", "MEDIUM", "HARD"]
const LANGUAGES: Challenge["language"][] = ["C", "CPP"]

const fieldClassName = "border-line bg-transparent hover:border-line-strong dark:bg-transparent"

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type Draft = {
  title: string
  description: string
  subject: string
  expectedOutput: string
  expReward: number
  timeLimitMin: number
}

// the upper bounds mirror the backend dto, so it never answers with a validation error
function findProblem(draft: Draft): string | null {
  if (draft.title.length < 6) return "The title needs at least 6 characters."
  if (draft.title.length > 120) return "The title cannot pass 120 characters."
  if (draft.description.length < 10) return "The description needs at least 10 characters."
  if (draft.description.length > 280) return "The description cannot pass 280 characters."
  // a challenge is free to need no input at all, it can simply ask for something printed
  if (draft.subject.length > 1000) return "The program input cannot pass 1000 characters."
  if (!draft.expectedOutput) return "The expected output cannot be empty."
  if (draft.expectedOutput.length > 1000) return "The expected output cannot pass 1000 characters."
  if (!Number.isInteger(draft.expReward) || draft.expReward < 1 || draft.expReward > 100) {
    return "The reward has to be a whole number between 1 and 100 XP."
  }
  if (!Number.isInteger(draft.timeLimitMin) || draft.timeLimitMin < 1 || draft.timeLimitMin > 120) {
    return "The time limit has to be a whole number between 1 and 120 minutes."
  }
  return null
}

export default function ChallengeForm({ challenge }: { challenge?: Challenge }): React.JSX.Element {

  const router = useRouter()
  const isEdit = challenge !== undefined

  const [open, setOpen] = useState<boolean>(false)
  const [pending, setPending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // what the card was given is only a summary, the full record arrives when the dialog opens
  const [details, setDetails] = useState<Challenge | undefined>(challenge)
  const [loading, setLoading] = useState<boolean>(false)

  // the selects need state, every other field is read straight off the form on submit
  const [difficulty, setDifficulty] = useState<Challenge["difficulty"]>(challenge?.difficulty ?? "EASY")
  const [language, setLanguage] = useState<Challenge["language"]>(challenge?.language ?? "C")

  async function onOpenChange(next: boolean): Promise<void> {
    setOpen(next)
    setError(null)

    if (!next || !isEdit) return

    setLoading(true)
    const full = await fetchChallenge(challenge.cid)
    setLoading(false)

    // the fields read their defaults on mount, so this has to land before the form renders
    if (full) {
      setDetails(full)
      setDifficulty(full.difficulty)
      setLanguage(full.language)
    }
  }

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (pending) return

    const data = new FormData(event.currentTarget)
    const draft: Draft = {
      title: String(data.get("title") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      expectedOutput: String(data.get("expectedOutput") ?? "").trim(),
      expReward: Number(data.get("expReward")),
      timeLimitMin: Number(data.get("timeLimitMin"))
    }

    const problem = findProblem(draft)

    if (problem) {
      setError(problem)
      return
    }

    setPending(true)
    setError(null)

    const message = await challengeRequest(isEdit ? `/${challenge.cid}` : "", {
      method: "POST",
      body: JSON.stringify({ ...draft, slug: slugify(draft.title), difficulty, language })
    })

    setPending(false)

    if (message) {
      setError(message)
      return
    }

    // closing unmounts the dialog, which resets every field back to its default
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogTrigger
        render={
          <Button
            className={cn(
              "cursor-pointer border border-line bg-surface-3 text-foreground transition-colors hover:border-brand/50 hover:bg-surface-3/80",
              isEdit ? "h-9 flex-1 text-[12px]" : "h-10 px-4 text-[13px]"
            )}
          />
        }
      >
        <HugeiconsIcon icon={isEdit ? Edit02Icon : Add01Icon} size={16} strokeWidth={1.8} />
        {isEdit ? "Edit" : "Create challenge"}
      </DialogTrigger>

      <DialogContent className="panel-sheen max-h-[85vh] overflow-y-auto bg-surface-1 text-foreground ring-line sm:max-w-lg">

        <DialogHeader>
          <DialogTitle> {isEdit ? "Edit challenge" : "Create challenge"} </DialogTitle>
          <DialogDescription className="text-dim">
            {isEdit
              ? "Your changes go live as soon as you save them."
              : "An admin has to publish it before anyone else can see it."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <HugeiconsIcon icon={Loading03Icon} size={26} strokeWidth={1.5} className="animate-spin text-brand-bright" />
          </div>
        ) : (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">

          <div className="grid gap-2">
            <Label htmlFor="challenge-title"> Title </Label>
            <Input
              id="challenge-title"
              name="title"
              defaultValue={details?.title}
              maxLength={120}
              placeholder="Reverse a string"
              disabled={pending}
              className={cn(fieldClassName, "h-10")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="challenge-description"> Description </Label>
            <Textarea
              id="challenge-description"
              name="description"
              defaultValue={details?.description}
              maxLength={280}
              placeholder="What the program has to do, and any rule the player must respect."
              disabled={pending}
              className={cn(fieldClassName, "min-h-20")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="challenge-difficulty"> Difficulty </Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as Challenge["difficulty"])}
              >
                <SelectTrigger id="challenge-difficulty" disabled={pending} className={cn(fieldClassName, "h-10 w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((item) => <SelectItem key={item} value={item}> {item} </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="challenge-language"> Language </Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Challenge["language"])}
              >
                <SelectTrigger id="challenge-language" disabled={pending} className={cn(fieldClassName, "h-10 w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((item) => <SelectItem key={item} value={item}> {item} </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="challenge-reward"> Reward (XP) </Label>
              <Input
                id="challenge-reward"
                name="expReward"
                type="number"
                min={1}
                max={100}
                step={1}
                defaultValue={details?.expReward ?? 20}
                disabled={pending}
                className={cn(fieldClassName, "h-10")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="challenge-time"> Time limit (min) </Label>
              <Input
                id="challenge-time"
                name="timeLimitMin"
                type="number"
                min={1}
                max={120}
                step={1}
                defaultValue={details?.timeLimitMin ?? 5}
                disabled={pending}
                className={cn(fieldClassName, "h-10")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="challenge-subject"> Program input, optional </Label>
            <Textarea
              id="challenge-subject"
              name="subject"
              defaultValue={details?.subject}
              maxLength={1000}
              placeholder="hello world"
              disabled={pending}
              className={cn(fieldClassName, "min-h-16 font-mono text-[13px]")}
            />
            <p className="text-[11px] text-faint">
              The player&apos;s program reads this on standard input. Leave it empty to ask for
              something printed on its own, with nothing to read.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="challenge-output"> Expected output </Label>
            <Textarea
              id="challenge-output"
              name="expectedOutput"
              defaultValue={details?.expectedOutput}
              maxLength={1000}
              placeholder="HELLO WORLD"
              disabled={pending}
              className={cn(fieldClassName, "min-h-16 font-mono text-[13px]")}
            />
            <p className="text-[11px] text-faint">
              The exact thing the program has to print on standard output to win.
            </p>
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
                isEdit ? "Save changes" : "Create challenge"
              )}
            </Button>
          </div>

        </form>
        )}

      </DialogContent>
    </Dialog>
  )
}
