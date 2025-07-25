import { useState, useEffect } from 'react'
import './App.css'

interface Proverb {
  id: string
  text: string
  author: string
  createdAt?: string
}

// Mock data for development - will be replaced with Notion API
const mockProverbs: Proverb[] = [
  { id: '1', text: 'Early to bed and early to rise makes a man healthy, wealthy, and coffee.', author: 'Benjamin Franklin (misquoted)' },
  { id: '2', text: 'The early bird catches the worm, but the second mouse gets the cheese.', author: 'Anonymous Developer' },
  { id: '3', text: 'A penny saved is a penny that you forgot to spend on AWS.', author: 'DevOps Engineer' },
  { id: '4', text: 'Rome wasn\'t built in a day, but they had version control.', author: 'Project Manager' },
  { id: '5', text: 'When in doubt, restart the server and blame the network.', author: 'System Admin' },
  { id: '6', text: 'The customer is always right, except when they\'re wrong.', author: 'Product Manager' },
  { id: '7', text: 'Don\'t put all your eggs in one basket, put them in a microservice.', author: 'Software Architect' },
  { id: '8', text: 'A watched pot never boils, but an unwatched deployment always fails.', author: 'DevOps Team Lead' }
]

function App() {
  const [currentProverb, setCurrentProverb] = useState<Proverb | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProverbs, setFilteredProverbs] = useState<Proverb[]>(mockProverbs)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProverb, setNewProverb] = useState({ text: '', author: '' })

  // Load random proverb on mount
  useEffect(() => {
    loadRandomProverb()
  }, [])

  // Filter proverbs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProverbs(mockProverbs)
    } else {
      const filtered = mockProverbs.filter(proverb =>
        proverb.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proverb.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProverbs(filtered)
    }
  }, [searchTerm])

  const loadRandomProverb = () => {
    const randomIndex = Math.floor(Math.random() * mockProverbs.length)
    setCurrentProverb(mockProverbs[randomIndex])
  }

  const handleAddProverb = (e: React.FormEvent) => {
    e.preventDefault()
    if (newProverb.text.trim() && newProverb.author.trim()) {
      const proverb: Proverb = {
        id: Date.now().toString(),
        text: newProverb.text.trim(),
        author: newProverb.author.trim(),
        createdAt: new Date().toISOString()
      }
      mockProverbs.push(proverb)
      setNewProverb({ text: '', author: '' })
      setShowAddForm(false)
      // TODO: Send to Notion API via our proxy
    }
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
                <p className="text-slate-500">Loading proverb...</p>
              )}
            </div>
            
            {/* Reload button */}
            <button
              onClick={loadRandomProverb}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
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
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add Proverb
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
              </div>
            ))}
          </div>
          
          {filteredProverbs.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              No proverbs found matching "{searchTerm}"
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
        </div>
      </footer>
    </div>
  )
}

export default App
