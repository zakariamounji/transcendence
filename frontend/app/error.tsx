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

        <h1 className="text-2xl font-bold"> Something went wrong </h1>

        <p className="text-[12px] text-[#a1a1a1] max-w-85 mt-3">
          The server could not be reached. This is not a login problem, so try
          again in a moment.
        </p>

        <Button
          className="w-full mt-6 bg-white text-black h-12 text-[15px] hover:bg-white/80 cursor-pointer"
          onClick={reset}
        >
          Try again
        </Button>

        <Link
          href="/auth"
          className="text-[12px] text-blue-500 hover:underline mt-4"
        >
          Go to login
        </Link>

      </div>
    </main>
  )
}
