"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ErrorBoundary({
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.JSX.Element {
  return (
    <main className="min-h-screen min-w-full flex justify-center items-center p-4">
      <div className="flex justify-center items-center flex-col w-md text-center">

        <h1 className="text-gradient text-xl font-medium"> Something went wrong </h1>

        <p className="text-[12px] text-dim max-w-85 mt-1">
          The server could not be reached. This is not a login problem, so try
          again in a moment.
        </p>

        <Button
          className="btn-brand w-full mt-6 h-12 text-[14px] cursor-pointer rounded-sm"
          onClick={reset}
        >
          Try again
        </Button>

        <Link
          href="/"
          className="text-[12px] text-brand-bright hover:underline mt-4"
        >
          Go to home
        </Link>

      </div>
    </main>
  )
}