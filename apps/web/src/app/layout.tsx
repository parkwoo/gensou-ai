import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutProvider } from '@/lib/layout'
import { AppLayout } from '@/components/layout/app-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GenSou AI - AI小説執筆ツール｜マインドマップでプロット作成から本文生成まで',
  description: 'プロットが書けないを解決。AI小説作成アシスタント GenSou AI。GPT-5/Claude 4対応。マインドマップ連動型で視覚的なプロット作成、設定管理、AI推敲を実現。日本語小説に特化した縦書きエディタ搭載。Web小説・同人誌執筆に最適。',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  keywords: [
    '小説執筆アプリ',
    'プロット作成',
    'AI小説生成',
    'マインドマップ',
    '縦書きエディタ',
    'Web小説',
    'なろう 執筆ツール',
    '小説推敲',
    '文体学習',
    '日本語LLM',
    'GPT-5',
    'Claude 4',
    'ストーリー構成',
    '構成案作成',
    'プロット テンプレート',
    'AIアシスタント',
    'オープンソース',
    'PWA',
    'オフライン対応'
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GenSou AI',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://gensou-ai.com',
    title: 'GenSou AI - AI小説執筆ツール｜マインドマップでプロット作成から本文生成まで',
    description: 'プロットが書けないを解決。AI小説作成アシスタント GenSou AI。GPT-5/Claude 4対応。マインドマップ連動型で視覚的なプロット作成、設定管理、AI推敲を実現。',
    siteName: 'GenSou AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenSou AI - AI小説執筆ツール',
    description: 'マインドマップ連動型AI小説エディタ。プロット作成から執筆まで、AIと創る次世代の執筆環境。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <LayoutProvider>
          <AppLayout>{children}</AppLayout>
        </LayoutProvider>
      </body>
    </html>
  )
}
