// lib/db.ts - Dexie.js (IndexedDB) for offline support

import Dexie, { Table } from 'dexie'

export interface NovelDraft {
  id: string
  title: string
  content: string
  novelId?: string
  chapterId?: string
  synced: boolean
  createdAt: number
  updatedAt: number
}

export interface LocalSettings {
  key: string
  value: any
  updatedAt: number
}

export interface AICache {
  id: string
  prompt: string
  response: string
  provider: string
  model: string
  tokens: number
  createdAt: number
}

class NovelDatabase extends Dexie {
  drafts!: Table<NovelDraft, string>
  settings!: Table<LocalSettings, string>
  aiCache!: Table<AICache, string>

  constructor() {
    super('novel-ai-jp-db')
    this.version(1).stores({
      drafts: 'id, novelId, chapterId, synced, createdAt, updatedAt',
      settings: 'key, updatedAt',
      aiCache: 'id, prompt, provider, createdAt',
    })
  }
}

export const db = new NovelDatabase()

// Draft operations
export async function saveDraft(draft: Omit<NovelDraft, 'createdAt' | 'updatedAt'>) {
  const now = Date.now()
  await db.drafts.put({
    ...draft,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getDraft(id: string): Promise<NovelDraft | undefined> {
  return await db.drafts.get(id)
}

export async function getUnsyncedDrafts(): Promise<NovelDraft[]> {
  return await db.drafts.where('synced').equals(false).toArray()
}

export async function markAsSynced(id: string) {
  await db.drafts.update(id, { synced: true })
}

export async function deleteDraft(id: string) {
  await db.drafts.delete(id)
}

// Settings operations
export async function saveSetting(key: string, value: any) {
  await db.settings.put({
    key,
    value,
    updatedAt: Date.now(),
  })
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.get(key)
  return setting?.value as T | undefined
}

// AI Cache operations
export async function cacheAIResponse(data: Omit<AICache, 'id' | 'createdAt'>) {
  const id = `${data.provider}:${data.model}:${data.prompt.slice(0, 50)}`
  await db.aiCache.put({
    ...data,
    id,
    createdAt: Date.now(),
  })
}

export async function getCachedAI(prompt: string, provider: string): Promise<AICache | undefined> {
  const cached = await db.aiCache.where('prompt').equals(prompt).first()
  if (cached && cached.provider === provider) {
    return cached
  }
  return undefined
}

// Sync utility
export async function syncDrafts() {
  const unsynced = await getUnsyncedDrafts()
  if (unsynced.length === 0) return []

  // In a real app, you would send these to your backend
  console.log('Syncing drafts:', unsynced)
  
  // Mark as synced
  for (const draft of unsynced) {
    await markAsSynced(draft.id)
  }

  return unsynced
}
