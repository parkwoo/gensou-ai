'use client'

import { useState } from 'react'
import { Brain, Plus, Trash2, Play, Settings, Database, Cpu, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Dataset {
  id: string
  name: string
  description: string
  samplesCount: number
  genre: string
  style: string
  createdAt: string
}

interface FineTunedModel {
  id: string
  name: string
  baseModel: string
  datasetId: string
  status: 'pending' | 'training' | 'completed' | 'failed'
  accuracy?: number
  createdAt: string
  completedAt?: string
}

export function FineTuningPage() {
  const [activeTab, setActiveTab] = useState('datasets')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)

  // Mock data
  const datasets: Dataset[] = [
    {
      id: '1',
      name: 'ライトノベル風',
      description: '人気のライトノベル作品から収集',
      samplesCount: 1234,
      genre: 'light_novel',
      style: 'casual',
      createdAt: '2025-02-15',
    },
    {
      id: '2',
      name: '恋愛小説',
      description: '恋愛小説の名作コレクション',
      samplesCount: 890,
      genre: 'romance',
      style: 'literary',
      createdAt: '2025-02-10',
    },
    {
      id: '3',
      name: 'ファンタジー',
      description: '異世界ファンタジー作品',
      samplesCount: 567,
      genre: 'fantasy',
      style: 'epic',
      createdAt: '2025-02-05',
    },
  ]

    const models: FineTunedModel[] = [
      {
        id: '1',
        name: 'qwen-jp-novel-v1',
        baseModel: 'Qwen-JP',
        datasetId: '1',
        status: 'completed',
        accuracy: 92,
        createdAt: '2025-02-20',
        completedAt: '2025-02-20',
      },
      {
        id: '2',
        name: 'sakurallm-novel-v1',
        baseModel: 'SakuraLLM',
        datasetId: '2',
        status: 'training',
        createdAt: '2025-02-21',
      },
      {
        id: '3',
        name: 'matsuri-novel-v1',
        baseModel: 'Matsuri',
        datasetId: '3',
        status: 'ready',
        createdAt: '2025-02-22',
      },
    ]

  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          return 100
        }
        return prev + 5
      })
    }, 500)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            ファインチューニング
          </h1>
          <p className="text-muted-foreground mt-1">
            日本語小説特化モデルを自作
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">
            <Database className="h-4 w-4 mr-2" />
            データセット
          </TabsTrigger>
          <TabsTrigger value="training">
            <Cpu className="h-4 w-4 mr-2" />
            学習実行
          </TabsTrigger>
          <TabsTrigger value="models">
            <Brain className="h-4 w-4 mr-2" />
            学習済みモデル
          </TabsTrigger>
        </TabsList>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">データセット一覧</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新しいデータセット
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>学習実行</CardTitle>
              <CardDescription>
                ファインチューニングのパラメータを設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ベースモデル</Label>
                <Select defaultValue="qwen-7b">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qwen-7b">Qwen-7B (推奨)</SelectItem>
                    <SelectItem value="qwen-14b">Qwen-14B (高品質)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>データセット</Label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ライトノベル風 (1,234 サンプル)</SelectItem>
                    <SelectItem value="2">恋愛小説 (890 サンプル)</SelectItem>
                    <SelectItem value="3">ファンタジー (567 サンプル)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>エポック：{3}</Label>
                <Slider defaultValue={[3]} max={10} step={1} />
              </div>

              <div className="space-y-2">
                <Label>バッチサイズ：{4}</Label>
                <Slider defaultValue={[4]} max={16} step={1} />
              </div>

              <div className="space-y-2">
                <Label>学習率：0.0001</Label>
                <Slider defaultValue={[0.0001]} max={0.001} step={0.0001} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">推定コストと時間</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">学習時間:</span>
                    <span className="ml-2">2.4 時間</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GPU コスト:</span>
                    <span className="ml-2">¥2,400</span>
                  </div>
                </CardContent>
              </Card>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>学習中...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}

              <Button 
                onClick={startTraining} 
                disabled={isTraining}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {isTraining ? '学習中...' : '学習を開始'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{dataset.name}</CardTitle>
            <CardDescription>{dataset.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">サンプル数:</span>
            <span>{dataset.samplesCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ジャンル:</span>
            <Badge variant="secondary">{dataset.genre}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">スタイル:</span>
            <Badge variant="outline">{dataset.style}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">作成日:</span>
            <span>{dataset.createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelCard({ model }: { model: FineTunedModel }) {
  const getStatusIcon = () => {
    switch (model.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'training':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (model.status) {
      case 'completed':
        return '完了'
      case 'training':
        return '学習中'
      case 'failed':
        return '失敗'
      default:
        return '待機中'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-mono">{model.name}</CardTitle>
            <CardDescription>Base: {model.baseModel}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={model.status === 'completed' ? 'default' : 'secondary'}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {model.accuracy && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">精度:</span>
              <span className="text-green-600 font-semibold">{model.accuracy}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">作成日:</span>
            <span>{model.createdAt}</span>
          </div>
          {model.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">完了日:</span>
              <span>{model.completedAt}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1">使用</Button>
          <Button size="sm" variant="outline">詳細</Button>
          <Button size="sm" variant="destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
