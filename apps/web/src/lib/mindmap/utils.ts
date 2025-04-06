// lib/mindmap/utils.ts

import { NodeType, MindMapNodeData, MindMapNode } from './types'

export { NodeType }

let nodeIdCounter = 0

export function createRootNode(
  label: string,
  position: { x: number; y: number },
  content?: string
): MindMapNode {
  return {
    id: `root-${Date.now()}-${nodeIdCounter++}`,
    type: 'custom',
    data: {
      label,
      content,
      type: NodeType.ROOT,
    },
    position,
  }
}

export function createChapterNode(
  label: string,
  parentPosition: { x: number; y: number },
  parentId: string,
  content?: string
): MindMapNode {
  return {
    id: `chapter-${Date.now()}-${nodeIdCounter++}`,
    type: 'custom',
    data: {
      label,
      content,
      type: NodeType.CHAPTER,
      parentId,
    },
    position: {
      x: parentPosition.x + 600,
      y: parentPosition.y + Math.random() * 300 - 150,
    },
  }
}

export function createNoteNode(
  label: string,
  parentPosition: { x: number; y: number },
  parentId: string,
  content?: string
): MindMapNode {
  return {
    id: `note-${Date.now()}-${nodeIdCounter++}`,
    type: 'custom',
    data: {
      label,
      content,
      type: NodeType.NOTE,
      parentId,
    },
    position: {
      x: parentPosition.x + 600,
      y: parentPosition.y + 300 + Math.random() * 150,
    },
  }
}

export function nodeTypeToJapanese(type: NodeType): string {
  switch (type) {
    case NodeType.ROOT:
      return 'ルート'
    case NodeType.OUTLINE:
      return 'アウトライン'
    case NodeType.CHAPTER:
      return '章'
    case NodeType.NOTE:
      return 'メモ'
    default:
      return '不明'
  }
}

export function exportMindMapToMarkdown(nodes: MindMapNode[], edges: any[]): string {
  const rootNodes = nodes.filter((n) => !n.data.parentId)
  
  function buildMarkdown(node: MindMapNode, depth: number = 0): string {
    const indent = '  '.repeat(depth)
    const prefix = depth === 0 ? '# ' : depth === 1 ? '## ' : '- '
    let markdown = `${indent}${prefix}${node.data.label}\n`
    
    if (node.data.content) {
      markdown += `${indent}  ${node.data.content}\n\n`
    }
    
    const children = nodes.filter((n) => n.data.parentId === node.id)
    children.forEach((child) => {
      markdown += buildMarkdown(child, depth + 1)
    })
    
    return markdown
  }
  
  let result = '# 小説構成\n\n'
  rootNodes.forEach((root) => {
    result += buildMarkdown(root)
  })
  
  return result
}

export function importMindMapFromMarkdown(markdown: string): { nodes: MindMapNode[]; edges: any[] } {
  const nodes: MindMapNode[] = []
  const edges: any[] = []
  const lines = markdown.split('\n').filter((line) => line.trim())
  
  // 各レベルの親ノードと子ノード数を追跡
  const parentStack: { level: number; id: string; childCount: number }[] = []
  let rootNodeCount = 0
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    // 見出しレベルを検出 (# = level 1, ## = level 2, etc.)
    let level = 0
    let content = trimmedLine
    
    if (trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^(#+)\s*(.*)$/)
      if (match) {
        level = match[1].length
        content = match[2]
      }
    } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      // 箇条書きは最下層レベルとして扱う
      const match = trimmedLine.match(/^[-\*]\s*(.*)$/)
      if (match) {
        level = 10 // 箇条書きを特別な深いレベルとして扱う
        content = match[1]
      }
    }
    
    if (!content) return
    
    // レベル1（# タイトル）はルートノードとして作成
    if (level === 1) {
      const yPosition = 200 + rootNodeCount * 400
      const node = createRootNode(content, { x: 200, y: yPosition })
      nodes.push(node)
      rootNodeCount++
      
      // スタックをクリアしてこのノードを追加
      parentStack.length = 0
      parentStack.push({ level: 1, id: node.id, childCount: 0 })
    } else if (level > 1) {
      // 現在のレベルより浅いまたは同じレベルのノードをスタックから削除
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop()
      }
      
      // 親ノードを取得
      const parent = parentStack[parentStack.length - 1]
      
      if (parent) {
        const parentNode = nodes.find((n) => n.id === parent.id)
        if (parentNode) {
          // 親の子ノード数に基づいて位置を計算
          const siblingIndex = parent.childCount
          const xPosition = parentNode.position.x + 600
          const yPosition = parentNode.position.y + (siblingIndex - parent.childCount / 2) * 300
          
          // レベル10（箇条書き）はノートノードとして作成
          let node: MindMapNode
          if (level === 10) {
            node = {
              id: `note-${Date.now()}-${Math.random()}`,
              type: 'custom',
              data: {
                label: content,
                content: undefined,
                type: NodeType.NOTE,
                parentId: parent.id,
              },
              position: { x: xPosition, y: yPosition + 300 }
            }
          } else {
            node = {
              id: `chapter-${Date.now()}-${Math.random()}`,
              type: 'custom',
              data: {
                label: content,
                content: undefined,
                type: NodeType.CHAPTER,
                parentId: parent.id,
              },
              position: { x: xPosition, y: yPosition }
            }
          }
          
          nodes.push(node)
          edges.push({
            id: `e-${parent.id}-${node.id}`,
            source: parent.id,
            target: node.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          })
          
          // 親の子ノード数を増やす
          parent.childCount++
          
          // このノードを親スタックに追加（箇条書きでない場合）
          if (level !== 10) {
            parentStack.push({ level, id: node.id, childCount: 0 })
          }
        }
      }
    }
  })
  
  return { nodes, edges }
}

