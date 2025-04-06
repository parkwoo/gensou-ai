'use client'

import { useState, useEffect } from 'react'
import {
  Monitor,
  Smartphone,
  Sun,
  Moon,
  BookOpen,
  Coffee,
  Mountain,
  Palette,
  Briefcase,
  Home,
  Train,
  Bed,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DeviceMode = 'pc' | 'mobile'

export type UsageScenario =
  | 'office'      // オフィス・仕事中
  | 'home'        // 自宅・リラックス
  | 'commute'     // 通勤・移動中
  | 'night'       // 夜間・暗い場所
  | 'outdoor'     // 屋外・明るい場所

export type BackgroundMode =
  | 'default'     // 標準
  | 'dark'        // ダーク
  | 'sepia'       // セピア
  | 'cafe'        // カフェ
  | 'nature'      // 自然

interface DisplaySettings {
  deviceMode: DeviceMode
  usageScenario: UsageScenario
  backgroundMode: BackgroundMode
  fontSize: number
  lineHeight: number
}

interface ScenarioOption {
  id: UsageScenario
  name: string
  icon: React.ReactNode
  description: string
  recommendedBackground: BackgroundMode
  timeRecommendation?: string
}

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'office',
    name: 'オフィス・仕事中',
    icon: <Briefcase className="h-6 w-6" />,
    description: '明るいオフィス環境での執筆',
    recommendedBackground: 'default',
    timeRecommendation: '朝〜夕方',
  },
  {
    id: 'home',
    name: '自宅・リラックス',
    icon: <Home className="h-6 w-6" />,
    description: '自宅でのんびり創作',
    recommendedBackground: 'sepia',
    timeRecommendation: '終日',
  },
  {
    id: 'commute',
    name: '通勤・移動中',
    icon: <Train className="h-6 w-6" />,
    description: '電車やバスでの移動中',
    recommendedBackground: 'default',
    timeRecommendation: '通勤時間帯',
  },
  {
    id: 'night',
    name: '夜間・暗い場所',
    icon: <Moon className="h-6 w-6" />,
    description: '就寝前や暗い部屋で',
    recommendedBackground: 'dark',
    timeRecommendation: '夜〜深夜',
  },
  {
    id: 'outdoor',
    name: '屋外・カフェ',
    icon: <Coffee className="h-6 w-6" />,
    description: 'カフェや公園など屋外',
    recommendedBackground: 'cafe',
    timeRecommendation: '昼間',
  },
]

const BACKGROUND_DESCRIPTIONS: Record<BackgroundMode, {
  name: string
  description: string
  cssClass: string
  textColor?: string
}> = {
  default: {
    name: 'スタンダード',
    description: '標準の白い背景。最も汎用性が高い。',
    cssClass: 'bg-white',
  },
  dark: {
    name: 'ダークモード',
    description: '目に優しい暗い背景。夜間の使用に最適。',
    cssClass: 'bg-gray-900',
    textColor: 'text-gray-100',
  },
  sepia: {
    name: 'セピア',
    description: '懐かしい紙の質感。長時間の執筆に。',
    cssClass: 'bg-amber-100',
  },
  cafe: {
    name: 'カフェ',
    description: '温かみのあるカフェ風。リラックス効果。',
    cssClass: 'bg-orange-50',
  },
  nature: {
    name: '自然',
    description: '落ち着いた自然色。リフレッシュしたい時に。',
    cssClass: 'bg-green-50',
  },
}

