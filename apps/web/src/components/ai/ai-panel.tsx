'use client'

import { useState, useRef } from 'react'
import { X, Copy, Check, RefreshCw, Settings, Play, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAIStore } from '@/stores/ai-store'
import { AIProvider, PROVIDER_CONFIG, RECOMMENDED_MODEL } from '@/lib/ai/providers'
import { cn } from '@/lib/utils'

interface AIPanelProps {
  open: boolean
  onClose: () => void
  selectedText?: string
  onInsert?: (text: string) => void
  task?: string
}

export function AIPanel({ 
  open, 
  onClose, 
  selectedText, 
  onInsert,
  task = 'content'
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const { 
    currentProvider, 
    setCurrentProvider, 
    settings,
    updateSettings,
    addUsage 
  } = useAIStore()
  
  const outputRef = useRef<HTMLDivElement>(null)
  
  const provider = currentProvider || (settings.defaultProvider as AIProvider) || 'gpt-5'
  const providerInfo = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG['gpt-5']
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    setOutput('')
    
    try {
      const fullPrompt = selectedText
        ? `${prompt}\n\n元のテキスト:\n${selectedText}`
        : prompt
      
      // APIキーをLocalStorageから取得
      let apiKey = null
      if (typeof window !== 'undefined') {
        const savedKeys = localStorage.getItem('ai_api_keys')
        if (savedKeys) {
          try {
            const keys = JSON.parse(savedKeys)
            // プロバイダー名に対応するAPIキーを取得
            const providerKeyMap: Record<string, string> = {
              'gpt-5': 'openai',
              'gpt-4.1': 'openai',
              'gpt-4o': 'openai',
              'claude-4': 'anthropic',
              'claude-3.5': 'anthropic',
              'sakurallm': 'sakurallm',
              'matsuri': 'matsuri',
              'deepseek-v2': 'deepseek',
              'qwen-jp': 'alibaba',
              'qwen': 'alibaba',
            }
            const keyField = providerKeyMap[provider]
            if (keyField) {
              apiKey = keys[keyField]
            }
          } catch (e) {
            console.error('Failed to load API keys:', e)
          }
        }
      }
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          prompt: fullPrompt,
          provider,
          model: providerInfo.defaultModel,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          apiKey,
        }),
      })

      if (!response.ok) throw new Error('Generation failed')
      if (!response.body) throw new Error('No response body')
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                setOutput(prev => prev + data.chunk)
              }
              if (data.done) {
                // Track usage
                addUsage({
                  provider,
                  tokens: data.usage?.totalTokens || 0,
                  cost: data.usage?.totalTokens ? providerInfo.costPer1K * data.usage.totalTokens / 1000 : 0,
                  task,
                })
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setOutput(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleInsert = () => {
    if (onInsert && output) {
      onInsert(output)
      onClose()
    }
  }
  
  if (!open) {
    return null
  }
  
  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">AI アシスタント</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
 
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">モデル</label>
          <Select 
            value={provider} 
            onValueChange={(v) => setCurrentProvider(v as AIProvider)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {config.name}
                    {key === RECOMMENDED_MODEL[task] && (
                      <span className="text-xs text-green-600">推奨</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            コスト：¥{providerInfo.costPer1K}/1K tokens
          </p>
        </div>
 
        {/* Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              温度：{settings.temperature.toFixed(1)}
            </label>
            <Slider
              value={[settings.temperature]}
              onValueChange={([v]) => updateSettings({ temperature: v })}
              min={0}
              max={2}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              最大トークン：{settings.maxTokens}
            </label>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([v]) => updateSettings({ maxTokens: v })}
              min={512}
              max={8192}
              step={512}
            />
          </div>
        </div>
 
        {/* Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">指示</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              task === 'mindmap'
                ? '例：時の庭園の物語構造をマインドマップで作成してください。主要キャラクター、物語の展開、テーマを含めてください。'
                : '例：この段落を推敲してください...'
            }
            rows={3}
          />
        </div>
 
        {/* Selected Text */}
        {selectedText && (
          <Card className="p-3 bg-muted">
            <p className="text-xs text-muted-foreground mb-1">選択中のテキスト:</p>
            <p className="text-sm line-clamp-3">{selectedText}</p>
          </Card>
        )}
 
        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium">生成結果</label>
          <div 
            ref={outputRef}
            className={cn(
              "min-h-[200px] p-3 border rounded-md bg-muted",
              !output && "text-muted-foreground italic"
            )}
          >
            {output || 'ここに生成結果が表示されます...'}
          </div>
        </div>
      </div>
 
      {/* Footer Actions */}
      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                生成中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                生成
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
 
        {output && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  コピー
                </>
              )}
            </Button>
            {onInsert && (
              <Button onClick={handleInsert} className="flex-1">
                挿入
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
