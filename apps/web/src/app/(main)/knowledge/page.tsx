'use client'

import { useState, useEffect } from 'react'
import { Book, Plus, Search, Edit2, Trash2, Tag, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface KnowledgeItem {
  id: string
  type: 'setting' | 'character' | 'term' | 'location'
  name: string
  description: string
  tags: string[]
  relatedIds?: string[]
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = 'http://localhost:8000'

export function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 知識ベースを取得
  const fetchKnowledge = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`${API_BASE_URL}/api/knowledge?${params}`)
      if (!response.ok) {
        throw new Error('知識ベースの取得に失敗しました')
      }
      const data = await response.json()
      setKnowledge(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      console.error('Failed to fetch knowledge:', err)
    } finally {
      setLoading(false)
    }
  }

  // タブや検索クエリが変更されたときに再取得
  useEffect(() => {
    fetchKnowledge()
  }, [activeTab, searchQuery])

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return <Users className="h-4 w-4" />
      case 'setting': return <Book className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'term': return <Tag className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return 'bg-blue-500'
      case 'setting': return 'bg-purple-500'
      case 'location': return 'bg-green-500'
      case 'term': return 'bg-orange-500'
    }
  }

  const getTypeLabel = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return 'キャラクター'
      case 'setting': return '設定'
      case 'location': return '場所'
      case 'term': return '用語'
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8" />
            知識ベース
          </h1>
          <p className="text-muted-foreground mt-1">
            設定・キャラクター・用語を管理
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl sm:max-w-3xl flex flex-col">
            <DialogHeader>
              <DialogTitle>知識を追加</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <CreateKnowledgeForm onClose={() => setIsCreateOpen(false)} onSuccess={fetchKnowledge} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="知識を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="character">
            <Users className="h-4 w-4 mr-2" />
            キャラクター
          </TabsTrigger>
          <TabsTrigger value="setting">
            <Book className="h-4 w-4 mr-2" />
            設定
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4 mr-2" />
            場所
          </TabsTrigger>
          <TabsTrigger value="term">
            <Tag className="h-4 w-4 mr-2" />
            用語
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : knowledge.length === 0 ? (
            <div className="text-center py-16">
              <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">知識がありません</h3>
              <p className="text-muted-foreground">
                最初の知識を追加しましょう
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knowledge.map((item) => (
                <KnowledgeCard key={item.id} item={item} onUpdate={fetchKnowledge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KnowledgeCard({ item, onUpdate }: { item: KnowledgeItem; onUpdate: () => void }) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return 'bg-blue-500'
      case 'setting': return 'bg-purple-500'
      case 'location': return 'bg-green-500'
      case 'term': return 'bg-orange-500'
    }
  }

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return <Users className="h-4 w-4" />
      case 'setting': return <Book className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'term': return <Tag className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'character': return 'キャラクター'
      case 'setting': return '設定'
      case 'location': return '場所'
      case 'term': return '用語'
    }
  }

  const handleDelete = async () => {
    if (!confirm('この知識を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge/${item.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }
      onUpdate()
    } catch (err) {
      console.error('Failed to delete knowledge:', err)
      alert('削除に失敗しました')
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{getTypeLabel(item.type)}</CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-3">
            更新：{new Date(item.updatedAt).toLocaleDateString('ja-JP')}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl sm:max-w-3xl flex flex-col">
          <DialogHeader>
            <DialogTitle>知識を編集</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <EditKnowledgeForm item={item} onClose={() => setIsEditOpen(false)} onSuccess={onUpdate} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CreateKnowledgeForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [type, setType] = useState<KnowledgeItem['type']>('setting')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          name,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      })

      if (!response.ok) {
        throw new Error('作成に失敗しました')
      }

      onClose()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      console.error('Failed to create knowledge:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>タイプ</Label>
        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="character">キャラクター</TabsTrigger>
            <TabsTrigger value="setting">設定</TabsTrigger>
            <TabsTrigger value="location">場所</TabsTrigger>
            <TabsTrigger value="term">用語</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label>名前 <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：林風"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>説明 <span className="text-destructive">*</span></Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細な説明を入力"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>タグ (カンマ区切り)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例：主人公、高校生、男性"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '作成中...' : '作成'}
        </Button>
      </div>
    </form>
  )
}

function EditKnowledgeForm({ item, onClose, onSuccess }: { item: KnowledgeItem; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description)
  const [tags, setTags] = useState(item.tags.join(', '))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      })

      if (!response.ok) {
        throw new Error('更新に失敗しました')
      }

      onClose()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      console.error('Failed to update knowledge:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>名前</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>説明</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>タグ (カンマ区切り)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '更新中...' : '更新'}
        </Button>
      </div>
    </form>
  )
}

export default KnowledgeBasePage