// AI生成されたJSONからマインドマップノードを作成
export function parseAIMindMapJSON(jsonText: string): { nodes: MindMapNode[]; edges: any[] } | null {
  try {
    console.log('[parseAIMindMapJSON] Input:', jsonText.substring(0, 200))

    // JSONを抽出（```json...```ブロックがあれば除去）
    let cleanedText = jsonText

    // 複数行のJSONブロックを抽出
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      cleanedText = jsonMatch[1]
    } else {
      // ```がなければそのまま
      cleanedText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    }

    cleanedText = cleanedText.trim()
    console.log('[parseAIMindMapJSON] Cleaned:', cleanedText.substring(0, 200))

    const data = JSON.parse(cleanedText)
    console.log('[parseAIMindMapJSON] Parsed data:', data)

    if (!data.nodes || !Array.isArray(data.nodes)) {
      console.error('Invalid AI mind map format: missing nodes array')
      return null
    }

    const nodes: MindMapNode[] = []
    const edges: any[] = []
    const nodeMap = new Map<string, { id: string; position: { x: number; y: number } }>()
    let rootNodeCount = 0

    // まずすべてのノードを作成
    data.nodes.forEach((item: any, index: number) => {
      if (!item.label) return

      const id = item.id || `ai-node-${Date.now()}-${index}`
      const parentId = item.parentId

      // 位置を計算
      let position: { x: number; y: number }
      if (!parentId) {
        // ルートノード
        position = { x: 250, y: 150 + rootNodeCount * 400 }
        rootNodeCount++
      } else {
        // 子ノード - 親の位置を基準に計算
        const parentData = nodeMap.get(parentId)
        if (parentData) {
          const siblings = data.nodes.filter((n: any) => n.parentId === parentId)
          const siblingIndex = siblings.findIndex((n: any) => n.id === item.id || n.label === item.label)
          const totalSiblings = siblings.length

          position = {
            x: parentData.position.x + 500,
            y: parentData.position.y + (siblingIndex - totalSiblings / 2) * 200
          }
        } else {
          position = { x: 250, y: 150 }
        }
      }

      // ノードタイプを決定
      let nodeType: NodeType
      if (!parentId) {
        nodeType = NodeType.ROOT
      } else if (item.label.includes('キャラクター') || item.label.includes('人物')) {
        nodeType = NodeType.CHAPTER
      } else {
        nodeType = NodeType.NOTE
      }

      const node: MindMapNode = {
        id,
        type: 'custom',
        data: {
          label: item.label,
          content: item.description || undefined,
          type: nodeType,
          parentId: parentId || undefined,
        },
        position,
      }

      nodes.push(node)
      nodeMap.set(item.id || id, { id, position })
    })

    // エッジを作成
    nodes.forEach((node) => {
      if (node.data.parentId) {
        const parent = nodes.find((n) => n.id === node.data.parentId || n.data.label === node.data.parentId)
        if (parent) {
          edges.push({
            id: `ai-e-${parent.id}-${node.id}`,
            source: parent.id,
            target: node.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          })
        }
      }
    })

    return { nodes, edges }
  } catch (error) {
    console.error('Failed to parse AI mind map JSON:', error)
    return null
  }
}

