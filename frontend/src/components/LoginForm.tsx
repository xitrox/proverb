import { useState } from 'react'

interface LoginFormProps {
  onLogin: (token: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pin.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token and call onLogin
      localStorage.setItem('proverb_token', data.token)
      localStorage.setItem('proverb_token_expires', String(Date.now() + data.expiresIn))
      onLogin(data.token)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Wrong Proverbs Collection
          </h1>
          <p className="text-slate-600">
            Enter the PIN to access the collection
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="pin" className="block text-sm font-medium text-slate-700 mb-2">
              Access PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base text-center text-2xl tracking-widest"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !pin.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {isLoading ? 'Checking...' : 'Access Collection'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Session will be valid for 30 days
          </p>
        </div>
      </div>
    </div>
  )
} 