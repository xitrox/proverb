import { useState, useEffect } from 'react'
import './App.css'
import { proverbsAPI, type Proverb } from './services/api'
import LoginForm from './components/LoginForm'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentProverb, setCurrentProverb] = useState<Proverb | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [allProverbs, setAllProverbs] = useState<Proverb[]>([])
  const [filteredProverbs, setFilteredProverbs] = useState<Proverb[]>([])
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProverb, setNewProverb] = useState({ text: '', author: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Load proverbs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProverbs()
    }
  }, [isAuthenticated])

  // Auto-dismiss success toast after 3 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast])

  // Filter and sort proverbs based on search term and sort order
  useEffect(() => {
    let filtered = allProverbs

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(proverb =>
        proverb.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proverb.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    setFilteredProverbs(sorted)
  }, [searchTerm, allProverbs, sortOrder])

  const checkAuth = () => {
    const token = localStorage.getItem('proverb_token')
    const expiresAt = localStorage.getItem('proverb_token_expires')
    
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      setIsAuthenticated(true)
    } else {
      // Clear expired token
      localStorage.removeItem('proverb_token')
      localStorage.removeItem('proverb_token_expires')
      setIsAuthenticated(false)
    }
    setLoading(false)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('proverb_token')
    localStorage.removeItem('proverb_token_expires')
    setIsAuthenticated(false)
    setAllProverbs([])
    setFilteredProverbs([])
    setCurrentProverb(null)
  }

  const loadProverbs = async () => {
    try {
      setLoading(true)
      setError(null)
      const proverbs = await proverbsAPI.getProverbs()
      setAllProverbs(proverbs)
      setFilteredProverbs(proverbs)
      
      // Set random proverb if we have any
      if (proverbs.length > 0) {
        const randomIndex = Math.floor(Math.random() * proverbs.length)
        setCurrentProverb(proverbs[randomIndex])
      }
    } catch (err) {
      setError('Failed to load proverbs. Please try again later.')
      console.error('Error loading proverbs:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRandomProverb = () => {
    if (allProverbs.length > 0) {
      const randomIndex = Math.floor(Math.random() * allProverbs.length)
      setCurrentProverb(allProverbs[randomIndex])
    }
  }

  const handleAddProverb = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProverb.text.trim() || !newProverb.author.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      const addedProverb = await proverbsAPI.addProverb(
        newProverb.text.trim(),
        newProverb.author.trim()
      )
      
      // Add to local state
      const updatedProverbs = [addedProverb, ...allProverbs]
      setAllProverbs(updatedProverbs)
      setFilteredProverbs(updatedProverbs)
      
      // Reset form
      setNewProverb({ text: '', author: '' })
      setShowAddForm(false)

      // Show success toast
      setShowSuccessToast(true)

    } catch (err) {
      setError('Failed to add proverb. Please try again.')
      console.error('Error adding proverb:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading proverbs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Proverb added successfully!</span>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 hover:bg-green-700 rounded p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header with random proverb */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-slate-800">
                Bullshit collection
              </h1>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1 border border-slate-300 rounded"
              >
                Logout
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                <button 
                  onClick={() => setError(null)} 
                  className="ml-2 text-red-900 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Current random proverb */}
            <div className="bg-slate-100 rounded-lg p-6 mb-4">
              {currentProverb ? (
                <>
                  <blockquote className="text-lg italic text-slate-700 mb-3">
                    "{currentProverb.text}"
                  </blockquote>
                  <cite className="text-sm text-slate-600">
                    — {currentProverb.author}
                  </cite>
                </>
              ) : (
                <p className="text-slate-500">
                  {allProverbs.length === 0 ? 'No proverbs available yet.' : 'Click the button to load a random proverb!'}
                </p>
              )}
            </div>
            
            {/* Reload button */}
            <button
              onClick={loadRandomProverb}
              disabled={allProverbs.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              🎲 Get Another Proverb
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Add new proverb button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Proverb'}
          </button>
        </div>

        {/* Add proverb form */}
        {showAddForm && (
          <form onSubmit={handleAddProverb} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add a New Wrong Proverb</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="proverbText" className="block text-sm font-medium text-slate-700 mb-1">
                  Proverb Text
                </label>
                <textarea
                  id="proverbText"
                  value={newProverb.text}
                  onChange={(e) => setNewProverb({ ...newProverb, text: e.target.value })}
                  placeholder="Enter the wrong proverb..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="proverbAuthor" className="block text-sm font-medium text-slate-700 mb-1">
                  Author
                </label>
                <input
                  id="proverbAuthor"
                  type="text"
                  value={newProverb.author}
                  onChange={(e) => setNewProverb({ ...newProverb, author: e.target.value })}
                  placeholder="Who said this?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newProverb.text.trim() || !newProverb.author.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isSubmitting ? 'Adding...' : 'Add Proverb'}
              </button>
            </div>
          </form>
        )}

        {/* Search field */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
            Search proverbs
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by text or author..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
          />
        </div>

        {/* Sort dropdown */}
        <div className="mb-6">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700 mb-2">
            Sort by
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Filtered proverbs list */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            All Proverbs ({filteredProverbs.length})
          </h2>
          <div className="space-y-4">
            {filteredProverbs.map((proverb) => (
              <div
                key={proverb.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
              >
                <blockquote className="text-slate-700 mb-2">
                  "{proverb.text}"
                </blockquote>
                <cite className="text-sm text-slate-600">
                  — {proverb.author}
                </cite>
                {proverb.createdAt && (
                  <div className="text-xs text-slate-500 mt-2">
                    Added: {new Date(proverb.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredProverbs.length === 0 && allProverbs.length > 0 && (
            <p className="text-slate-500 text-center py-8">
              No proverbs found matching "{searchTerm}"
            </p>
          )}
          
          {allProverbs.length === 0 && !loading && (
            <p className="text-slate-500 text-center py-8">
              No proverbs in the database yet. Be the first to add one!
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-600">
            A bullshit collection by three proverb lovers 📚
          </p>
          <button 
            onClick={loadProverbs}
            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            🔄 Refresh from Notion
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
