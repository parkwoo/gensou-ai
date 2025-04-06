// lib/api-client.ts
// API クライアント（エラーハンドリング・ローディング対応）

import { Novel, Chapter } from '@/stores/novel-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API エラー
export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// リクエストオプション
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  timeout?: number
}

// タイムアウト付き fetch
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 30000 } = options
  
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('リクエストがタイムアウトしました', 408, 'TIMEOUT')
    }
    throw error
  }
}

// 共通 API クライアント
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 30000,
  } = options

  try {
    const response = await fetchWithTimeout(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      timeout,
    })

    // エラーハンドリング
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code || 'API_ERROR'
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('リクエストがキャンセルされました', 408, 'CANCELLED')
    }
    throw new ApiError(
      'ネットワークエラーが発生しました',
      0,
      'NETWORK_ERROR'
    )
  }
}

// Novel API
export const novelApi = {
  // 一覧取得
  async getNovels(): Promise<Novel[]> {
    return request<Novel[]>('/api/novels')
  },

  // 1 件取得
  async getNovel(id: string): Promise<Novel> {
    return request<Novel>(`/api/novels/${id}`)
  },

  // 作成
  async createNovel(data: Partial<Novel>): Promise<Novel> {
    return request<Novel>('/api/novels', {
      method: 'POST',
      body: data,
    })
  },

  // 更新
  async updateNovel(id: string, data: Partial<Novel>): Promise<Novel> {
    return request<Novel>(`/api/novels/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  // 削除
  async deleteNovel(id: string): Promise<void> {
    return request<void>(`/api/novels/${id}`, {
      method: 'DELETE',
    })
  },

  // 章节一覧
  async getChapters(novelId: string): Promise<Chapter[]> {
    return request<Chapter[]>(`/api/novels/${novelId}/chapters`)
  },

  // 章节作成
  async createChapter(novelId: string, data: Partial<Chapter>): Promise<Chapter> {
    return request<Chapter>(`/api/novels/${novelId}/chapters`, {
      method: 'POST',
      body: data,
    })
  },

  // 章节更新
  async updateChapter(
    novelId: string,
    chapterId: string,
    data: Partial<Chapter>
  ): Promise<Chapter> {
    return request<Chapter>(
      `/api/novels/${novelId}/chapters/${chapterId}`,
      {
        method: 'PUT',
        body: data,
      }
    )
  },

  // 章节削除
  async deleteChapter(novelId: string, chapterId: string): Promise<void> {
    return request<void>(
      `/api/novels/${novelId}/chapters/${chapterId}`,
      {
        method: 'DELETE',
      }
    )
  },
}

// AI API
export interface AIGenerationParams {
  task: string
  prompt: string
  provider?: 'gpt-5' | 'gpt-4.1' | 'claude-4' | 'claude-3.5' | 'sakurallm' | 'matsuri' | 'deepseek-v2' | 'qwen-jp'
  model?: string
  temperature?: number
  maxTokens?: number
  context?: Record<string, string>
}

export const aiApi = {
  // 生成（ストリーミング）
  async generateStream(
    params: AIGenerationParams,
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const url = `${API_URL}/api/ai/generate`
    
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        timeout: 120000, // 2 分
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status
        )
      }

      if (!response.body) {
        throw new Error('レスポンスボディがありません')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                onChunk(data.chunk)
              }
              if (data.error && onError) {
                onError(data.error)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(
          error instanceof Error ? error.message : '不明なエラー'
        )
      }
      throw error
    }
  },

  // プロバイダー一覧取得
  async getProviders(): Promise<any[]> {
    return request<any[]>('/api/ai/providers')
  },
}

// Settings API
export const settingsApi = {
  async getSettings(): Promise<any> {
    return request<any>('/api/settings')
  },

  async updateSettings(data: any): Promise<any> {
    return request<any>('/api/settings', {
      method: 'PUT',
      body: data,
    })
  },
}

// Knowledge API
export interface KnowledgeItem {
  id: string
  type: 'setting' | 'character' | 'term' | 'location'
  name: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const knowledgeApi = {
  async getKnowledge(): Promise<KnowledgeItem[]> {
    return request<KnowledgeItem[]>('/api/knowledge')
  },

  async createKnowledge(data: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    return request<KnowledgeItem>('/api/knowledge', {
      method: 'POST',
      body: data,
    })
  },

  async updateKnowledge(
    id: string,
    data: Partial<KnowledgeItem>
  ): Promise<KnowledgeItem> {
    return request<KnowledgeItem>(`/api/knowledge/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteKnowledge(id: string): Promise<void> {
    return request<void>(`/api/knowledge/${id}`, {
      method: 'DELETE',
    })
  },
}

// Export API
export const exportApi = {
  async exportToMarkdown(novelId: string): Promise<Blob> {
    const url = `${API_URL}/api/export/${novelId}/markdown`
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new ApiError('エクスポートに失敗しました', response.status)
    }
    
    return await response.blob()
  },

  async exportToEPUB(novelId: string): Promise<Blob> {
    const url = `${API_URL}/api/export/${novelId}/epub`
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new ApiError('エクスポートに失敗しました', response.status)
    }
    
    return await response.blob()
  },
}
