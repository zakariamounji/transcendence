// Shown when a provider gave us no avatar, the host is allowed in next.config.ts
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1783877608497-e42cad1a8283?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

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
  // the answer: the API only sends it back to the challenge's creator
  expectedOutput?: string
  timeLimitMin: number
  createdById: string
}

interface User {
  id: string
  status: "ONLINE" | "OFFLINE" | "IN_BATTLE"
  level: number
  exp: number
  wins: number
  losses: number
  totalChallengesPlayed: number
  totalChallengesCreated: number
  name: string
  image: string | null
  // only /user/me returns these; the leaderboard and battle rosters do not
  role?: "USER" | "ADMIN"
  email?: string
  lastSeen?: Date
  battle?: Battle | null
}

interface Battle {
  bid: string
  mode: "SOLO" | "DUO" | "GROUP"
  visibility: "PUBLIC" | "PRIVATE"
  status: "WAITING" | "RUNNING" | "COMPLETED" | "CANCELLED"
  maxPlayers: number
  // the key to a private room: only the create response carries it, for its creator
  roomCode?: string | null
  challenge: Challenge
  winnerId: string | null
  players: User[]
  creator: User
}

export { DEFAULT_AVATAR }

export type {
  Challenge,
  User,
  Battle
}