'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface PasswordPromptProps {
  battleId: string
  onSubmit: (password: string) => void
  isLoading?: boolean
  error?: string
}

export default function PasswordPrompt({
  battleId,
  onSubmit,
  isLoading = false,
  error
}: PasswordPromptProps): React.JSX.Element {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      onSubmit(password)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-card-foreground">Private Battle</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          This battle is private. Enter the battle code to join.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Battle Code
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter battle code"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-primary mt-2"
            >
              {showPassword ? 'Hide' : 'Show'} code
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!password.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Battle'}
          </Button>
        </form>
      </div>
    </div>
  )
}
