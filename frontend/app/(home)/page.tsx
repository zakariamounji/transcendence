import Battles from "@/components/battles"
import Challanges from "@/components/challanges"
import Profile from "@/components/profile"
import Ranking from "@/components/ranking"

export default async function Home(): Promise<React.JSX.Element> {
  return (
    <div className="flex w-full justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-6xl">

        <Profile />
        <Challanges />
        <Battles />
        <Ranking />

      </div>
    </div>
  )
}