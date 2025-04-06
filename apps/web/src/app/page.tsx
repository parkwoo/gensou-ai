'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Book, PenTool, Sparkles, Github, Map, Network, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = () => {
    setIsInstalling(true)
    // PWA install logic would go here
    setTimeout(() => setIsInstalling(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Network className="h-6 w-6 text-primary" />
            <span>GenSou AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/settings" className="text-sm font-medium hover:text-primary">
              設定
            </Link>
            <a
              href="https://github.com/parkwoo/gensou-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary"
            >
              <Github className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
            <span className="text-primary">思考を地図にし、</span>
            <br />
            物語を綴る
          </h1>
          <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
            プロットから執筆まで、AIと創る次世代の小説エディタ。
            <br />
            GPT-5 / Claude 4 / 日本語特化LLM対応。マインドマップ連動型AI執筆アシスタント「GenSou AI」
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/editor/new">
                <Sparkles className="h-4 w-4 mr-2" />
                今すぐ無料で執筆を始める
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/mindmap/demo">
                <Map className="h-4 w-4 mr-2" />
                デモを見る
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={handleInstall}>
              {isInstalling ? 'インストール中...' : 'アプリをインストール'}
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">「書きたい」気持ちを、迷わせない。</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            こんな悩みありませんか？
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <PainPointCard
            text="プロットが複雑になりすぎて、設定矛盾が起きる"
          />
          <PainPointCard
            text="AIに書かせると、文体が不自然で「AIっぽさ」が抜けない"
          />
          <PainPointCard
            text="長編の構成案を考えるだけで、執筆が止まってしまう"
          />
        </div>
      </section>

      {/* Solution - Core Features */}
      <section className="container py-16 bg-muted/50 rounded-lg">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">GenSou AIの3つの特徴</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            プロット作成から推敲まで、執筆の全工程をサポート
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <SolutionCard
            number="01"
            icon={<Map className="h-12 w-12 text-primary" />}
            title="マインドマップ連動"
            description="物語を可視化"
            features={[
              "脳内のアイデアをドラッグ＆ドロップで構造化",
              "AIがマップを読み取り、伏線やキャラクター設定を完全把握",
              "相関図の整理や設定矛盾の防止にも最適"
            ]}
          />
          <SolutionCard
            number="02"
            icon={<Sparkles className="h-12 w-12 text-primary" />}
            title="マルチAI・日本語特化"
            description="理想の文体を追求"
            features={[
              "推論の王者 GPT-5、情緒豊かな Claude 4",
              "日本語の機微に強い Matsuri/SakuraLLM",
              "シーンに合わせて最適なAIを使い分け、人間らしい文章を実現"
            ]}
          />
          <SolutionCard
            number="03"
            icon={<PenTool className="h-12 w-12 text-primary" />}
            title="リッチエディタ"
            description="執筆に没入する環境"
            features={[
              "Notionライクな操作感で快適な執筆体験",
              "集中力を高める縦書きモード対応",
              "PWA対応でオフラインでも執筆可能"
            ]}
          />
        </div>
      </section>

      {/* Why GenSou */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">なぜGenSou AIが選ばれるのか？</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <WhyCard
            title="日本語の機微を理解"
            description="汎用AIでは難しい、日本語特有の「語尾」や「空気感」を再現"
          />
          <WhyCard
            title="設定の整合性を維持"
            description="マインドマップを参照するため、長編でも設定矛盾が起きにくい"
          />
          <WhyCard
            title="カスタマイズ性"
            description="オープンソース（MITライセンス）なので、自分専用の執筆環境を構築可能"
          />
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-8">全機能</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Book className="h-10 w-10 text-primary" />}
            title="知識ベース管理"
            description="キャラクター、設定、用語を一元管理。AIが参照して整合性を保ちます。"
          />
          <FeatureCard
            icon={<Network className="h-10 w-10 text-primary" />}
            title="プロット自動生成"
            description="マインドマップから章立て・大綱をAIが自動生成。執筆の効率が大幅アップ。"
          />
          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-primary" />}
            title="AI推敲・添削"
            description="文体の統一、表現のブラッシュアップ、誤字脱字のチェックを自動化。"
          />
          <FeatureCard
            icon={<Github className="h-10 w-10 text-primary" />}
            title="オープンソース"
            description="MIT ライセンスで公開。無料で利用でき、カスタマイズ自由。"
          />
          <FeatureCard
            icon={<Map className="h-10 w-10 text-primary" />}
            title="PWA 対応"
            description="オフライン対応。ホーム画面に追加してアプリのように使用可能。"
          />
          <FeatureCard
            icon={<PenTool className="h-10 w-10 text-primary" />}
            title="縦書きエディタ"
            description="Web小説・同人誌執筆に最適な本格的な縦書き表示を搭載。"
          />
        </div>
      </section>

      {/* AI Models Pricing */}
      <section className="container py-16 bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-4">最高の知性を、最小のコストで。</h2>
        <p className="text-center text-muted-foreground mb-8">
          対応AIモデルとコストパフォーマンス
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          <ModelCard name="GPT-5" role="主力モデル" description="最強の推論能力" cost="¥0.004/1K" featured />
          <ModelCard name="Claude 4" role="文章仕上げ" description="自然な表現" cost="¥0.005/1K" />
          <ModelCard name="Matsuri" role="日本語小説" description="日本語特化" cost="¥0.0012/1K" />
          <ModelCard name="DeepSeek-V2" role="大量生成" description="コスト重視" cost="¥0.0002/1K" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          ※ その他、GPT-4.1、Claude 3.5、SakuraLLM、Qwen-JP にも対応
        </p>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-8">よくある質問</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <FAQItem
            question="スマホでも執筆できますか？"
            answer="はい、PWA対応でアプリ同様に使えます。ブラウザからアクセスしてホーム画面に追加するだけで、どこでも執筆可能です。"
          />
          <FAQItem
            question="自分の執筆スタイルを学習させられますか？"
            answer="はい、ファインチューニング機能でご自身の文体やスタイルをAIに学習させることが可能です。"
          />
          <FAQItem
            question="外部への出力形式は？"
            answer="テキスト、Markdown等の形式で出力可能です。PDF対応も現在開発中です。"
          />
          <FAQItem
            question="料金はいくらかかりますか？"
            answer="基本機能は永続無料（MITライセンスのオープンソース）。AI利用時のみ、使用したモデルの従量課金が発生します。"
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">
            思考を解き放ち、<span className="text-primary">最高の物語</span>を。
          </h2>
          <p className="text-xl text-muted-foreground">
            今すぐ無料で執筆を開始しましょう
          </p>
          <Button size="lg" asChild>
            <Link href="/editor/new">
              <Sparkles className="h-4 w-4 mr-2" />
              執筆を開始する（無料）
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-semibold mb-2">GenSou AI - 思考を地図にし、物語を綴る。</p>
          <p>© 2025 GenSou AI. MIT License.</p>
          <p className="mt-2">
            Made with ❤️ by{' '}
            <a href="https://github.com/parkwoo" className="text-primary hover:underline">
              @parkwoo
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs">
            <span className="px-2 py-1 bg-primary/10 rounded-full">小説執筆アプリ</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">プロット作成</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">AI小説生成</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">マインドマップ</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">縦書きエディタ</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">Web小説</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">なろう 執筆ツール</span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">PWA</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function PainPointCard({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">❌ {text}</p>
    </div>
  )
}

function SolutionCard({
  number,
  icon,
  title,
  description,
  features
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <div className="relative rounded-lg border bg-background p-6 hover:shadow-lg transition-shadow">
      <div className="absolute top-4 right-4 text-4xl font-bold text-primary/20">{number}</div>
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-xl mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WhyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function ModelCard({
  name,
  role,
  description,
  cost,
  featured = false
}: {
  name: string
  role: string
  description: string
  cost: string
  featured?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 text-center hover:shadow-lg transition-all ${
      featured ? 'bg-primary/5 border-primary/50 ring-2 ring-primary/20' : 'bg-card hover:bg-accent/50'
    }`}>
      {featured && (
        <div className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-2">
          人気
        </div>
      )}
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm font-medium text-primary mt-1">{role}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <p className="text-sm font-bold text-muted-foreground mt-2">{cost}</p>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-sm text-muted-foreground border-t">
          {answer}
        </div>
      )}
    </div>
  )
}
