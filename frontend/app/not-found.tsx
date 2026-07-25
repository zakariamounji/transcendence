import Link from "next/link"

export default function NotFound(): React.JSX.Element {
  return (
    <main className="min-h-screen min-w-full flex justify-center items-center p-4">
      <div className="flex justify-center items-center flex-col w-md text-center">

        <h1 className="text-4xl font-bold"> 404 </h1>

        <p className="text-[12px] text-[#a1a1a1] max-w-85 mt-3">
          This page does not exist.
        </p>

        <Link
          href="/"
          className="text-[12px] text-blue-500 hover:underline mt-4"
        >
          Back to home
        </Link>

      </div>
    </main>
  )
}
