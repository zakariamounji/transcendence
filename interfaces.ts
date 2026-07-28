interface ProfileInfo {
  id: string
  globalRank: number
  name: string
  email: string
  role: "ADMIN" | "USER"
  status: "ONLINE" | "OFFLINE" | "IN_BATTLE"
  level: number
  exp: number
  wins: number
  losses: number
  totalChallengesPlayed: number
  totalChallengesCreated: number
  lastSeen: Date
  image: string | null
}

interface Challenge {
  cid: string
  title: string
  slug: string
  description: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  language: "C" | "CPP"
  expReward: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  subject: string
  expectedOutput: string
  timeLimitMin: number
  createdById: string
}

interface BattlePlayer {
  id: string
  name: string
  image: string | null
  level: number
  wins: number
  losses: number
}

interface Battle {
  bid: string
  mode: "SOLO" | "DUO" | "GROUP"
  status: "WAITING" | "RUNNING" | "COMPLETED" | "CANCELLED"
  visibility: "PUBLIC" | "PRIVATE"
  maxPlayers: number
  // only a private battle carries one, and only its own players are told about it
  roomCode: string | null
  durationSeconds: number
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  creatorId: string
  winnerId: string | null
  challengeId: string
  players: BattlePlayer[]
  // /battles/all includes both, /battles/current leaves the creator out
  challenge?: Challenge
  creator?: BattlePlayer
}

// what the judge answers with. AC only means the program ran, the gateway is the one
// that decides whether what it printed was right
interface Submission {
  verdict: string
  stdout?: string
  stderr?: string
  cause?: string
  error_message?: string
}

export type {
  ProfileInfo,
  Challenge,
  Battle,
  BattlePlayer,
  Submission
}