declare module 'elkjs/lib/elk.bundled.js' {
  export interface ElkNode {
    id?: string
    x?: number
    y?: number
    width?: number
    height?: number
    layoutOptions?: Record<string, string>
    children?: ElkNode[]
    edges?: ElkExtendedEdge[]
  }

  export interface ElkExtendedEdge {
    id?: string
    sources: string[]
    targets: string[]
  }

  export default class ELK {
    layout(graph: ElkNode): Promise<ElkNode>
  }

  export const ELK: typeof ELK
}

declare module '@xyflow/react' {
  export type Node<T = any> = {
    id: string
    position: { x: number; y: number }
    data: T
    type?: string
  }

  export type Edge = {
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    type?: string
    animated?: boolean
    style?: any
  }

  export * from 'reactflow'
}
