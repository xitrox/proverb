interface Proverb {
  id: string
  text: string
  author: string
  createdAt?: string
}

const API_BASE = window.location.origin

class ProverbsAPI {
  async getProverbs(): Promise<Proverb[]> {
    try {
      const response = await fetch(`${API_BASE}/api/proverbs`)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, author })
      })
      
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