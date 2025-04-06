'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Trash2, Edit2, LayoutGrid, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NodeType,
  MindMapNodeData,
  createRootNode,
  createChapterNode,
  createNoteNode,
} from '@/lib/mindmap/utils'
import { MindMapNode, MindMapEdge } from '@/lib/mindmap/types'
import { calculateLayout, LayoutedNode } from '@/lib/mindmap/layout'

interface MindMapProps {
  novelId: string
  initialNodes?: Node<MindMapNodeData>[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node<MindMapNodeData>[], edges: Edge[]) => void
}

export function MindMap({
  novelId,
  initialNodes = [],
  initialEdges = [],
  onSave
}: MindMapProps) {
  // 古いハンドルIDを新しいIDに変換
  const migratedEdges = initialEdges.map(edge => {
    const newEdge = { ...edge }

    // 古いハンドルIDのマッピング - source-XXX形式もXXX-source形式も両方対応
    const sourceHandleMapping: Record<string, string> = {
      'source-top': 'top-source',
      'source-right': 'right-source',
      'source-bottom': 'bottom-source',
      'source-left': 'left-source',
      'top-source': 'top-source',
      'right-source': 'right-source',
      'bottom-source': 'bottom-source',
      'left-source': 'left-source',
    }

    const targetHandleMapping: Record<string, string> = {
      'target-top': 'top',
      'target-right': 'right',
      'target-bottom': 'bottom',
      'target-left': 'left',
      'top': 'top',
      'right': 'right',
      'bottom': 'bottom',
      'left': 'left',
    }

    if (newEdge.sourceHandle && sourceHandleMapping[newEdge.sourceHandle]) {
      newEdge.sourceHandle = sourceHandleMapping[newEdge.sourceHandle]
    }

    if (newEdge.targetHandle && targetHandleMapping[newEdge.targetHandle]) {
      newEdge.targetHandle = targetHandleMapping[newEdge.targetHandle]
    }

    // 自動レイアウト後と同じスタイルに統一
    newEdge.type = 'default'
    newEdge.animated = false
    newEdge.style = { stroke: '#94a3b8', strokeWidth: 2 }

    return newEdge
  })
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(migratedEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'default', // ベジェ曲線
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const addRootNode = () => {
    const yOffset = nodes.filter(n => !n.data.parentId).length * 350
    const newNode = createRootNode(`新しいテーマ`, { x: 200, y: 200 + yOffset })
    setNodes((nds) => [...nds, newNode])
  }

  const addChapterNode = (parentNode?: Node) => {
    if (!parentNode) return

    const newNode = createChapterNode(
      `新しい章`,
      parentNode.position,
      parentNode.id
    )

    setNodes((nds) => [...nds, newNode])

    if (parentNode) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${parentNode.id}-${newNode.id}`,
          source: parentNode.id,
          target: newNode.id,
          type: 'default', // ベジェ曲線
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        },
      ])
    }
  }

  const addNoteNode = (parentNode?: Node) => {
    if (!parentNode) return

    const newNode = createNoteNode(
      `メモ`,
      parentNode.position,
      parentNode.id
    )

    setNodes((nds) => [...nds, newNode])
    setEdges((eds) => [
      ...eds,
      {
        id: `e-${parentNode.id}-${newNode.id}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'default', // ベジェ曲線
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ])
  }

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
  }

  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label },
          }
        }
        return node
      })
    )
  }

  const autoLayout = async () => {
    // ELKjsを使用した自動レイアウト（ameliorate-mainを参考）
    try {
      console.log('=== 自動レイアウト開始 ===')
      console.log('元のノード:', nodes.map(n => ({ id: n.id, pos: n.position })))
      console.log('元のエッジ:', edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })))
      
      const layoutedNodes = await calculateLayout(nodes, edges)
      
      console.log('レイアウト後のノード:', layoutedNodes.map(n => ({ id: n.id, pos: n.position })))
      
      // エッジを再描画：ノードの相対位置に基づいて最適なハンドルを選択
      const newEdges = edges.map((edge, index) => {
        const sourceNode = layoutedNodes.find(n => n.id === edge.source)
        const targetNode = layoutedNodes.find(n => n.id === edge.target)

        if (!sourceNode || !targetNode) {
          console.warn(`ノードが見つかりません: source=${edge.source}, target=${edge.target}`)
          return edge
        }

        // ソースノードとターゲットノードの相対位置を計算
        const dx = targetNode.position.x - sourceNode.position.x
        const dy = targetNode.position.y - sourceNode.position.y

        console.log(`エッジ ${edge.id}: dx=${dx.toFixed(0)}, dy=${dy.toFixed(0)}`)

        // 相対位置に基づいて最適なハンドルを決定
        let sourceHandle = 'right-source'
        let targetHandle = 'left'

        // 水平方向と垂直方向の距離を比較
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平方向の移動が大きい場合
          if (dx > 0) {
            sourceHandle = 'right-source'
            targetHandle = 'left'
            console.log(`  → 水平（右）: ${sourceHandle} → ${targetHandle}`)
          } else {
            sourceHandle = 'left-source'
            targetHandle = 'right'
            console.log(`  → 水平（左）: ${sourceHandle} → ${targetHandle}`)
          }
        } else {
          // 垂直方向の移動が大きい場合
          if (dy > 0) {
            sourceHandle = 'bottom-source'
            targetHandle = 'top'
            console.log(`  → 垂直（下）: ${sourceHandle} → ${targetHandle}`)
          } else {
            sourceHandle = 'top-source'
            targetHandle = 'bottom'
            console.log(`  → 垂直（上）: ${sourceHandle} → ${targetHandle}`)
          }
        }

        // エッジIDを変更して強制的に再描画
        return {
          ...edge,
          id: `${edge.source}-${edge.target}-${Date.now()}-${index}`,
          sourceHandle,
          targetHandle,
          type: 'default', // ベジェ曲線で滑らかに
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          data: undefined,
        }
      })
      
      console.log('新しいエッジ:', newEdges.map(e => ({
        id: e.id,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })))
      
      console.log('=== 更新前の状態確認 ===')
      console.log('layoutedNodes:', layoutedNodes.length)
      console.log('newEdges:', newEdges.length)
      
      // ノードとエッジを同時に更新
      setNodes(layoutedNodes)
      setEdges(newEdges)
      
      console.log('=== 状態更新完了 ===')
      
      // React Flowの更新を待つために少し遅延させてから親コンポーネントに通知
      // これにより、自動レイアウト後のデータが確実に保存可能になる
      setTimeout(() => {
        console.log('=== onSave呼び出し ===')
        console.log('保存するノード数:', layoutedNodes.length)
        console.log('保存するエッジ数:', newEdges.length)
        onSave?.(layoutedNodes as Node<MindMapNodeData>[], newEdges)
        console.log('=== 自動レイアウト完了 ===')
      }, 100)
    } catch (error) {
      console.error('レイアウト計算エラー:', error)
    }
  }

  const handleSave = async () => {
    // 親コンポーネントのコールバックを呼び出してデータを更新
    onSave?.(nodes as Node<MindMapNodeData>[], edges)

    // 直接サーバーに保存
    try {
      const API_BASE_URL = 'http://localhost:8000'
      const dataToSave = {
        outline: JSON.stringify({ nodes, edges })
      }

      const response = await fetch(`${API_BASE_URL}/api/novels/${novelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        console.error('Failed to save novel:', response.statusText)
        alert('保存に失敗しました')
        return
      }

      console.log('マインドマップを保存しました')
      alert('保存しました')
    } catch (error) {
      console.error('Error saving novel:', error)
      alert('保存に失敗しました')
    }
  }

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), [])

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Controls className="!bg-background !border !border-border [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        
        <Panel position="top-left" className="bg-background border rounded-lg p-2 shadow-lg">
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={addRootNode} className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              ルート追加
            </Button>
            <Button
              size="sm"
              onClick={() => addChapterNode(selectedNode || undefined)}
              disabled={!selectedNode}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              章追加
            </Button>
            <Button 
              size="sm" 
              onClick={() => addNoteNode(selectedNode || undefined)}
              disabled={!selectedNode}
              variant="outline"
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              メモ追加
            </Button>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-background border rounded-lg p-2 shadow-lg">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={autoLayout}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              自動レイアウト
            </Button>
            <Button size="sm" variant="outline" onClick={handleSave}>
              <Download className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-left" className="bg-background border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Input
                value={selectedNode.data.label}
                onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                className="w-48"
                placeholder="ノード名..."
              />
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

// Custom Node Component - 高品質デザイン
function CustomNode({ id, data, selected }: { id: string; data: any; selected: boolean }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case NodeType.ROOT:
        return {
          container: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-200',
          border: selected ? 'border-violet-400 shadow-lg shadow-violet-300' : 'border-violet-300',
          icon: '📚'
        }
      case NodeType.CHAPTER:
        return {
          container: 'bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-800 border-blue-200',
          border: selected ? 'border-blue-400 shadow-lg shadow-blue-200' : 'border-blue-200',
          icon: '📖'
        }
      case NodeType.NOTE:
        return {
          container: 'bg-gradient-to-br from-amber-50 to-orange-50 text-slate-700 border-amber-200',
          border: selected ? 'border-amber-400 shadow-lg shadow-amber-200' : 'border-amber-200',
          icon: '💡'
        }
      default:
        return {
          container: 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-800 border-slate-300',
          border: selected ? 'border-slate-400 shadow-lg shadow-slate-300' : 'border-slate-300',
          icon: '📄'
        }
    }
  }

  const style = getNodeStyle()

  return (
    <>
      {/* 4方向のハンドル - 目立たないデザイン */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />

      {/* ノード本体 - 高品質デザイン */}
      <div
        className={`
          relative px-4 py-2.5 rounded-xl shadow-md border-2
          transition-all duration-200 ease-out
          ${style.container} ${style.border}
          ${selected ? 'scale-105' : 'hover:scale-102 hover:shadow-lg'}
        `}
        style={{ minWidth: '140px', maxWidth: '240px' }}
      >
        {/* アイコンとラベル */}
        <div className="flex items-center gap-2">
          <span className="text-lg opacity-90">{style.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight truncate">{data.label}</div>
            {data.content && (
              <div className="text-xs mt-1 opacity-75 line-clamp-2 leading-snug">
                {data.content}
              </div>
            )}
          </div>
        </div>

        {/* 選択時のハイライト効果 */}
        {selected && (
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur -z-10" />
        )}
      </div>

      {/* 4方向のソースハンドル */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!bg-slate-400 !border-slate-300 !w-2 !h-2"
      />
    </>
  )
}
