interface Challenge {
  cid: string
  title: string
  slug: string
  description: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  language: "C" | "CPP"
  expReward: number
  isPublished: boolean
  subject: string
  expectedOutput: string
  timeLimitMin: number
  createdById: string
}

interface User {
  id: string
  email: string
  role: "USER" | "ADMIN"
  status: "ONLINE" | "OFFLINE" | "IN_BATTLE"
  level: number
  exp: number
  wins: number
  losses: number
  totalChallengesPlayed: number
  totalChallengesCreated: number
  lastSeen: Date
  battle: Battle | null
  name: string
  image: string | null
}

interface Battle {
  bid: string
  mode: "SOLO" | "DUO" | "GROUP"
  visibility: "PUBLIC" | "PRIVATE"
  status: "WAITING" | "RUNNING" | "COMPLETED" | "CANCELLED"
  maxPlayers: number
  roomCode: string | null
  challenge: Challenge
  winnerId: string | null
  players: User[]
  creator: User
}

export type {
  Challenge,
  User,
  Battle
}