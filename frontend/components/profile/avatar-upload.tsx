"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Avatar from "@/components/profile/avatar"
import type { ProfileInfo } from "@/interfaces"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { ACCEPT, changeAvatar } from "@/lib/avatar"
import { cn } from "@/lib/utils"

export default function AvatarUpload({
  name,
  image,
  status
}: {
  name: string
  image: string | null
  status: ProfileInfo["status"]
}): React.JSX.Element {

  const router = useRouter()
  const picker = useRef<HTMLInputElement>(null)

  const [pending, setPending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function onPick(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]

    // clear file input so that the same file can be picked again if needed
    event.target.value = ""

    if (!file || pending) return

    setPending(true)
    setError(null)

    const message = await changeAvatar(file)

    setPending(false)

    if (message) {
      setError(message)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative w-fit">

        <Avatar name={name} image={image} status={status} />

        <input
          ref={picker}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={pending}
          aria-label="Change your picture"
          title="Change your picture"
          className={cn(
            `absolute -top-0.5 -right-0.5 flex size-7 cursor-pointer items-center justify-center
            rounded-full border border-line bg-surface-3 text-dim transition-colors
            hover:border-brand/50 hover:text-brand-bright`,
            pending && "cursor-not-allowed opacity-70"
          )}
        >
          <HugeiconsIcon
            icon={pending ? Loading03Icon : PencilEdit02Icon}
            size={14}
            strokeWidth={1.8}
            className={pending ? "animate-spin" : undefined}
          />
        </button>
      </div>

      {error && (
        <p className="max-w-28 text-center text-[10px] leading-tight text-red-400"> {error} </p>
      )}
    </div>
  )
}
