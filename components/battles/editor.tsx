"use client"
import { useRef } from "react"
import type { Challenge } from "@/interfaces"
import { cn } from "@/lib/utils"

const KEYWORDS = [
  "alignas", "auto", "bool", "break", "case", "catch", "char", "class", "const", "constexpr",
  "continue", "default", "delete", "do", "double", "else", "enum", "explicit", "extern", "false",
  "float", "for", "friend", "goto", "if", "inline", "int", "long", "namespace", "new", "nullptr",
  "operator", "private", "protected", "public", "register", "return", "short", "signed", "sizeof",
  "static", "struct", "switch", "template", "this", "throw", "true", "try", "typedef", "typename",
  "union", "unsigned", "using", "virtual", "void", "volatile", "while"
]

// one pass, and the group that matched is what decides the colour
const TOKENS = new RegExp([
  "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)",              // comments
  "(^[ \\t]*#[a-z]+)",                                    // preprocessor
  "(\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*')", // strings and chars
  `\\b(${KEYWORDS.join("|")})\\b`,                        // keywords
  "\\b(\\d+(?:\\.\\d+)?)\\b"                              // numbers
].join("|"), "gm")

const TONE = [
  "text-faint",   // comments
  "text-fuchsia-400", // preprocessor
  "text-emerald-400", // strings
  "text-sky-400",     // keywords
  "text-amber-300"    // numbers
]

// both layers have to lay the text out identically, down to the wrapping
const SHARED = "h-96 w-full overflow-auto rounded-lg border p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words"

function paint(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0

  for (const match of code.matchAll(TOKENS)) {
    const at = match.index ?? 0
    if (at > last) out.push(code.slice(last, at))

    // groups 1..5 line up with TONE, and exactly one of them is set. No padding
    // inside the span: jsx would turn it into real spaces and shift every line
    const group = TONE.findIndex((_, index) => match[index + 1] !== undefined)
    out.push(group === -1
      ? match[0]
      : <span key={at} className={TONE[group]}>{match[0]}</span>)

    last = at + match[0].length
  }

  out.push(code.slice(last))
  return out
}

export default function Editor({
  code,
  onChange,
  language,
  disabled
}: {
  code: string
  onChange: (code: string) => void
  language: Challenge["language"]
  disabled: boolean
}): React.JSX.Element {

  const painted = useRef<HTMLPreElement | null>(null)

  // a textarea would tab away to the next control, and code without indentation is
  // not code anybody wants to read
  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Tab") return

    event.preventDefault()

    const field = event.currentTarget
    const { selectionStart, selectionEnd, value } = field

    onChange(`${value.slice(0, selectionStart)}\t${value.slice(selectionEnd)}`)
    requestAnimationFrame(() => {
      field.selectionStart = selectionStart + 1
      field.selectionEnd = selectionStart + 1
    })
  }

  return (
    <div className="relative mt-2">

      {/* the colours live down here, the textarea on top of them is see-through */}
      <pre
        ref={painted}
        aria-hidden="true"
        className={cn(SHARED, "pointer-events-none absolute inset-0 border-transparent text-foreground")}
      >
        {paint(code)}
        {"\n"}
      </pre>

      <textarea
        value={code}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(event) => {
          if (!painted.current) return
          painted.current.scrollTop = event.currentTarget.scrollTop
          painted.current.scrollLeft = event.currentTarget.scrollLeft
        }}
        spellCheck={false}
        disabled={disabled}
        aria-label={`Your ${language} code`}
        className={cn(
          SHARED,
          "relative resize-none border-line bg-transparent text-transparent caret-brand-bright outline-none",
          "hover:border-line-strong focus-visible:border-line-strong disabled:cursor-not-allowed"
        )}
      />

    </div>
  )
}
