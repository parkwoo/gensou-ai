'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Play, Settings, Brain, Download, Moon, Sun, Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NovelEditor } from '@/components/editor/novel-editor'
import { AIPanel } from '@/components/ai/ai-panel'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const novelId = params.novelId as string
  const { toast } = useToast()

  const [novel, setNovel] = useState<any>(null)
  const [currentChapterId, setCurrentChapterId] = useState<string>('')
  const [content, setContent] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [aiPanelOpen, setAIPanelOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterOrder, setChapterOrder] = useState('')

  // 小説データの読み込み
  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const API_BASE_URL = 'http://localhost:8000'
        const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}`)
        if (!response.ok) {
          throw new Error('小説の取得に失敗しました')
        }
        const data = await response.json()
        
        // 章データを取得
        const chaptersResponse = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters`)
        let chapters = []
        if (chaptersResponse.ok) {
          chapters = await chaptersResponse.json()
        }
        
        setNovel({ ...data, chapters })
        
        // 最初の章の内容を設定
        if (chapters.length > 0) {
          const firstChapter = chapters[0]
          setCurrentChapterId(firstChapter.id)
          setContent(firstChapter.content || '')
        } else {
          // 章が存在しない場合は、小説の説明などを初期コンテンツとして設定
          setContent(data.description || data.background || data.outline || '')
        }
      } catch (error) {
        console.error('Failed to fetch novel:', error)
        toast({
          title: 'エラー',
          description: '小説の読み込みに失敗しました',
          variant: 'destructive',
        })
      }
    }

    fetchNovel()
  }, [novelId, toast])

  const handleChapterChange = (chapterId: string) => {
    const chapter = novel?.chapters.find((ch: any) => ch.id === chapterId)
    if (chapter) {
      setCurrentChapterId(chapterId)
      setContent(chapter.content || '')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // APIに保存
      const API_BASE_URL = 'http://localhost:8000'
      if (novel && currentChapterId) {
        const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters/${currentChapterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content
          }),
        })
        
        if (!response.ok) {
          throw new Error('保存に失敗しました')
        }
      }
      toast({
        title: '保存完了',
        description: '変更が保存されました',
      })
    } catch (error) {
      toast({
        title: '保存エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIInsert = (text: string) => {
    // TODO: Insert text at cursor position
    setContent(prev => prev + '\n' + text)
    setAIPanelOpen(false)
  }

  const handleTextSelection = (text: string) => {
    setSelectedText(text)
  }

  const refreshChapters = async () => {
    try {
      const API_BASE_URL = 'http://localhost:8000'
      const chaptersResponse = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters`)
      if (chaptersResponse.ok) {
        const chapters = await chaptersResponse.json()
        setNovel(prev => ({ ...prev, chapters }))
      }
    } catch (error) {
      console.error('Failed to refresh chapters:', error)
    }
  }

  const handleCreateChapter = async () => {
    try {
      const API_BASE_URL = 'http://localhost:8000'
      const chapterNumber = (novel.chapters?.length || 0) + 1
      const fullTitle = `第${chapterNumber}章：${chapterTitle || '無題'}`

      const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: fullTitle,
          order: novel.chapters?.length || 0,
          content: '',
        }),
      })

      if (!response.ok) {
        throw new Error('章の作成に失敗しました')
      }

      const newChapter = await response.json()
      await refreshChapters()
      setCurrentChapterId(newChapter.id)
      setContent('')
      setIsChapterDialogOpen(false)
      setChapterTitle('')
      toast({
        title: '章を作成しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '章の作成に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateChapter = async () => {
    if (!editingChapter) return

    try {
      const API_BASE_URL = 'http://localhost:8000'
      // 章のインデックスを取得して"第X章"の形式を作成
      const chapterIndex = novel.chapters.findIndex((ch: any) => ch.id === editingChapter.id)
      const chapterNumber = chapterIndex + 1
      const fullTitle = `第${chapterNumber}章：${chapterTitle}`

      const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters/${editingChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: fullTitle,
          order: parseInt(chapterOrder) || editingChapter.order,
        }),
      })

      if (!response.ok) {
        throw new Error('章の更新に失敗しました')
      }

      await refreshChapters()
      setIsChapterDialogOpen(false)
      setEditingChapter(null)
      setChapterTitle('')
      setChapterOrder('')
      toast({
        title: '章を更新しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '章の更新に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('この章を削除してもよろしいですか？')) return

    try {
      const API_BASE_URL = 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}/chapters/${chapterId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('章の削除に失敗しました')
      }

      await refreshChapters()
      if (currentChapterId === chapterId) {
        const remainingChapters = novel.chapters?.filter((ch: any) => ch.id !== chapterId)
        if (remainingChapters.length > 0) {
          setCurrentChapterId(remainingChapters[0].id)
          setContent(remainingChapters[0].content || '')
        } else {
          setCurrentChapterId('')
          setContent('')
        }
      }
      toast({
        title: '章を削除しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '章の削除に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (chapter: any) => {
    setEditingChapter(chapter)
    // タイトルから"第X章："のプレフィックスを削除して純粋なタイトルのみを取得
    const pureTitle = chapter.title.replace(/^第\d+章：/, '')
    setChapterTitle(pureTitle)
    setChapterOrder(chapter.order?.toString() || '0')
    setIsChapterDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingChapter(null)
    setChapterTitle('')
    setChapterOrder((novel.chapters?.length || 0).toString())
    setIsChapterDialogOpen(true)
  }

  const handleDialogSubmit = () => {
    if (editingChapter) {
      handleUpdateChapter()
    } else {
      handleCreateChapter()
    }
  }

  if (!novel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">小説が見つかりません</h1>
          <Button onClick={() => router.push('/novels')}>
            小説一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/novels')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{novel.title}</h1>
            {novel.chapters && novel.chapters.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={currentChapterId}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="text-sm text-muted-foreground bg-transparent border-none outline-none cursor-pointer"
                >
                  {novel.chapters.map((chapter: any, index: number) => (
                    <option key={chapter.id} value={chapter.id}>
                      第 {index + 1} 章：{chapter.title}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    const chapter = novel.chapters.find((ch: any) => ch.id === currentChapterId)
                    if (chapter) openEditDialog(chapter)
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive"
                  onClick={() => handleDeleteChapter(currentChapterId)}
                  disabled={novel.chapters.length <= 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            新規章作成
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/mindmap/${novelId}`)}>
            <Brain className="h-4 w-4 mr-2" />
            マインドマップ
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                表示
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Sun className="h-4 w-4 mr-2" />
                ライトモード
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="h-4 w-4 mr-2" />
                ダークモード
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>

          <Button 
            variant="default" 
            size="sm"
            onClick={() => setAIPanelOpen(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            AI
          </Button>

          <Button 
            variant="default" 
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <NovelEditor
          content={content}
          onChange={setContent}
          onSave={handleSave}
          placeholder="ここに執筆を開始..."
        />
      </main>

      {/* AI Panel */}
      <AIPanel
        open={aiPanelOpen}
        onClose={() => setAIPanelOpen(false)}
        selectedText={selectedText}
        onInsert={handleAIInsert}
        task="content"
      />

      {/* Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingChapter ? '章を編集' : '新規章作成'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleDialogSubmit(); }} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">章タイトル</Label>
              <Input
                id="title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="例：桜の庭（章番号は自動で付与されます）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">順序</Label>
              <Input
                id="order"
                type="number"
                value={chapterOrder}
                onChange={(e) => setChapterOrder(e.target.value)}
                placeholder="0"
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleDialogSubmit}>
              {editingChapter ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
