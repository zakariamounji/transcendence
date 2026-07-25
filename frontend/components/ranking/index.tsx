"use client"
import { DEFAULT_AVATAR, type User } from "@/interfaces"
import { AnalyticsUpIcon, Award02Icon, StarIcon, TradeDownIcon } from "@hugeicons/core-free-icons"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { FilterDrawer } from "./filter"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const USERS_PER_PAGE = 10

function winRate(user: User): number {
  const playedGames = user.wins + user.losses
  return playedGames === 0 ? 0 : Math.round((user.wins / playedGames) * 100)
}

export default function Ranking({
  ranking,
  myId
}: {
  ranking: User[]
  myId: string
}): React.JSX.Element {

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [status, setStatus] = useState<"OFFLINE" | "ONLINE" | "IN_BATTLE" | null>(null)
  const [winRateFilter, setWinRateFilter] = useState<"HIGH" | "LOW" | null>(null)

  const rankedUsers = useMemo(() => {
    return ranking.map((user, index) => ({
      ...user,
      rank: index + 1
    }))
  }, [ranking])

  const [currentPage, setCurrentPage] = useState<number>(1)

  const filteredRanking = useMemo(() => {
  const filtered = rankedUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        status === null || user.status === status

      return matchesSearch && matchesStatus
    })

    if (winRateFilter === "HIGH") {
      filtered.sort((a, b) => winRate(b) - winRate(a))
    } else if (winRateFilter === "LOW") {
      filtered.sort((a, b) => winRate(a) - winRate(b))
    }

    return filtered
  }, [rankedUsers, searchQuery, status, winRateFilter])

  const totalPages = Math.ceil(filteredRanking.length / USERS_PER_PAGE) || 1

  // A narrowed list can be shorter than the page the user is standing on, so the
  // page is clamped on render instead of reset in an effect.
  const page = Math.min(currentPage, totalPages)

  const paginatedRanking = useMemo(() => {
    const start = (page - 1) * USERS_PER_PAGE
    return filteredRanking.slice(start, start + USERS_PER_PAGE)
  }, [filteredRanking, page])

  return (
    <div className="mt-4">

      <p className="text-lg font-bold mt-6"> Global Ranking </p>

      <div className="mt-2 mb-4 flex items-center justify-between gap-2">
        <Input
          placeholder="Search user..."
          className="h-11 rounded-sm border border-gray-400 focus:border-gray-400 focus:ring-0 hover:border-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterDrawer
          setStatus={setStatus}
          status={status}
          winRateFilter={winRateFilter}
          setWinRateFilter={setWinRateFilter}
        />
      </div>

      {paginatedRanking.length > 0 ? (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {paginatedRanking.map((user) => (
            <div
              key={user.rank}
              className="flex flex-col bg-secondary/10 p-4 rounded-md hover:bg-secondary/20 transition-colors hover:scale-101 ease-in-out duration-500"
            >
              
              <div className="flex items-center justify-between max-[909px]:gap-4 max-[909px]:items-start max-[909px]:flex-col">
                <div className="flex items-center flex-1 min-w-0 w-1/2 max-[909px]:w-full">
                  <div className="min-w-18 min-h-18 rounded-full relative overflow-hidden border border-gray-600 bg-gray-200">
                    <Image
                      src={user.image || DEFAULT_AVATAR}
                      alt="Profile Image"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      draggable={false}
                      className="object-cover select-none"
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
                      {user.status === "IN_BATTLE" ? "IN BATTLE" : myId === user.id ? "ONLINE" : user.status}
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
                        {winRate(user)}%
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
                        #{user.rank}
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
        <span className="text-gray-300 text-[12px]"> No users found </span>
      )}

      <Pagination className="mt-4 justify-center">
        <PaginationContent>

          <PaginationItem className={page === 1 ? "pointer-events-none opacity-50" : ""}>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="hover:text-black"
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index} className={`${page === index + 1 ? "pointer-events-none opacity-50" : ""}`}>
              <PaginationLink
                onClick={() => setCurrentPage(index + 1)}
                className={`${page === index + 1 ? "bg-gray-700 text-white" : ""} hover:text-black`}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="hover:text-black"
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>

    </div>
  )
}