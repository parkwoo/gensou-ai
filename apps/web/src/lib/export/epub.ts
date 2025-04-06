// lib/export/epub.ts

import { Novel, Chapter } from '@/stores/novel-store'

export interface EPUBOptions {
  title: string
  author: string
  language: string
  cover?: Blob
  chapters: Chapter[]
}

export function generateEPUB(novel: Novel, chapters: Chapter[]): Blob {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(novel.title)}</title>
  <meta charset="utf-8"/>
  <style>
    body { font-family: "MS Mincho", serif; line-height: 1.8; }
    h1 { text-align: center; margin: 2em 0; }
    h2 { text-align: left; margin: 1.5em 0 1em; }
    p { text-indent: 1em; margin: 0.5em 0; }
  </style>
</head>
<body>
  <h1>${escapeXml(novel.title)}</h1>
  ${novel.description ? `<p>${escapeXml(novel.description)}</p>` : ''}
  ${chapters.map(chapter => `
    <section>
      <h2>${escapeXml(chapter.title)}</h2>
      ${chapter.content ? `<div>${escapeXml(chapter.content)}</div>` : ''}
    </section>
  `).join('')}
</body>
</html>`

  return new Blob([content], { type: 'application/xhtml+xml' })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function downloadEPUB(filename: string, content: Blob) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

// TODO: Implement full EPUB format with OPF, NCX, and proper structure
// This is a simplified version for demonstration
