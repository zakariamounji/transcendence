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
  name: string
  image: string | null
}

export type {
  Challenge,
  User
}