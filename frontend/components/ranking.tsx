import type { User } from "@/interfaces"
import { AnalyticsUpIcon, Award02Icon, StarIcon, TradeDownIcon } from "@hugeicons/core-free-icons"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

export default function Ranking({
  ranking,
  myId
}: {
  ranking: User[]
  myId: string
}): React.JSX.Element {
  return (
    <div className="mt-4">

      <p className="text-lg font-bold mt-6"> Global Ranking </p>

      {ranking.length > 0 ? (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {ranking.map((user, index) => (
            <div
              key={index}
              className="flex flex-col bg-secondary/10 p-4 rounded-md max-[600px]:p-2
              hover:bg-secondary/20 transition-colors hover:scale-101 ease-in-out duration-500"
            >
              
              <div className="flex items-center justify-between max-[909px]:gap-4 max-[909px]:items-start max-[909px]:flex-col">
                <div className="flex items-center flex-1 min-w-0 w-1/2 max-[909px]:w-full">
                  <div className="min-w-18 min-h-18 rounded-full relative overflow-hidden border border-gray-600 bg-gray-200">
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
  
                  <div className="flex flex-1 min-w-0 flex-col justify-center ml-4">
                    <span className="truncate text-[14px] font-medium">
                      {user.name}
                    </span>
                    <div
                      className="px-2 py-1 mt-1 w-fit text-[9px] text-gray-800 rounded-full"
                      style={{ backgroundColor: user.status === "IN_BATTLE" ? "#D1FAE5" : myId === user.id ? "#FEF3C7" :
                        user.status === "ONLINE" ? "#FEF3C7" : "#E5E7EB" }}
                    >
                      {myId === user.id ? "ONLINE" : user.status}
                    </div>
                  </div>
                </div>
  
                <div className="grid grid-cols-4 gap-3 max-[600px]:grid-cols-2 w-1/2 max-[909px]:w-full">
  
                  <div className="flex items-center gap-2 rounded-md bg-green-50 p-2">
  
                    <HugeiconsIcon
                      icon={Award02Icon}
                      size={18}
                      color="green"
                    />
  
                    <div>
                      <div className="font-semibold text-green-700">
                        {user.wins}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Wins
                      </div>
                    </div>
  
                  </div>
  
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-2">
  
                    <HugeiconsIcon
                      icon={TradeDownIcon}
                      size={18}
                      color="red"
                    />
  
                    <div>
                      <div className="font-semibold text-red-700">
                        {user.losses}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Losses
                      </div>
                    </div>
  
                  </div>
  
                  <div className="flex items-center gap-2 rounded-md bg-blue-50 p-2">
  
                    <HugeiconsIcon
                      icon={AnalyticsUpIcon}
                      size={18}
                      color="blue"
                    />
  
                    <div>
                      <div className="font-semibold text-blue-700">
                        {user.wins + user.losses ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0}%
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Win Rate
                      </div>
                    </div>
  
                  </div>
  
                  <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2">
  
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={18}
                      color="#FFB224"
                    />
  
                    <div>
                      <div className="font-semibold text-yellow-700">
                        #{index + 1}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Rank
                      </div>
                    </div>
  
                  </div>
  
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-4 text-[12px] text-gray-200">
                <div>
                  <b>{user.level}</b> · {user.exp % 100}/100 XP
                </div>
                <Progress
                  value={user.exp % 100}
                  className="h-full w-full [&>div]:bg-gray-600 text-blue-500"
                />
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <span className="text-gray-300 text-[12px]"> No users yet </span>
      )}

    </div>
  )
}