export function DisplaySettingsDialog({
  settings,
  onSettingsChange,
}: {
  settings: DisplaySettings
  onSettingsChange: (settings: DisplaySettings) => void
}) {
  const [open, setOpen] = useState(false)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(settings.deviceMode)
  const [usageScenario, setUsageScenario] = useState<UsageScenario>(settings.usageScenario)
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(settings.backgroundMode)
  const [fontSize, setFontSize] = useState(settings.fontSize)
  const [lineHeight, setLineHeight] = useState(settings.lineHeight)
  const [autoBackground, setAutoBackground] = useState(true)

  const handleSave = () => {
    onSettingsChange({
      deviceMode,
      usageScenario,
      backgroundMode,
      fontSize,
      lineHeight,
    })
    setOpen(false)
  }

  // 使用シーンに応じて背景を自動設定
  useEffect(() => {
    if (autoBackground) {
      const scenario = SCENARIO_OPTIONS.find((s) => s.id === usageScenario)
      if (scenario) {
        setBackgroundMode(scenario.recommendedBackground)
      }
    }
  }, [usageScenario, autoBackground])

  // 背景をドキュメントに適用
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-background', backgroundMode)
    root.setAttribute('data-device-mode', deviceMode)
    root.setAttribute('data-usage-scenario', usageScenario)
  }, [backgroundMode, deviceMode, usageScenario])

  const currentScenario = SCENARIO_OPTIONS.find((s) => s.id === usageScenario)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            表示設定 - 使用シーンと背景
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="scenario" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenario">使用シーン</TabsTrigger>
            <TabsTrigger value="device">デバイス</TabsTrigger>
          </TabsList>

          <TabsContent value="scenario" className="space-y-4">
            {/* デバイスモード選択 */}
            <div className="space-y-3">
              <Label>デバイスモード</Label>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`cursor-pointer transition-all ${
                    deviceMode === 'pc'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setDeviceMode('pc')}
                >
                  <CardContent className="p-4 text-center">
                    <Monitor className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">PC 最適化</div>
                    <div className="text-xs text-muted-foreground">
                      デスクトップ・ラップトップ
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    deviceMode === 'mobile'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setDeviceMode('mobile')}
                >
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">モバイル最適化</div>
                    <div className="text-xs text-muted-foreground">
                      スマートフォン・タブレット
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 使用シーン選択 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>使用シーンを選んでください</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoBackground(!autoBackground)}
                  className={autoBackground ? 'bg-primary/10' : ''}
                >
                  自動設定 {autoBackground ? 'ON' : 'OFF'}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SCENARIO_OPTIONS.map((scenario) => (
                  <Card
                    key={scenario.id}
                    className={`cursor-pointer transition-all ${
                      usageScenario === scenario.id
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setUsageScenario(scenario.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        {scenario.icon}
                      </div>
                      <div className="font-semibold text-sm">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {scenario.timeRecommendation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 推奨背景表示 */}
            {currentScenario && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">
                      {currentScenario.name} におすすめの背景
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-16 h-12 rounded border ${
                        BACKGROUND_DESCRIPTIONS[currentScenario.recommendedBackground].cssClass
                      }`}
                    />
                    <div>
                      <div className="font-medium">
                        {BACKGROUND_DESCRIPTIONS[currentScenario.recommendedBackground].name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {BACKGROUND_DESCRIPTIONS[currentScenario.recommendedBackground].description}
                      </div>
                    </div>
                    {autoBackground && (
                      <div className="ml-auto text-xs text-green-600">
                        自動で設定されます
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            {/* 背景選択 */}
            <div className="space-y-3">
              <Label>背景（手動選択）</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(BACKGROUND_DESCRIPTIONS) as BackgroundMode[]).map((mode) => (
                  <Card
                    key={mode}
                    className={`cursor-pointer transition-all ${
                      backgroundMode === mode
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setBackgroundMode(mode)
                      setAutoBackground(false)
                    }}
                  >
                    <CardContent className="p-3 text-center">
                      <div
                        className={`w-full h-16 rounded-md border mb-2 ${
                          BACKGROUND_DESCRIPTIONS[mode].cssClass
                        }`}
                      />
                      <div className="font-medium text-sm">
                        {BACKGROUND_DESCRIPTIONS[mode].name}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* フォントサイズ */}
            <div className="space-y-2">
              <Label>フォントサイズ：{fontSize}px</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">小</span>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm">大</span>
              </div>
            </div>

            {/* 行間 */}
            <div className="space-y-2">
              <Label>行間：{lineHeight}</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">狭</span>
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm">広</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* プレビュー */}
        <div className="space-y-2">
          <Label>プレビュー</Label>
          <Card className="overflow-hidden">
            <CardContent
              className={`p-4 ${
                BACKGROUND_DESCRIPTIONS[backgroundMode].cssClass
              } ${BACKGROUND_DESCRIPTIONS[backgroundMode].textColor || ''}`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
            >
              <p className="mb-2">
                これはプレビューテキストです。選択した設定が
                どのように表示されるかを確認できます。
              </p>
              <p className="text-sm opacity-80">
                使用シーン：{currentScenario?.name} | デバイス：{deviceMode === 'pc' ? 'PC' : 'モバイル'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
