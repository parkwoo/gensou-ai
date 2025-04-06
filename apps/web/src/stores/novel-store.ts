// stores/novel-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Novel {
  id: string
  title: string
  description?: string
  background?: string
  characters?: string
  relationships?: string
  style?: string
  outline?: string
  chapters: Chapter[]
  createdAt: number
  updatedAt: number
}

export interface Chapter {
  id: string
  title: string
  content: string
  outline?: string
  order: number
  createdAt: number
  updatedAt: number
}

interface NovelState {
  novels: Novel[]
  currentNovelId: string | null
  currentChapterId: string | null
  
  // Actions
  setNovels: (novels: Novel[]) => void
  addNovel: (novel: Novel) => void
  updateNovel: (id: string, data: Partial<Novel>) => void
  deleteNovel: (id: string) => void
  setCurrentNovel: (id: string | null) => void
  setCurrentChapter: (id: string | null) => void
  addChapter: (novelId: string, chapter: Chapter) => void
  updateChapter: (novelId: string, chapterId: string, data: Partial<Chapter>) => void
  deleteChapter: (novelId: string, chapterId: string) => void
}

export const useNovelStore = create<NovelState>()(
  persist(
    (set, get) => ({
      novels: [],
      currentNovelId: null,
      currentChapterId: null,

      setNovels: (novels) => set({ novels }),

      addNovel: (novel) =>
        set((state) => ({
          novels: [...state.novels, novel],
        })),

      updateNovel: (id, data) =>
        set((state) => ({
          novels: state.novels.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: Date.now() } : n
          ),
        })),

      deleteNovel: (id) =>
        set((state) => ({
          novels: state.novels.filter((n) => n.id !== id),
          currentNovelId: state.currentNovelId === id ? null : state.currentNovelId,
        })),

      setCurrentNovel: (id) => set({ currentNovelId: id, currentChapterId: null }),

      setCurrentChapter: (id) => set({ currentChapterId: id }),

      addChapter: (novelId, chapter) =>
        set((state) => ({
          novels: state.novels.map((n) =>
            n.id === novelId
              ? { ...n, chapters: [...n.chapters, chapter], updatedAt: Date.now() }
              : n
          ),
        })),

      updateChapter: (novelId, chapterId, data) =>
        set((state) => ({
          novels: state.novels.map((n) =>
            n.id === novelId
              ? {
                  ...n,
                  chapters: n.chapters.map((c) =>
                    c.id === chapterId ? { ...c, ...data, updatedAt: Date.now() } : c
                  ),
                  updatedAt: Date.now(),
                }
              : n
          ),
        })),

      deleteChapter: (novelId, chapterId) =>
        set((state) => ({
          novels: state.novels.map((n) =>
            n.id === novelId
              ? {
                  ...n,
                  chapters: n.chapters.filter((c) => c.id !== chapterId),
                  updatedAt: Date.now(),
                }
              : n
          ),
          currentChapterId: state.currentChapterId === chapterId ? null : state.currentChapterId,
        })),
    }),
    {
      name: 'novel-storage',
      partialize: (state) => ({ novels: state.novels }),
    }
  )
)
