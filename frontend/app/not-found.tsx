import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound(): null {
  return (
    <main className="min-h-screen min-w-full flex justify-center items-center p-4">
      <div className="flex justify-center items-center flex-col w-md text-center">

        <h1 className="text-gradient text-xl font-medium"> The page you are looking for does not exist, please go back home. </h1>

        <p className="text-[12px] text-dim max-w-85 mt-1">
          Please check the URL in the address bar and try again. If you think this is a mistake, please contact support.
        </p>

        <Link
          href="/"
          className="text-[12px] text-brand-bright hover:underline mt-4"
        >
          <Button
            className="btn-brand w-full mt-6 h-12 text-[14px] cursor-pointer rounded-sm px-8"
          >
            Go back home
          </Button>
        </Link>

      </div>
    </main>
  )
}