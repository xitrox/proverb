interface Proverb {
  id: string
  text: string
  author: string
  createdAt?: string
}

interface ProverbRating {
  proverbId: string
  averageRating: number
  totalVotes: number
}

interface UserRating {
  proverbId: string
  rating: number
}

import { getApiBase } from '../config'

class ProverbsAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('proverb_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async getProverbs(): Promise<Proverb[]> {
    try {
      const response = await fetch(`${getApiBase()}/api/proverbs`, {
        headers: this.getAuthHeaders()
      })
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('proverb_token')
        localStorage.removeItem('proverb_token_expires')
        window.location.reload() // Trigger re-authentication
        throw new Error('Authentication expired')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.proverbs || []
    } catch (error) {
      console.error('Failed to fetch proverbs:', error)
      throw error
    }
  }

  async addProverb(text: string, author: string): Promise<Proverb> {
    try {
      const response = await fetch(`${getApiBase()}/api/proverbs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ text, author })
      })

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('proverb_token')
        localStorage.removeItem('proverb_token_expires')
        window.location.reload() // Trigger re-authentication
        throw new Error('Authentication expired')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.proverb
    } catch (error) {
      console.error('Failed to add proverb:', error)
      throw error
    }
  }
}

class RatingsAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('proverb_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('proverb_session_id')
    if (!sessionId) {
      // Generate a unique session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('proverb_session_id', sessionId)
    }
    return sessionId
  }

  async getRatingStats(proverbIds: string[]): Promise<ProverbRating[]> {
    try {
      const response = await fetch(`${getApiBase()}/api/ratings?proverbIds=${proverbIds.join(',')}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.stats || []
    } catch (error) {
      console.error('Failed to fetch rating stats:', error)
      throw error
    }
  }

  async getUserRatings(): Promise<UserRating[]> {
    try {
      const sessionId = this.getSessionId()
      const response = await fetch(`${getApiBase()}/api/ratings?sessionId=${sessionId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.ratings || []
    } catch (error) {
      console.error('Failed to fetch user ratings:', error)
      throw error
    }
  }

  async submitRating(proverbId: string, rating: number): Promise<{ rating: any, stats: ProverbRating }> {
    try {
      const sessionId = this.getSessionId()
      const response = await fetch(`${getApiBase()}/api/ratings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ proverbId, sessionId, rating })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to submit rating:', error)
      throw error
    }
  }
}

export const proverbsAPI = new ProverbsAPI()
export const ratingsAPI = new RatingsAPI()
export type { Proverb, ProverbRating, UserRating } 