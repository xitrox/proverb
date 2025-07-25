import { useState, useEffect } from 'react'
import './App.css'
import { proverbsAPI, type Proverb } from './services/api'

function App() {
  const [currentProverb, setCurrentProverb] = useState<Proverb | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [allProverbs, setAllProverbs] = useState<Proverb[]>([])
  const [filteredProverbs, setFilteredProverbs] = useState<Proverb[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProverb, setNewProverb] = useState({ text: '', author: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load proverbs from API on mount
  useEffect(() => {
    loadProverbs()
  }, [])

  // Filter proverbs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProverbs(allProverbs)
    } else {
      const filtered = allProverbs.filter(proverb =>
        proverb.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proverb.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProverbs(filtered)
    }
  }, [searchTerm, allProverbs])

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
      
      // Show success message
      alert('Proverb added successfully!')
      
    } catch (err) {
      setError('Failed to add proverb. Please try again.')
      console.error('Error adding proverb:', err)
    } finally {
      setIsSubmitting(false)
    }
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
      {/* Header with random proverb */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              Wrong Proverbs Collection
            </h1>
            
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
            A collection of wrong proverbs by three proverb lovers 📚
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
