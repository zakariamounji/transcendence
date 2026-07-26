'use client'
import type { User } from '@/interfaces'
import { Check, Clock, AlertCircle } from 'lucide-react'

interface PlayerStatusProps {
  players: User[]
  currentUserId: string
  winnerId?: string | null
  codeResults?: Record<string, { verdict: string; statusCode?: number }>
}

export default function PlayerStatus({
  players,
  currentUserId,
  winnerId,
  codeResults = {}
}: PlayerStatusProps): React.JSX.Element {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'WRONG_ANSWER':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'RUNTIME_ERROR':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Check className="w-4 h-4" />
      case 'RUNTIME_ERROR':
      case 'WRONG_ANSWER':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-card-foreground">Players ({players.length})</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {players.map((player) => {
          const isCurrentUser = player.id === currentUserId
          const isWinner = player.id === winnerId
          const result = codeResults[player.id]

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg border ${
                isWinner
                  ? 'bg-green-500/5 border-green-500/30 ring-2 ring-green-500/30'
                  : isCurrentUser
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-background border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {player.image && (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {player.name}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                        {isWinner && <span className="text-xs text-green-400 ml-1">✓ Winner</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Lvl {player.level}</p>
                    </div>
                  </div>
                </div>

                {result && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs whitespace-nowrap ${getStatusColor(result.verdict)}`}>
                    {getStatusIcon(result.verdict)}
                    <span>{result.verdict.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
