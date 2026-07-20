"use client"
import type { User } from "@/interfaces"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Logout01Icon, Award02Icon, TradeDownIcon, AnalyticsUpIcon, StarIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

export default function Profile({
  user,
  myRank
}: {
  user: User
  myRank: number
}): React.JSX.Element {

  const { signOut, signInOut } = useAuth()

  const currentXP = user.exp % 100
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(currentXP), 500)
    return () => clearTimeout(timer)
  }, [currentXP])

  const totalGames = user.wins + user.losses
  const winRate =
    totalGames === 0
      ? 0
      : Math.round((user.wins / totalGames) * 100)
  
  const userStatus = user.status === "IN_BATTLE" ? "IN_BATTLE" : "ONLINE"

  return (
    <div className="flex justify-between items-center gap-6 text-black w-full max-[904px]:flex-col">

      <div className="h-48 w-2/6 bg-white rounded-sm p-4 border border-gray-600 flex flex-col justify-between max-[904px]:w-full">

        <div className="flex gap-4 items-start justify-between">

          <div className="flex flex-1 min-w-0 gap-4 items-start">

            <div className="min-w-28 min-h-28 rounded-full relative overflow-hidden border border-gray-300 bg-gray-100">
              <Image
                src={user.image || "https://images.unsplash.com/photo-1783877608497-e42cad1a8283?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                alt="Profile Image"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                draggable={false}
                className="object-cover"
                loading="eager"
              />
            </div>

            <div className="flex flex-1 min-w-0 flex-col justify-center mt-1">
              <span className="truncate text-[18px] font-medium">
                {user.name}
              </span>

              <span className="truncate -mt-1 text-[12px] text-gray-800">
                {user.email}
              </span>

              <div
                className="px-3 py-1 mt-2 w-fit text-[10px] text-gray-800 rounded-full"
                style={{ backgroundColor: userStatus === "IN_BATTLE" ? "#D1FAE5" :
                  userStatus === "ONLINE" ? "#FEF3C7" : "#E5E7EB" }}
              >
                {userStatus}
              </div>
            </div>

          </div>

          <div
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-red-100 transition-colors hover:bg-red-200"
            onClick={signOut}
          >
            <HugeiconsIcon
              icon={signInOut ? Loading03Icon : Logout01Icon}
              size={16}
              color="red"
              strokeWidth={2}
              className={signInOut ? "animate-spin" : ""}
            />
          </div>

        </div>

        <div className="flex flex-col gap-1 mt-4 text-[12px] text-gray-800">
          <div>
            <b>{user.level}</b> · {currentXP}/100 XP
          </div>
          <Progress
            value={progress}
            className="h-full w-full"
          />
        </div>

      </div>

      <div className="h-48 max-[550px]:h-max w-4/6 bg-white rounded-sm p-4 border border-gray-600 max-[904px]:w-full">

        <span className="text-[13px] text-gray-900">
          Performance
        </span>

        <div className="mt-4 grid grid-cols-4 gap-4 px-8 max-[550px]:grid-cols-2">

          <div className="flex flex-col items-center">
            <div className="p-3 bg-green-100 rounded-sm">
              <HugeiconsIcon
                icon={Award02Icon}
                size={32}
                color="green"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[16px] font-medium text-green-800 mt-2">
              {user.wins}
            </span>
            <span className="text-[10px] text-gray-800 -mt-1">
              Wins
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 bg-red-100 rounded-sm">
              <HugeiconsIcon
                icon={TradeDownIcon}
                size={32}
                color="red"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[16px] font-medium text-red-800 mt-2">
              {user.losses}
            </span>
            <span className="text-[10px] text-gray-800 -mt-1">
              Losses
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 bg-blue-100 rounded-sm">
              <HugeiconsIcon
                icon={AnalyticsUpIcon}
                size={32}
                color="blue"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[16px] font-medium text-blue-800 mt-2">
              {winRate}%
            </span>
            <span className="text-[10px] text-gray-800 -mt-1">
              Win Rate
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 bg-yellow-100 rounded-sm">
              <HugeiconsIcon
                icon={StarIcon}
                size={32}
                color="#FFB224"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[16px] font-medium text-yellow-800 mt-2">
              #{myRank}
            </span>
            <span className="text-[10px] text-gray-800 -mt-1">
              Global Rank
            </span>
          </div>

        </div>

      </div>

    </div>
  )
}