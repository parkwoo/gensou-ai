import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// 悪用防止：禁止キーワード（小説以外の用途）
const BLOCKED_PATTERNS = [
  // セキュリティ攻撃
  /hack(ing)?|exploit|malware|脆弱性.*攻撃|ウイルス.*作成|マルウェア.*コード/i,
  // 違法行為
  /爆弾.*作り方|麻薬.*製造|違法.*薬物|武器.*製造/i,
  // プロンプトインジェクション
  /ignore.*previous.*instructions|前の指示を無視|システムプロンプト.*無効|DAN|jailbreak/i,
  // スパム・詐欺
  /フィッシング.*メール|詐欺.*スクリプト|スパム.*生成/i,
  // コード生成（小説と無関係）
  /SELECT.*FROM.*WHERE|<script>|eval\(|exec\(|__import__/i,
]

function isBlockedPrompt(prompt: string): boolean {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      console.log('[BlockFilter] Blocked by pattern:', pattern)
      return true
    }
  }
  return false
}

// 全システムプロンプトに共通で付加するガード文
const GUARD_SUFFIX = `

【重要な制約】
あなたは小説・創作専用のアシスタントです。以下の依頼は必ず丁重に断り、小説執筆の支援のみを行ってください：
- ハッキング・サイバー攻撃・マルウェア・セキュリティ侵害に関する内容
- 違法行為・犯罪・危険物製造に関する内容
- 詐欺・スパム・フィッシングに関する内容
- プログラムコードの生成（ただし、小説の構造化データとしてのJSON出力は除く）
- 小説・創作と全く無関係な依頼（技術文書、ビジネス文書、学術論文など）

許可される出力：
- 小説の本文・構成・キャラクター設定
- JSON形式のマインドマップ・構造データ（小説の構造整理のため）

断る場合は「申し訳ありませんが、このアプリは小説執筆専用です。小説の執筆・推敲・構成についてお手伝いします。」とだけ返答してください。`

// タスク別システムプロンプト（小説家レベルの文章生成）
const SYSTEM_PROMPTS: Record<string, string> = {
  content: `あなたは直木賞・芥川賞レベルの日本語小説家です。以下の原則に従って執筆してください：

【文体・表現】
- 五感（視覚・聴覚・嗅覚・触覚・味覚）を駆使した描写
- 比喩・擬人化・体言止めを効果的に使用
- 余白と行間を大切にし、説明しすぎない
- 登場人物の感情は直接述べず、行動・表情・情景で示す（「見せる」技法）
- 会話文は生きた言葉として、個性・時代背景・関係性を反映させる

【構成・リズム】
- 文の長短を意図的に組み合わせ、緩急をつける
- 段落の切れ目で読者の呼吸を整える
- 伏線と回収を意識した展開
- 場面転換は自然かつ効果的に

【品質基準】
- AI感（同じ表現の繰り返し、過度な説明、平板な展開）を徹底排除
- 時代考証・地理的描写の正確さ
- キャラクターの言動の一貫性と深み
- 読後感・余韻を重視

指示された内容のみを出力し、説明・補足・コメントは不要です。` + GUARD_SUFFIX,

  refine: `あなたは優れた日本語の文章編集者です。与えられた文章を、文学的に洗練させてください：
- AI臭さ（同じ表現の反復、説明過多、平板な感情描写）を除去
- より鮮やかな比喩・描写に置き換える
- リズムと緩急を整える
- 原文の意図・内容は保ちながら、表現を高める

修正後の文章のみを出力してください。` + GUARD_SUFFIX,

  'remove-ai-taste': `あなたは日本語文章の専門家です。以下の文章からAI生成特有の特徴を除去してください：
除去すべき特徴：同じ構文の繰り返し、「〜でした。〜でした。」の単調さ、過度な感情説明、ありきたりな比喩、接続詞の多用
人間が書いたような自然な文章に書き直してください。原文の内容は変えないでください。

修正後の文章のみを出力してください。` + GUARD_SUFFIX,

  outline: `あなたは経験豊富な小説構成家です。魅力的な物語の骨格を設計してください：
- 三幕構成または起承転結を意識
- 主人公の変容弧（character arc）を明確に
- 伏線と回収のポイントを設計
- 読者を引き込む各章のフックを考案

構成案のみを出力してください。` + GUARD_SUFFIX,

  expand: `あなたは日本語小説家です。与えられた文章や場面を、品質を落とさず自然に拡張してください：
- 既存の文体・トーンを完全に踏襲
- 描写を豊かにし、場面に奥行きを加える
- キャラクターの内面をより掘り下げる
- 追加した部分が違和感なく溶け込むように

拡張後の文章全体を出力してください。` + GUARD_SUFFIX,

  mindmap: `あなたは小説のマインドマップ作成支援アシスタントです。指示に基づいて、構造化されたマインドマップをJSON形式で出力してください。

【出力形式】以下のJSON構造で出力してください：
\`\`\`json
{
  "nodes": [
    {"id": "root", "type": "root", "label": "メインテーマ"},
    {"id": "1", "parentId": "root", "label": "サブテーマ1"},
    {"id": "2", "parentId": "root", "label": "サブテーマ2"},
    {"id": "1-1", "parentId": "1", "label": "詳細1"},
    {"id": "1-2", "parentId": "1", "label": "詳細2"}
  ]
}
\`\`\`

【マインドマップ作成原則】
- 中心テーマ（root）から階層的に展開
- 各ノードは簡潔なラベル（10〜20文字以内）
- 階層レベルは最大4階層まで
- 兄弟ノードは3〜7個が理想
- 重要なテーマは上位階層に配置
- 因果関係・関連性を意識した構成

【既存マップへの追加】
ユーザーが「現在のマインドマップ構造」を提示した場合：
- 既存ノードをすべて含め、指示に基づいて新しいノードを追加する
- 既存のルートノードIDを維持し、それに対して新規ノードを子として追加
- 既存のノードとその親子関係を保持する
- ユーザーの指示が「追加」系の場合、既存構造は必ず含めること

重要：ユーザーが既存構造を提示した場合、必ずそのノードを全て含めて出力してください。削除したり省略したりしないでください。

【小説のマインドマップ例】
- root: 作品タイトル
  - L1: 主要キャラクター
    - L2: 主人公
      - L3: 性格・背景
      - L3: 変容弧（成長）
    - L2: ライバル
  - L1: 物語構造
    - L2: 序盤（導入）
    - L2: 中盤（展開）
    - L2: 終盤（クライマックス）
  - L1: テーマ・象徴
    - L2: 核心的テーマ
    - L2: 重要なモチーフ

JSONのみを出力してください。説明・コメント不要。` + GUARD_SUFFIX,
}

