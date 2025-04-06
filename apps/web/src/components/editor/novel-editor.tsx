'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { Toolbar } from './toolbar'

interface NovelEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  placeholder?: string
}

/** プレーンテキストをTipTap用HTMLに変換（\n\n → <p>） */
function toHtml(text: string): string {
  if (!text) return '<p></p>'
  // すでにHTMLタグが含まれている場合はそのまま返す
  if (/<[a-z][\s\S]*>/i.test(text)) return text
  return text
    .split(/\n\n+/)
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function NovelEditor({
  content,
  onChange,
  onSave,
  placeholder = '執筆を開始...'
}: NovelEditorProps) {
  const [isVertical, setIsVertical] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [key, setKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: toHtml(content),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setWordCount(editor.getText().length)
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none outline-none',
          isVertical ? 'vertical-writing px-6 py-4' : 'px-8 py-6'
        ),
      },
    },
  }, [key, isVertical])

  // コンテンツ変更時
  useEffect(() => {
    if (!editor) return
    const html = toHtml(content)
    if (html !== editor.getHTML()) {
      editor.commands.setContent(html)
    }
  }, [content, editor])

  // 縦書き切り替え時にエディタを再作成
  useEffect(() => {
    setKey((prev: number) => prev + 1)
  }, [isVertical])

  // 縦書きモード時に .ProseMirror の高さをコンテナに固定する
  useEffect(() => {
    if (!editor || !isVertical) return

    const applyHeight = () => {
      const container = containerRef.current
      const proseMirror = editor.view.dom as HTMLElement
      if (!container || !proseMirror) return

      const h = container.clientHeight
      if (h > 0) {
        proseMirror.style.setProperty('height', `${h}px`, 'important')
        proseMirror.style.setProperty('max-height', `${h}px`, 'important')
      }
      // スクロール位置は dir="rtl" コンテナが自動的に右端（最初の列）を表示する
    }

    const timer = setTimeout(applyHeight, 50)
    window.addEventListener('resize', applyHeight)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', applyHeight)
    }
  }, [editor, isVertical, key])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSave])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Toolbar editor={editor} isVertical={isVertical} onToggleVertical={() => setIsVertical(!isVertical)} />

      {/* Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 p-2 bg-popover border rounded-md shadow-lg">
          <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
        </div>
      </BubbleMenu>

      {/* Editor */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1',
          isVertical
            ? 'overflow-x-auto overflow-y-hidden bg-paper'
            : 'overflow-y-auto'
        )}
        dir={isVertical ? 'rtl' : undefined}
      >
        {!isVertical && (
          <div className="max-w-4xl mx-auto h-full">
            <EditorContent key={key} editor={editor} />
          </div>
        )}
        {isVertical && (
          <EditorContent key={key} editor={editor} />
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{wordCount.toLocaleString()} 文字</span>
          <span>日本語</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={editor.isEditable ? 'text-green-600' : 'text-muted-foreground'}>
            {editor.isEditable ? '編集可能' : '閲覧モード'}
          </span>
          <span>•</span>
          <span>Ctrl/Cmd + S で保存</span>
        </div>
      </div>
    </div>
  )
}
