import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

const TONE = {
  brand: "border-brand/30 bg-brand/10 text-brand-bright",
  amber: "border-brand-amber/30 bg-brand-amber/10 text-brand-amber-bright",
  rust: "border-orange-200 bg-orange-50 text-orange-700"
} as const

export default function SectionIcon({
  icon,
  tone = "brand"
}: {
  icon: IconSvgElement
  tone?: keyof typeof TONE
}): React.JSX.Element {
  return (
    <span className={cn(
      "flex size-7 shrink-0 items-center justify-center rounded-lg border",
      TONE[tone]
    )}>
      <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
    </span>
  )
}
