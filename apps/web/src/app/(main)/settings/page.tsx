'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Palette, Key, Bell, Database, User, Globe, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAIStore } from '@/stores/ai-store'
import { useLayout } from '@/lib/layout'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const { settings, updateSettings } = useAIStore()
  const { setDeviceMode } = useLayout()
  const { toast } = useToast()
  
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    alibaba: '',
    deepseek: '',
    sakurallm: '',
    matsuri: '',
  })

  // LocalStorageからAPIキーを読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_api_keys')
      if (saved) {
        try {
          setApiKeys(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to load API keys:', e)
        }
      }
    }
  }, [])

  const handleSaveAPI = () => {
    // LocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_api_keys', JSON.stringify(apiKeys))
    }
    toast({
      title: 'API キーを保存',
      description: 'API キーが保存されました',
    })
  }

  const handleSaveDisplay = (mode: string) => {
    setDeviceMode(mode as any)
    toast({
      title: '表示設定を保存',
      description: 'デバイスモードが更新されました',
    })
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">設定</h1>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">
            <Key className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="display">
            <Palette className="h-4 w-4 mr-2" />
            表示
          </TabsTrigger>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            一般
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            アカウント
          </TabsTrigger>
        </TabsList>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI API キー</CardTitle>
              <CardDescription>
                使用する AI プロバイダーの API キーを設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai">OpenAI API Key (GPT-4o)</Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anthropic">Anthropic API Key (Claude)</Label>
                <Input
                  id="anthropic"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alibaba">Alibaba Cloud API Key (Qwen)</Label>
                <Input
                  id="alibaba"
                  type="password"
                  placeholder="..."
                  value={apiKeys.alibaba}
                  onChange={(e) => setApiKeys({...apiKeys, alibaba: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deepseek">DeepSeek API Key</Label>
                <Input
                  id="deepseek"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.deepseek}
                  onChange={(e) => setApiKeys({...apiKeys, deepseek: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sakurallm">SakuraLLM API Key</Label>
                <Input
                  id="sakurallm"
                  type="password"
                  placeholder="..."
                  value={apiKeys.sakurallm}
                  onChange={(e) => setApiKeys({...apiKeys, sakurallm: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matsuri">Matsuri API Key</Label>
                <Input
                  id="matsuri"
                  type="password"
                  placeholder="..."
                  value={apiKeys.matsuri}
                  onChange={(e) => setApiKeys({...apiKeys, matsuri: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveAPI} className="w-full">
                保存
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined' && confirm('APIキーをクリアしますか？')) {
                    localStorage.removeItem('ai_api_keys')
                    setApiKeys({
                      openai: '',
                      anthropic: '',
                      alibaba: '',
                      deepseek: '',
                      sakurallm: '',
                      matsuri: '',
                    })
                    toast({
                      title: 'APIキーをクリア',
                      description: 'APIキーがクリアされました',
                    })
                  }
                }}
                className="w-full mt-2"
              >
                APIキーをクリア
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>デフォルトモデル</CardTitle>
              <CardDescription>
                主に使用する AI モデルを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={settings.defaultProvider}
                onValueChange={(v) => updateSettings({ defaultProvider: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-5">GPT-5</SelectItem>
                  <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                  <SelectItem value="claude-4">Claude 4</SelectItem>
                  <SelectItem value="claude-3.5">Claude 3.5</SelectItem>
                  <SelectItem value="sakurallm">SakuraLLM</SelectItem>
                  <SelectItem value="matsuri">Matsuri</SelectItem>
                  <SelectItem value="deepseek-v2">DeepSeek-V2</SelectItem>
                  <SelectItem value="qwen-jp">Qwen-JP</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>デバイスモード</CardTitle>
              <CardDescription>
                UI レイアウトを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動（PC/モバイル）</Label>
                  <p className="text-sm text-muted-foreground">
                    画面サイズに応じて自動切り替え
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSaveDisplay('auto')}
                >
                  選択
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>PC 最適化</Label>
                  <p className="text-sm text-muted-foreground">
                    デスクトップ向けレイアウト
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSaveDisplay('pc')}
                >
                  選択
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>モバイル最適化</Label>
                  <p className="text-sm text-muted-foreground">
                    スマートフォン向けレイアウト
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSaveDisplay('mobile')}
                >
                  選択
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>テーマ</CardTitle>
              <CardDescription>
                アプリのテーマを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Sun className="h-4 w-4 mr-2" />
                  ライト
                </Button>
                <Button variant="outline" className="flex-1">
                  <Moon className="h-4 w-4 mr-2" />
                  ダーク
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知</CardTitle>
              <CardDescription>
                通知設定を管理してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">自動保存</Label>
                <Switch id="auto-save" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">プッシュ通知</Label>
                <Switch id="notifications" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>言語</CardTitle>
              <CardDescription>
                表示言語を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select defaultValue="ja">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
              <CardDescription>
                データのエクスポート・インポート
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                データをエクスポート
              </Button>
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                データをインポート
              </Button>
              <Button variant="destructive" className="w-full">
                すべてのデータをクリア
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                アカウント情報を管理してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">ゲストユーザー</h3>
                <p className="text-sm text-muted-foreground">
                  ローカルストレージモード
                </p>
              </div>
              <Button variant="outline" className="w-full">
                ログイン
              </Button>
              <Button variant="outline" className="w-full">
                新規登録
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>サブスクリプション</CardTitle>
              <CardDescription>
                現在のプラン：無料
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                プロプランにアップグレード
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
