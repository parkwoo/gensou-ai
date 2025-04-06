// lib/ai/providers.ts

export type AIProvider = 
  | 'gpt-5'        // 主力
  | 'gpt-4.1'      // 主力
  | 'claude-4'     // 仕上げ
  | 'claude-3.5'   // 仕上げ
  | 'sakurallm'    // 日本語特化
  | 'matsuri'      // 日本語小説向け
  | 'deepseek-v2'  // 大量生成
  | 'qwen-jp'      // 日本語特化
  
export interface AIConfig {
  provider: AIProvider
  model: string
  apiKey: string
  endpoint?: string
  maxTokens?: number
  temperature?: number
}

export const PROVIDER_CONFIG: Record<AIProvider, {
  name: string
  defaultModel: string
  costPer1K: number
  features: string[]
  recommended: string[]
  description: string
}> = {
  'gpt-5': {
    name: 'GPT-5',
    defaultModel: 'gpt-4o',
    costPer1K: 0.004,
    features: ['大綱', '章', '本文', '評価', '思考地図'],
    recommended: ['大綱', '章', '本文', '評価', '思考地図'],
    description: 'OpenAI 最新モデル。日本語・創作品質最高'
  },
  'gpt-4.1': {
    name: 'GPT-4.1',
    defaultModel: 'gpt-4-turbo',
    costPer1K: 0.003,
    features: ['大綱', '章', '本文', '評価', '思考地図'],
    recommended: ['大綱', '章', '本文', '評価', '思考地図'],
    description: 'OpenAI 安定モデル。高品質・安定'
  },
  'claude-4': {
    name: 'Claude 4',
    defaultModel: 'claude-opus-4-6',
    costPer1K: 0.005,
    features: ['推敲', 'AI感除去', '最終チェック'],
    recommended: ['推敲', 'AI感除去', '最終チェック'],
    description: 'Anthropic 最新モデル。文学的表現・自然な日本語'
  },
  'claude-3.5': {
    name: 'Claude 3.5 Sonnet',
    defaultModel: 'claude-3-5-sonnet-20241022',
    costPer1K: 0.0045,
    features: ['推敲', 'AI感除去', '最終チェック'],
    recommended: ['推敲', 'AI感除去', '最終チェック'],
    description: 'Anthropic 安定モデル。文学的表現・自然な日本語'
  },
  'sakurallm': {
    name: 'SakuraLLM',
    defaultModel: 'sakurallm-jp',
    costPer1K: 0.001,
    features: ['日本語特化', '小説', '会話'],
    recommended: ['日本語小説', '日本語会話'],
    description: '日本語特化モデル。自然な日本語生成'
  },
  'matsuri': {
    name: 'Matsuri',
    defaultModel: 'matsuri-novel',
    costPer1K: 0.0012,
    features: ['小説', '物語', '創作'],
    recommended: ['日本語小説', '物語創作'],
    description: '日本語小説向けモデル。創作に最適'
  },
  'deepseek-v2': {
    name: 'DeepSeek-V2',
    defaultModel: 'deepseek-v2-chat',
    costPer1K: 0.0002,
    features: ['大量生成', '最安'],
    recommended: ['大量生成', 'テスト'],
    description: '大量生成向け。コスト最安'
  },
  'qwen-jp': {
    name: 'Qwen-JP',
    defaultModel: 'qwen-jp',
    costPer1K: 0.0004,
    features: ['日本語特化', '知識ベース'],
    recommended: ['日本語知識', '拡張'],
    description: '日本語特化Qwenモデル。コストパフォーマンス良'
  }
}

// タスク別推奨モデル
export const RECOMMENDED_MODEL: Record<string, AIProvider> = {
  'outline': 'gpt-5',
  'chapter': 'gpt-5',
  'content': 'gpt-5',
  'refine': 'claude-4',
  'remove-ai-taste': 'claude-4',
  'expand': 'gpt-5',
  'score': 'gpt-5',
  'mindmap': 'gpt-5',
  'test': 'qwen-jp',
  'bulk': 'deepseek-v2'
}

// モデルの説明
export const TASK_DESCRIPTIONS: Record<string, { ja: string; zh: string }> = {
  'outline': {
    ja: '物語の全体構造を生成',
    zh: '生成故事整体结构'
  },
  'chapter': {
    ja: '各章节の細綱を生成',
    zh: '生成各章节细纲'
  },
  'content': {
    ja: '実際の文章を生成',
    zh: '生成实际文章'
  },
  'refine': {
    ja: '文章を美しく修正',
    zh: '美化修正文章'
  },
  'remove-ai-taste': {
    ja: 'AI っぽさを除去',
    zh: '去除 AI 痕迹'
  },
  'expand': {
    ja: '文章を拡張',
    zh: '扩展文章'
  },
  'score': {
    ja: 'AI による評価',
    zh: 'AI 评分'
  },
  'mindmap': {
    ja: 'マインドマップ生成',
    zh: '生成思维导图'
  }
}

// コスト計算
export function calculateCost(tokens: number, provider: AIProvider): number {
  return tokens * PROVIDER_CONFIG[provider].costPer1K / 1000
}

// 推定コスト（日本語）
export function getEstimatedCost(task: string, tokens: number = 1000): string {
  const provider = RECOMMENDED_MODEL[task] || 'gpt-4o'
  const cost = calculateCost(tokens, provider)
  return `¥${cost.toFixed(2)}`
}
