'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Download, Upload, LayoutGrid, Trash2, Edit2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MindMap } from '@/components/mindmap/mindmap'
import { AIPanel } from '@/components/ai/ai-panel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { importMindMapFromMarkdown, NodeType, parseAIMindMapJSON } from '@/lib/mindmap/utils'

export default function MindMapPage() {
  const router = useRouter()
  const params = useParams()
  const novelId = params.novelId as string

  const [novel, setNovel] = useState<any>(null)
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [mindMapData, setMindMapData] = useState<any>(null)
  const [initialNodes, setInitialNodes] = useState<any[]>([])
  const [initialEdges, setInitialEdges] = useState<any[]>([])
  const [currentMindMapText, setCurrentMindMapText] = useState('')
  const [mindmapKey, setMindmapKey] = useState(0)

  // APIから小説データを取得してマインドマップデータを初期化
  useEffect(() => {
    const fetchMindMapData = async () => {
      if (!novelId) return

      try {
        const API_BASE_URL = 'http://localhost:8000'
        const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}`)

        if (!response.ok) {
          console.error('Failed to fetch novel:', response.statusText)
          return
        }

        const data = await response.json()
        setNovel(data)

        // outlineが存在する場合、マインドマップデータに変換
        if (data.outline) {
          try {
            // JSON形式の場合
            const parsed = JSON.parse(data.outline)
            setInitialNodes(parsed.nodes || [])
            setInitialEdges(parsed.edges || [])
          } catch {
            // テキスト形式の場合、Markdownとしてパース
            try {
              const mindMapData = importMindMapFromMarkdown(data.outline)
              setInitialNodes(mindMapData.nodes)
              setInitialEdges(mindMapData.edges)
            } catch {
              // 単純なテキストの場合、1つのノードとして扱う
              setInitialNodes([{
                id: 'root',
                type: 'custom',
                position: { x: 250, y: 100 },
                data: {
                  label: data.outline.substring(0, 50) + (data.outline.length > 50 ? '...' : ''),
                  content: data.outline,
                  type: NodeType.ROOT
                }
              }])
              setInitialEdges([])
            }
          }
        } else {
          // outlineが存在しない場合
          setInitialNodes([])
          setInitialEdges([])
        }
      } catch (error) {
        console.error('Error fetching mind map data:', error)
      }
    }

    fetchMindMapData()
  }, [novelId])

  const handleSave = async () => {
    console.log('=== 保存処理開始 ===')
    console.log('mindMapData:', mindMapData)
    console.log('ノード数:', mindMapData?.nodes?.length)
    console.log('エッジ数:', mindMapData?.edges?.length)

    if (novel && mindMapData) {
      try {
        const API_BASE_URL = 'http://localhost:8000'
        const dataToSave = {
          outline: JSON.stringify(mindMapData)
        }
        console.log('保存するデータ:', dataToSave)

        const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        })

        if (!response.ok) {
          console.error('Failed to save novel:', response.statusText)
          alert('保存に失敗しました')
          return
        }

        console.log('=== 保存成功 ===')
        setIsSaveOpen(false)
        alert('保存しました')
      } catch (error) {
        console.error('Error saving novel:', error)
        alert('保存に失敗しました')
      }
    } else {
      console.warn('保存できません: novel=', novel, 'mindMapData=', mindMapData)
    }
  }

  // AI生成結果をマインドマップに適用
  const handleAIInsert = (generatedText: string) => {
    console.log('[handleAIInsert] Generated text:', generatedText.substring(0, 500))
    const result = parseAIMindMapJSON(generatedText)
    console.log('[handleAIInsert] Parse result:', result)
    if (result && result.nodes.length > 0) {
      console.log('[handleAIInsert] Setting nodes:', result.nodes.length, 'edges:', result.edges.length)
      setInitialNodes(result.nodes)
      setInitialEdges(result.edges)
      setIsAIPanelOpen(false)
      // MindMapコンポーネントを強制的に再マウント
      setMindmapKey(prev => prev + 1)
    } else {
      console.error('[handleAIInsert] Parse failed')
      alert('AI生成結果の解析に失敗しました。もう一度試してください。\n\nコンソールで詳細を確認してください。')
    }
  }

  // AIパネルを開くとき、現在のマインドマップ構造をテキスト化
  const handleOpenAIPanel = () => {
    // 現在のノード構造を簡易的なテキスト形式に変換
    if (initialNodes.length > 0) {
      const rootNodes = initialNodes.filter(n => !n.data.parentId)
      const structureText = rootNodes.map(root => {
        const children = initialNodes.filter(n => n.data.parentId === root.id)
        return `${root.data.label}\n${children.map(c => `  - ${c.data.label}`).join('\n')}`
      }).join('\n\n')
      setCurrentMindMapText(`【現在のマインドマップ構造】\n${structureText}`)
    }
    setIsAIPanelOpen(true)
  }

  const handleExport = () => {
    // TODO: Implement export
    alert('エクスポート機能は準備中です')
  }

  const handleImport = () => {
    // TODO: Implement import
    alert('インポート機能は準備中です')
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
            onClick={() => router.push(`/editor/${novelId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{novel.title}</h1>
            <p className="text-sm text-muted-foreground">マインドマップ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenAIPanel} disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            AIアシスタント
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSaveOpen(true)}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </header>

      {/* Mind Map */}
      <main className="flex-1 overflow-hidden">
        <MindMap
          key={mindmapKey}
          novelId={novelId}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={(nodes, edges) => {
            console.log('親コンポーネント: onSaveコールバック受信', {
              ノード数: nodes.length,
              エッジ数: edges.length
            })
            setMindMapData({ nodes, edges })
            console.log('親コンポーネント: mindMapData更新完了')
          }}
        />
      </main>

      {/* Save Dialog */}
      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マインドマップを保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ノード数</Label>
              <p className="text-sm text-muted-foreground">
                {mindMapData?.nodes?.length || 0} ノード
              </p>
            </div>
            <div>
              <Label>エッジ数</Label>
              <p className="text-sm text-muted-foreground">
                {mindMapData?.edges?.length || 0} エッジ
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSaveOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Panel */}
      <AIPanel
        open={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        onInsert={handleAIInsert}
        selectedText={currentMindMapText}
        task="mindmap"
      />
    </div>
  )
}
