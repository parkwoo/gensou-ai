// stores/ai-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIProvider } from '@/lib/ai/providers'

export interface AIUsage {
  date: string
  provider: AIProvider
  tokens: number
  cost: number
  task: string
}

export interface AISettings {
  defaultProvider: AIProvider
  temperature: number
  maxTokens: number
  autoSave: boolean
  streamEnabled: boolean
}

interface AIState {
  // State
  isGenerating: boolean
  currentProvider: AIProvider | null
  usage: AIUsage[]
  settings: AISettings
  error: string | null
  
  // Actions
  setIsGenerating: (isGenerating: boolean) => void
  setCurrentProvider: (provider: AIProvider | null) => void
  addUsage: (usage: Omit<AIUsage, 'date'>) => void
  updateSettings: (settings: Partial<AISettings>) => void
  setError: (error: string | null) => void
  getDailyUsage: () => number
  getMonthlyCost: () => number
}

const DEFAULT_SETTINGS: AISettings = {
  defaultProvider: 'gpt-5',
  temperature: 0.7,
  maxTokens: 4096,
  autoSave: true,
  streamEnabled: true,
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      isGenerating: false,
      currentProvider: null,
      usage: [],
      settings: DEFAULT_SETTINGS,
      error: null,

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setCurrentProvider: (provider) => set({ currentProvider: provider }),

      addUsage: (usage) =>
        set((state) => ({
          usage: [
            ...state.usage,
            { ...usage, date: new Date().toISOString().split('T')[0] },
          ],
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      setError: (error) => set({ error }),

      getDailyUsage: () => {
        const today = new Date().toISOString().split('T')[0]
        const state = get()
        return state.usage
          .filter((u) => u.date === today)
          .reduce((sum, u) => sum + u.tokens, 0)
      },

      getMonthlyCost: () => {
        const state = get()
        const now = new Date()
        const currentMonth = now.toISOString().slice(0, 7)
        
        return state.usage
          .filter((u) => u.date.startsWith(currentMonth))
          .reduce((sum, u) => sum + u.cost, 0)
      },
    }),
    {
      name: 'ai-storage',
      partialize: (state) => ({ usage: state.usage.slice(-100), settings: state.settings }),
    }
  )
)
