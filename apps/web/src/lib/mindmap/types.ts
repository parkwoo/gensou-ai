// lib/mindmap/types.ts
import React from 'react'

export enum NodeType {
  ROOT = 'root',
  OUTLINE = 'outline',
  CHAPTER = 'chapter',
  NOTE = 'note',
}

export interface MindMapNodeData {
  label: string
  content?: string
  type: NodeType
  parentId?: string
  order?: number
  novelId?: string
  chapterId?: string
}

export interface MindMapNode {
  id: string
  type: string  // ReactFlowのカスタムノードタイプ名（'custom'）
  data: MindMapNodeData
  position: { x: number; y: number }
}

export interface MindMapEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  style?: React.CSSProperties
}
