'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNovelStore } from '@/stores/novel-store'

export default function MindMapPage() {
  const router = useRouter()
  const { novels, addNovel } = useNovelStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [novelTitle, setNovelTitle] = useState('')

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateAndOpen = () => {
    if (novelTitle.trim()) {
      const newNovel = {
        id: crypto.randomUUID(),
        title: novelTitle,
        description: 'マインドマップから作成',
        background: '',
        characters: '',
        relationships: '',
        style: '',
        chapters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      addNovel(newNovel)
      router.push(`/mindmap/${newNovel.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">マインドマップ</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-block p-4 rounded-full bg-primary/10">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-4xl font-bold">
            思考を地図にし、
            <br />
            物語を綴る
          </h2>
          <p className="text-lg text-muted-foreground">
            マインドマップで小説の構成を視覚的に計画しましょう。
            <br />
            キャラクター、プロット、世界観をつなげて、あなただけの物語を作り上げます。
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              新規小説を作成
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/novels')}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              小説一覧
            </Button>
          </div>
        </div>
      </section>

      {/* Create Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">新規小説作成</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
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
          </div>
        </div>
      )}

      {/* Search */}
      {novels.length > 0 && (
        <section className="container py-8">
          <div className="mb-6">
            <Input
              placeholder="小説を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNovels.map((novel) => (
              <Card
                key={novel.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/mindmap/${novel.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{novel.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {novel.description && (
                    <CardDescription>{novel.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{novel.chapters?.length || 0} 章</span>
                      <span>{new Date(novel.updatedAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNovels.length === 0 && searchQuery && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                該当する小説が見つかりませんでした
              </p>
            </div>
          )}
        </section>
      )}

      {/* Features */}
      <section className="container py-16 border-t">
        <h3 className="text-2xl font-bold text-center mb-8">マインドマップの機能</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>視覚的構成</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                物語の構造を視覚的に整理。キャラクター、プロット、世界観のつながりを把握できます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Plus className="h-8 w-8 text-primary mb-2" />
              <CardTitle>簡単編集</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ドラッグ＆ドロップでノードを追加・編集。直感的な操作でアイデアを形にします。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ArrowRight className="h-8 w-8 text-primary mb-2" />
              <CardTitle>自動連携</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                マインドマップから大纲・章节を自動生成。エディタとシームレスに連携します。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>GenSou (玄想) - 思考を地図にし、物語を綴る。</p>
        </div>
      </footer>
    </div>
  )
}
