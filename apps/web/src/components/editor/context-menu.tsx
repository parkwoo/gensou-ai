'use client'

import { useState } from 'react'
import {
  Sparkles,
  PenTool,
  Expand,
  Shrink,
  CheckCircle,
  AlertCircle,
  Wand2,
  MessageSquare,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

interface ContextMenuProps {
  children: React.ReactNode
  selectedText?: string
  onAction: (action: string) => void
}

export function ContextMenu({ children, selectedText, onAction }: ContextMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {selectedText ? (
          <>
            <DropdownMenuLabel>
              「{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}」に対する操作
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* 润色メニュー */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Wand2 className="h-4 w-4 mr-2" />
                润色
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onAction('refine')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  文章を美しく
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('remove-ai-taste')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  去 AI 味
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('expand')}>
                  <Expand className="h-4 w-4 mr-2" />
                  扩写
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('condense')}>
                  <Shrink className="h-4 w-4 mr-2" />
                  簡潔に
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* 評価メニュー */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <CheckCircle className="h-4 w-4 mr-2" />
                評価
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onAction('score')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI 评分
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('check-consistency')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  一貫性チェック
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('suggest-improvements')}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  改善提案
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* 対話メニュー */}
            <DropdownMenuItem onClick={() => onAction('chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              AI に相談
            </DropdownMenuItem>

            {/* 知識ベース */}
            <DropdownMenuItem onClick={() => onAction('add-to-knowledge')}>
              <BookOpen className="h-4 w-4 mr-2" />
              知識ベースに追加
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>クイックアクション</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => onAction('new-chapter')}>
              <BookOpen className="h-4 w-4 mr-2" />
              新しい章节
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('generate-outline')}>
              <PenTool className="h-4 w-4 mr-2" />
              大纲を生成
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('ai-chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              AI チャット
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('knowledge-base')}>
              <BookOpen className="h-4 w-4 mr-2" />
              知識ベース
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
