interface Proverb {
  id: string
  text: string
  author: string
  createdAt?: string
}

const API_BASE = window.location.origin

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
      const response = await fetch(`${API_BASE}/api/proverbs`, {
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
      const response = await fetch(`${API_BASE}/api/proverbs`, {
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

export const proverbsAPI = new ProverbsAPI()
export type { Proverb } 