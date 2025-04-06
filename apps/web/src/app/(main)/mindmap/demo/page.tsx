'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Download, Upload, LayoutGrid, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MindMap } from '@/components/mindmap/mindmap'
import { useNovelStore } from '@/stores/novel-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function MindMapDemoPage() {
  const router = useRouter()
  const { novels, addNovel } = useNovelStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [novelTitle, setNovelTitle] = useState('')

  const handleCreateAndOpen = () => {
    if (novelTitle.trim()) {
      const newNovel = {
        id: crypto.randomUUID(),
        title: novelTitle,
        description: 'マインドマップから作成',
        chapters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      addNovel(newNovel)
      router.push(`/mindmap/${newNovel.id}`)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">マインドマップデモ</h1>
            <p className="text-sm text-muted-foreground">GenSou (玄想)</p>
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規小説を作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規小説作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>タイトル</Label>
                <Input
                  value={novelTitle}
                  onChange={(e) => setNovelTitle(e.target.value)}
                  placeholder="例：私の冒険物語"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateAndOpen}>
                  作成して開く
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Info */}
      <div className="border-b px-4 py-2 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          マインドマップで小説の構成を視覚的に計画できます。右上の「新規小説を作成」から始めてください。
        </p>
      </div>

      {/* Existing Novels */}
      <div className="flex-1 overflow-auto p-4">
        {novels.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">既存の小説</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/mindmap/${novel.id}`)}
                >
                  <h3 className="font-semibold text-lg mb-2">{novel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {novel.description || '説明なし'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{novel.chapters?.length || 0} 章</span>
                    <span>•</span>
                    <span>{new Date(novel.updatedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">小説がありません</h3>
            <p className="text-muted-foreground mb-4">
              右上の「新規小説を作成」から始めてください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
