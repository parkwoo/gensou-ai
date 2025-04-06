'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, SortAsc, MoreVertical, Edit, Trash2, FileText, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNovelStore, Novel } from '@/stores/novel-store'

const API_BASE_URL = 'http://localhost:8000'

export default function NovelsPage() {
  const router = useRouter()
  const { novels, setNovels, deleteNovel } = useNovelStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // APIから小説データを取得
  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/novels`)
        if (!response.ok) {
          throw new Error('小説の取得に失敗しました')
        }
        const data = await response.json()
        
        // 各小説の章データも取得
        const novelsWithChapters = await Promise.all(
          data.map(async (novel: any) => {
            try {
              const chaptersResponse = await fetch(`${API_BASE_URL}/api/novels/${novel.id}/chapters`)
              if (chaptersResponse.ok) {
                const chapters = await chaptersResponse.json()
                return {
                  ...novel,
                  chapters: chapters.map((ch: any) => ({
                    ...ch,
                    createdAt: new Date(ch.created_at).getTime(),
                    updatedAt: new Date(ch.updated_at).getTime(),
                  })),
                  createdAt: new Date(novel.created_at).getTime(),
                  updatedAt: new Date(novel.updated_at).getTime(),
                }
              }
              return {
                ...novel,
                chapters: [],
                createdAt: new Date(novel.created_at).getTime(),
                updatedAt: new Date(novel.updated_at).getTime(),
              }
            } catch (err) {
              console.error(`Failed to fetch chapters for novel ${novel.id}:`, err)
              return {
                ...novel,
                chapters: [],
                createdAt: new Date(novel.created_at).getTime(),
                updatedAt: new Date(novel.updated_at).getTime(),
              }
            }
          })
        )
        
        setNovels(novelsWithChapters)
      } catch (err) {
        console.error('Failed to fetch novels:', err)
      }
    }

    fetchNovels()
  }, [])

  // 検索・フィルタ・並び替え
  const filteredNovels = novels
    .filter(novel => 
      novel.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return b.updatedAt - a.updatedAt
      }
      return a.title.localeCompare(b.title)
    })

  const handleDelete = (id: string) => {
    if (confirm('この小説を削除してもよろしいですか？')) {
      deleteNovel(id)
    }
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">小説一覧</h1>
          <p className="text-muted-foreground mt-1">
            {novels.length} 件の小説
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="小説を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}>
          <SortAsc className="h-4 w-4" />
        </Button>
      </div>

      {/* Novel Grid */}
      {filteredNovels.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">小説がありません</h3>
          <p className="text-muted-foreground mb-4">
            最初の小説を作成しましょう
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNovels.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              onEdit={() => router.push(`/editor/${novel.id}`)}
              onDelete={() => handleDelete(novel.id)}
            />
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      {showCreateForm && (
        <CreateNovelDialog onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}

function NovelCard({ 
  novel, 
  onEdit, 
  onDelete 
}: { 
  novel: Novel
  onEdit: () => void
  onDelete: () => void
}) {
  const chapterCount = novel.chapters?.length || 0
  const wordCount = novel.chapters?.reduce((sum, ch) => sum + (ch.content?.length || 0), 0) || 0

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{novel.title}</h3>
          {novel.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {novel.description}
            </p>
          )}
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span>{chapterCount} 章</span>
        <span>{wordCount.toLocaleString()} 文字</span>
        <span>{new Date(novel.updatedAt).toLocaleDateString('ja-JP')}</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={onEdit} className="flex-1" size="sm">
          <Edit className="h-3 w-3 mr-1" />
          編集
        </Button>
        <Button
          onClick={() => router.push(`/mindmap/${novel.id}`)}
          variant="outline"
          size="sm"
        >
          <Network className="h-3 w-3" />
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function CreateNovelDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { addNovel } = useNovelStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newNovel: Novel = {
      id: crypto.randomUUID(),
      title,
      description,
      chapters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    addNovel(newNovel)
    router.push(`/editor/${newNovel.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">新規小説作成</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              タイトル <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="例：私の冒険物語"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="簡単な説明を入力"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