const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPTS.content

function encodeSSE(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

function sendChunk(controller: ReadableStreamDefaultController, text: string) {
  controller.enqueue(encodeSSE({ chunk: text }))
}

function sendDone(controller: ReadableStreamDefaultController, totalTokens: number) {
  controller.enqueue(encodeSSE({ done: true, usage: { totalTokens } }))
}

async function handleOpenAI(
  controller: ReadableStreamDefaultController,
  { prompt, model, temperature, maxTokens, apiKey, baseUrl = 'https://api.openai.com', systemPrompt }: {
    prompt: string
    model: string
    temperature: number
    maxTokens: number
    apiKey: string
    baseUrl?: string
    systemPrompt: string
  }
) {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error (${response.status}): ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let totalTokens = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6))
          const chunk = data.choices?.[0]?.delta?.content
          if (chunk) sendChunk(controller, chunk)
          if (data.usage?.total_tokens) totalTokens = data.usage.total_tokens
        } catch { /* ignore parse errors */ }
      }
    }
  }

  sendDone(controller, totalTokens)
}

async function handleAnthropic(
  controller: ReadableStreamDefaultController,
  { prompt, model, temperature, maxTokens, apiKey, systemPrompt }: {
    prompt: string
    model: string
    temperature: number
    maxTokens: number
    apiKey: string
    systemPrompt: string
  }
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let totalTokens = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'content_block_delta' && data.delta?.text) {
            sendChunk(controller, data.delta.text)
          }
          if (data.type === 'message_delta' && data.usage) {
            totalTokens = (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0)
          }
        } catch { /* ignore parse errors */ }
      }
    }
  }

  sendDone(controller, totalTokens)
}

async function handleQwen(
  controller: ReadableStreamDefaultController,
  { prompt, temperature, maxTokens, apiKey, systemPrompt }: {
    prompt: string
    temperature: number
    maxTokens: number
    apiKey: string
    systemPrompt: string
  }
) {
  // DashScope 国際版エンドポイント（中国外のAPIキーはこちら）
  // 中国リージョンのキーは https://dashscope.aliyuncs.com/compatible-mode を使用
  await handleOpenAI(controller, {
    prompt,
    model: 'qwen-turbo',
    temperature,
    maxTokens,
    apiKey,
    systemPrompt,
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode',
  })
}

export async function POST(req: NextRequest) {
  const { task, prompt, provider, model, temperature = 0.7, maxTokens = 2048, apiKey } =
    await req.json()

  const systemPrompt = SYSTEM_PROMPTS[task] ?? DEFAULT_SYSTEM_PROMPT

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!apiKey) {
          sendChunk(controller, 'APIキーが設定されていません。設定画面でAPIキーを入力してください。')
          sendDone(controller, 0)
          return
        }

        if (!prompt) {
          sendChunk(controller, '指示を入力してください。')
          sendDone(controller, 0)
          return
        }

        // 悪用防止チェック
        if (isBlockedPrompt(prompt)) {
          sendChunk(controller, '申し訳ありませんが、このアプリは小説執筆専用です。小説の執筆・推敲・構成についてお手伝いします。')
          sendDone(controller, 0)
          return
        }

        switch (provider) {
          case 'gpt-5':
          case 'gpt-4.1':
          case 'gpt-4o':
            await handleOpenAI(controller, { prompt, model, temperature, maxTokens, apiKey, systemPrompt })
            break

          case 'claude-4':
          case 'claude-3.5':
            await handleAnthropic(controller, { prompt, model, temperature, maxTokens, apiKey, systemPrompt })
            break

          case 'deepseek-v2':
            await handleOpenAI(controller, {
              prompt,
              model: 'deepseek-chat',
              temperature,
              maxTokens,
              apiKey,
              systemPrompt,
              baseUrl: 'https://api.deepseek.com',
            })
            break

          case 'qwen-jp':
          case 'qwen':
            await handleQwen(controller, { prompt, temperature, maxTokens, apiKey, systemPrompt })
            break

          case 'sakurallm':
          case 'matsuri':
            sendChunk(controller, `${provider} はまだAPIが公開されていないためサポート外です。別のモデルをお選びください。`)
            sendDone(controller, 0)
            break

          default:
            sendChunk(controller, `未対応のプロバイダー: ${provider}`)
            sendDone(controller, 0)
        }
      } catch (error) {
        sendChunk(
          controller,
          `エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`
        )
        sendDone(controller, 0)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
