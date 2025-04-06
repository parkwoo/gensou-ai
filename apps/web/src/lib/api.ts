// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Novel {
  id: string
  title: string
  description?: string
  background?: string
  characters?: string
  relationships?: string
  style?: string
  createdAt: number
  updatedAt: number
}

export interface Chapter {
  id: string
  novelId: string
  title: string
  content: string
  outline?: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface AIGenerationRequest {
  task: 'outline' | 'chapter' | 'content' | 'refine' | 'remove-ai-taste' | 'expand' | 'score'
  prompt: string
  provider?: 'gpt-5' | 'gpt-4.1' | 'claude-4' | 'claude-3.5' | 'sakurallm' | 'matsuri' | 'deepseek-v2' | 'qwen-jp'
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIStreamResponse {
  chunk: string
  done: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export const api = {
  // Novel CRUD
  async getNovels(): Promise<Novel[]> {
    const response = await fetch(`${API_URL}/api/novels`)
    if (!response.ok) throw new Error('Failed to fetch novels')
    return response.json()
  },

  async getNovel(id: string): Promise<Novel> {
    const response = await fetch(`${API_URL}/api/novels/${id}`)
    if (!response.ok) throw new Error('Failed to fetch novel')
    return response.json()
  },

  async createNovel(data: Partial<Novel>): Promise<Novel> {
    const response = await fetch(`${API_URL}/api/novels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create novel')
    return response.json()
  },

  async updateNovel(id: string, data: Partial<Novel>): Promise<Novel> {
    const response = await fetch(`${API_URL}/api/novels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update novel')
    return response.json()
  },

  async deleteNovel(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/novels/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete novel')
  },

  // Chapter CRUD
  async getChapters(novelId: string): Promise<Chapter[]> {
    const response = await fetch(`${API_URL}/api/novels/${novelId}/chapters`)
    if (!response.ok) throw new Error('Failed to fetch chapters')
    return response.json()
  },

  async getChapter(novelId: string, chapterId: string): Promise<Chapter> {
    const response = await fetch(`${API_URL}/api/novels/${novelId}/chapters/${chapterId}`)
    if (!response.ok) throw new Error('Failed to fetch chapter')
    return response.json()
  },

  async createChapter(novelId: string, data: Partial<Chapter>): Promise<Chapter> {
    const response = await fetch(`${API_URL}/api/novels/${novelId}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create chapter')
    return response.json()
  },

  async updateChapter(novelId: string, chapterId: string, data: Partial<Chapter>): Promise<Chapter> {
    const response = await fetch(`${API_URL}/api/novels/${novelId}/chapters/${chapterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update chapter')
    return response.json()
  },

  async deleteChapter(novelId: string, chapterId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/novels/${novelId}/chapters/${chapterId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete chapter')
  },

  // AI Generation (Streaming)
  async generateAI(request: AIGenerationRequest): Promise<ReadableStream<AIStreamResponse>> {
    const response = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to generate AI content')
    if (!response.body) throw new Error('No response body')
    return response.body as unknown as ReadableStream<AIStreamResponse>
  },

  // Settings
  async getSettings(): Promise<any> {
    const response = await fetch(`${API_URL}/api/settings`)
    if (!response.ok) throw new Error('Failed to fetch settings')
    return response.json()
  },

  async updateSettings(data: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update settings')
    return response.json()
  },
}

export default api
