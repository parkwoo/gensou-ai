import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js'
import { Node, Edge } from '@xyflow/react'
import { MindMapNodeData } from './types'

const elk = new ELK()

// ELKレイアウトオプション - 最適な間隔設定
const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '180', // レイヤー間の水平方向の間隔
  'elk.spacing.nodeNode': '80', // 同一レイヤー内の垂直方向のノード間隔（コンパクトに）
  'elk.spacing.edgeNodeSpacing': '35', // エッジとノードの間隔
  'elk.spacing.edgeSpacing': '20', // エッジ同士の間隔
  // ノード配置
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
  // 交差最小化
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.crossingMinimization.semiInteractive': 'true',
  'elk.layered.crossingMinimization.greedySwitch.type': 'TWO_SIDED',
  // レイヤー分割
  'elk.layered.cycleBreaking.strategy': 'GREEDY',
  'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
  // エッジルーティング
  'elk.edgeRouting': 'SPLINES',
  'elk.layered.edgeRouting.splines.mode': 'CONSERVATIVE',
  'elk.layered.edgeRouting.splines.sloppy.layerSpacing_factor': '0.4',
  'elk.layered.edgeRouting.splines.sloppy.nodeSpacing_factor': '0.4',
  // 追加の最適化
  'elk.spacing.componentComponent': '60',
  'elk.layered.spacing.edgeEdgeSpacing': '15',
  'elk.layered.spacing.baseValue': '30',
  'elk.spacing.inLayerSpacing': '40', // レイヤー内のスペース
  // ポート設定
  'elk.portConstraints': 'FIXED_ORDER',
  'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
}

export interface LayoutedNode extends Node<MindMapNodeData> {
  position: { x: number; y: number }
}

/**
 * ReactFlowノードとエッジをELK形式に変換
 */
function convertToELKGraph(
  nodes: Node<MindMapNodeData>[],
  edges: Edge[]
): ElkNode {
  // ノードの幅と高さを推定 - コンパクトに
  const getNodeSize = (node: Node<MindMapNodeData>) => {
    const label = node.data.label || ''
    // 文字数に基づいて幅を計算（最小120、最大250）
    const width = Math.max(120, Math.min(250, label.length * 12 + 40))
    const height = 60 // コンパクトな高さ (80→60)
    return { width, height }
  }

  // ELKノードに変換
  const elkNodes = nodes.map((node) => {
    const size = getNodeSize(node)
    return {
      id: node.id,
      width: size.width,
      height: size.height,
    }
  })

  // ELKエッジに変換
  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }))

  return {
    id: 'root',
    layoutOptions,
    children: elkNodes,
    edges: elkEdges,
  }
}

/**
 * ELKレイアウト結果をReactFlowノードに変換
 */
function convertToReactFlowNodes(
  elkNode: ElkNode,
  originalNodes: Node<MindMapNodeData>[]
): LayoutedNode[] {
  return originalNodes.map((node) => {
    const elkChild = elkNode.children?.find((child: any) => child.id === node.id)

    if (elkChild && elkChild.x !== undefined && elkChild.y !== undefined) {
      return {
        ...node,
        position: {
          x: elkChild.x,
          y: elkChild.y,
        },
      }
    }

    return node as LayoutedNode
  })
}

/**
 * ELKjsを使用してノードの自動レイアウトを計算
 */
export async function calculateLayout(
  nodes: Node<MindMapNodeData>[],
  edges: Edge[]
): Promise<LayoutedNode[]> {
  try {
    // ReactFlowグラフをELK形式に変換
    const elkGraph = convertToELKGraph(nodes, edges)

    // ELKレイアウトを実行
    const layoutedGraph = await elk.layout(elkGraph)

    // ELK結果をReactFlowノードに変換
    const layoutedNodes = convertToReactFlowNodes(layoutedGraph, nodes)

    return layoutedNodes
  } catch (error) {
    console.error('ELKレイアウト計算エラー:', error)
    // エラー時は元のノードをそのまま返す
    return nodes as LayoutedNode[]
  }
}
