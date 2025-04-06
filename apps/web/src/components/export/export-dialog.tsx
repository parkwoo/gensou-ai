'use client'

import { useState } from 'react'
import { Download, FileText, Book, Code, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Novel, Chapter } from '@/stores/novel-store'
import { exportToMarkdown, downloadMarkdown } from '@/lib/export/markdown'

interface ExportDialogProps {
  novel: Novel
  chapters: Chapter[]
}

export function ExportDialog({ novel, chapters }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<'epub' | 'pdf' | 'markdown'>('markdown')
  const [includeCover, setIncludeCover] = useState(true)
  const [includeTOC, setIncludeTOC] = useState(true)
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'japanese'>('japanese')
  const [fontSize, setFontSize] = useState(12)
  const [lineSpacing, setLineSpacing] = useState(1.5)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (format === 'markdown') {
        const markdown = exportToMarkdown(novel, chapters)
        const filename = `${novel.title.replace(/[^a-z0-9]/gi, '_')}.md`
        downloadMarkdown(filename, markdown)
      } else if (format === 'epub') {
        // TODO: Implement EPUB export
        alert('EPUB エクスポートは準備中です')
      } else if (format === 'pdf') {
        // TODO: Implement PDF export
        alert('PDF エクスポートは準備中です')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          エクスポート
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>エクスポート</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>フォーマット</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Markdown
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="epub" id="epub" />
                <Label htmlFor="epub" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  EPUB (準備中)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  PDF (準備中)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label>オプション</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="cover">表紙を含める</Label>
              <Switch
                id="cover"
                checked={includeCover}
                onCheckedChange={setIncludeCover}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="toc">目次を含める</Label>
              <Switch
                id="toc"
                checked={includeTOC}
                onCheckedChange={setIncludeTOC}
              />
            </div>
          </div>

          {/* Output Settings */}
          <div className="space-y-4">
            <Label>出力設定</Label>
            
            <div className="space-y-2">
              <Label>フォント</Label>
              <Select value={fontFamily} onValueChange={(v: any) => setFontFamily(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="japanese">日本語 (明朝)</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>フォントサイズ：{fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={8}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>行間：{lineSpacing}</Label>
              <Slider
                value={[lineSpacing]}
                onValueChange={([v]) => setLineSpacing(v)}
                min={1}
                max={3}
                step={0.1}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>プレビュー</Label>
            <div className="border rounded-md p-4 bg-muted font-serif">
              <h1 className="text-2xl font-bold mb-2">{novel.title}</h1>
              {includeCover && novel.description && (
                <p className="text-muted-foreground mb-4">{novel.description}</p>
              )}
              {includeTOC && (
                <div className="space-y-1">
                  <h2 className="font-semibold mb-2">目次</h2>
                  {chapters.slice(0, 3).map((chapter, i) => (
                    <p key={i} className="text-sm">
                      {i + 1}. {chapter.title}
                    </p>
                  ))}
                  {chapters.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      他 {chapters.length - 3} 章...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'エクスポート中...' : 'エクスポート'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
