// lib/export/markdown.ts

import { Novel, Chapter } from '@/stores/novel-store'

export interface ExportOptions {
  includeCover: boolean
  includeTOC: boolean
  fontFamily: 'serif' | 'sans' | 'japanese'
  fontSize: number
  lineSpacing: number
}

export function exportToMarkdown(novel: Novel, chapters: Chapter[]): string {
  let markdown = ''
  
  // Title
  markdown += `# ${novel.title}\n\n`
  
  // Description
  if (novel.description) {
    markdown += `${novel.description}\n\n`
  }
  
  // Metadata
  markdown += `---\n\n`
  markdown += `**著者**: ${novel.style || '不明'}\n\n`
  markdown += `**作成日**: ${new Date(novel.createdAt).toLocaleDateString('ja-JP')}\n\n`
  markdown += `**更新日**: ${new Date(novel.updatedAt).toLocaleDateString('ja-JP')}\n\n`
  markdown += `---\n\n`
  
  // Table of Contents
  markdown += `## 目次\n\n`
  chapters.forEach((chapter, index) => {
    markdown += `${index + 1}. [${chapter.title}](#${chapter.id || `chapter-${index}`})\n`
  })
  markdown += `\n---\n\n`
  
  // Chapters
  chapters.forEach((chapter, index) => {
    markdown += `## ${chapter.title}\n\n`
    
    if (chapter.outline) {
      markdown += `### あらすじ\n\n${chapter.outline}\n\n`
    }
    
    markdown += `${chapter.content || '内容がありません'}\n\n`
    markdown += `---\n\n`
  })
  
  return markdown
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
