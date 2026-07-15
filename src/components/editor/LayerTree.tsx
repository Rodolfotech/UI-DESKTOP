"use client"

import React, { useState, useCallback, useMemo, useRef } from "react"
import { useEditor } from "@craftjs/core"
import {
  Layers,
  Box,
  Type,
  MousePointer2,
  Image as ImageIcon,
  TextCursorInput,
  CreditCard,
  PanelTop,
  Navigation,
  CheckSquare,
  Minus,
  Circle,
  Tag,
  AlertTriangle,
  CircleDot,
  ToggleLeft,
  Calendar,
  LayoutTemplate,
  MessageSquare,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  Square,
  List,
  Mail,
  GripVertical,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ButtonNode } from "./nodes/ButtonNode"
import { TextNode } from "./nodes/TextNode"
import { HeadingNode } from "./nodes/HeadingNode"
import { ContainerNode } from "./nodes/ContainerNode"
import { ImageNode } from "./nodes/ImageNode"
import { InputNode } from "./nodes/InputNode"
import { DividerNode } from "./nodes/DividerNode"
import { CardNode } from "./nodes/CardNode"

// ── Quick-add component definitions ─────────────────────────────────

interface QuickAddComponent {
  label: string
  icon: React.ReactNode
  element: React.ReactElement
  description?: string
}

const QUICK_ADD_COMPONENTS: QuickAddComponent[] = [
  { label: "Button", icon: <MousePointer2 size={14} className="text-blue-600" />, element: <ButtonNode />, description: "Clickable button" },
  { label: "Text", icon: <Type size={14} className="text-green-600" />, element: <TextNode />, description: "Text paragraph" },
  { label: "Heading", icon: <Type size={14} className="text-purple-600" />, element: <HeadingNode />, description: "Section heading" },
  { label: "Container", icon: <Box size={14} className="text-indigo-600" />, element: <ContainerNode />, description: "Flex container" },
  { label: "Image", icon: <ImageIcon size={14} className="text-pink-600" />, element: <ImageNode />, description: "Image placeholder" },
  { label: "Input", icon: <TextCursorInput size={14} className="text-orange-600" />, element: <InputNode />, description: "Text input field" },
  { label: "Divider", icon: <Minus size={14} className="text-gray-500" />, element: <DividerNode />, description: "Horizontal line" },
  { label: "Card", icon: <CreditCard size={14} className="text-amber-600" />, element: <CardNode />, description: "Content card" },
]

// ── Icon mapping per component type ─────────────────────────────────

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  Button: <MousePointer2 size={13} className="text-blue-600" />,
  Container: <Box size={13} className="text-indigo-600" />,
  Text: <Type size={13} className="text-green-600" />,
  Heading: <Type size={13} className="text-purple-600" />,
  Input: <TextCursorInput size={13} className="text-orange-600" />,
  Image: <ImageIcon size={13} className="text-pink-600" />,
  Card: <CreditCard size={13} className="text-amber-600" />,
  Modal: <PanelTop size={13} className="text-blue-600" />,
  Navigation: <Navigation size={13} className="text-gray-700" />,
  Checkbox: <CheckSquare size={13} className="text-teal-600" />,
  Select: <ChevronDown size={13} className="text-cyan-600" />,
  Textarea: <TextCursorInput size={13} className="text-violet-600" />,
  Divider: <Minus size={13} className="text-gray-500" />,
  Avatar: <Circle size={13} className="text-indigo-600" />,
  Badge: <Tag size={13} className="text-pink-600" />,
  Alert: <AlertTriangle size={13} className="text-orange-600" />,
  Radio: <CircleDot size={13} className="text-rose-600" />,
  Toggle: <ToggleLeft size={13} className="text-emerald-600" />,
  "Date Picker": <Calendar size={13} className="text-sky-600" />,
  "Hero Section": <LayoutTemplate size={13} className="text-indigo-600" />,
  "Pricing Table": <CreditCard size={13} className="text-emerald-600" />,
  "Features Grid": <Grid3X3 size={13} className="text-amber-600" />,
  Testimonial: <MessageSquare size={13} className="text-pink-600" />,
  Footer: <Minus size={13} className="text-gray-700" />,
  "Login Form": <TextCursorInput size={13} className="text-emerald-600" />,
  "Contact Form": <MessageSquare size={13} className="text-cyan-600" />,
  "Table of Contents": <List size={13} className="text-violet-600" />,
  "FAQ Section": <MessageSquare size={13} className="text-rose-600" />,
  "Stats Counter": <Grid3X3 size={13} className="text-green-600" />,
  "Newsletter Section": <Mail size={13} className="text-blue-600" />,
  "Timeline Section": <List size={13} className="text-blue-600" />,
  "Logo Cloud": <Grid3X3 size={13} className="text-purple-600" />,
  "CTA Section": <Mail size={13} className="text-orange-600" />,
  "Portfolio Grid": <LayoutTemplate size={13} className="text-rose-600" />,
  "Cookie Consent Banner": <AlertTriangle size={13} className="text-amber-600" />,
  "Team Grid": <Circle size={13} className="text-indigo-600" />,
}

function getIcon(displayName: string): React.ReactNode {
  return COMPONENT_ICONS[displayName] || <Square size={13} className="text-gray-400" />
}

// ── DnD State ──────────────────────────────────────────────────────

interface DnDState {
  draggedNodeId: string | null
  draggedParentId: string | null
}

// ── Recursive TreeNode ─────────────────────────────────────────────

interface TreeNodeProps {
  nodeId: string
  name: string
  depth: number
  parentNodeId: string
  dndStateRef: React.MutableRefObject<DnDState>
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({
  nodeId,
  name,
  depth,
  parentNodeId,
  dndStateRef,
}) => {
  const { nodes, selectedNodeId, actions } = useEditor((state) => ({
    nodes: state.nodes,
    selectedNodeId: state.events.selected.size > 0 ? [...state.events.selected][0] : null,
  }))

  // Quick-add popover state
  const [showAddPopover, setShowAddPopover] = useState(false)

  // ★ MUST be defined BEFORE useCallback that references it (fix TDZ)
  const node = nodes[nodeId]
  const childIds: string[] = node?.data?.nodes || []
  const isContainer = childIds.length > 0
  const isSelected = selectedNodeId === nodeId

  // Handle adding a child component
  const handleAddChild = useCallback((e: React.MouseEvent, component: QuickAddComponent) => {
    e.stopPropagation()
    setShowAddPopover(false)

    try {
      const ids: string[] = node?.data?.nodes || []
      actions.add(component.element, nodeId, ids.length)
    } catch (err) {
      console.error("[LayerTree] addChild failed:", err)
    }
  }, [actions, nodeId, node])

  const [collapsed, setCollapsed] = useState(false)

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsed((prev) => !prev)
  }, [])

  const handleSelect = useCallback((e: React.PointerEvent) => {
    // Use pointerDown (fires before dragStart) so the node is selected
    // before the browser initiates a drag on draggable rows
    try {
      actions.selectNode(nodeId)
    } catch (err) {
      console.error("[LayerTree] selectNode failed:", err, { nodeId })
    }
  }, [actions, nodeId])

  // ── Hover highlight on Canvas ─────────────────────────────────

  const handleMouseEnter = useCallback(() => {
    const el = document.querySelector(`[data-node-id="${nodeId}"]`)
    if (el) el.classList.add("layer-hover-highlight")
  }, [nodeId])

  const handleMouseLeave = useCallback(() => {
    const el = document.querySelector(`[data-node-id="${nodeId}"]`)
    if (el) el.classList.remove("layer-hover-highlight")
  }, [nodeId])

  // ── Delete ─────────────────────────────────────────────────────

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    actions.delete(nodeId)
  }, [actions, nodeId])

  // ── Drag & Drop ────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", nodeId)
    e.dataTransfer.effectAllowed = "move"
    dndStateRef.current.draggedNodeId = nodeId
    dndStateRef.current.draggedParentId = parentNodeId

    // Make the row semi-transparent while dragging
    const row = e.currentTarget as HTMLElement
    row.classList.add("tree-node-dragging")
    row.style.opacity = "0.4"
  }, [nodeId, parentNodeId, dndStateRef])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    const draggedId = dndStateRef.current.draggedNodeId
    if (!draggedId || draggedId === nodeId) return

    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const y = e.clientY
    const midY = rect.top + rect.height / 2

    el.classList.remove("tree-node-drop-before", "tree-node-drop-after")
    el.classList.add(y < midY ? "tree-node-drop-before" : "tree-node-drop-after")
  }, [nodeId, dndStateRef])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.classList.remove("tree-node-drop-before", "tree-node-drop-after")
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const el = e.currentTarget as HTMLElement
    el.classList.remove("tree-node-drop-before", "tree-node-drop-after")

    const draggedId = dndStateRef.current.draggedNodeId
    if (!draggedId || draggedId === nodeId) return
    // Prevent moving a node into its own child container
    if (draggedId === parentNodeId) return

    // Determine drop position (before or after this node)
    const rect = el.getBoundingClientRect()
    const y = e.clientY
    const midY = rect.top + rect.height / 2
    const dropBefore = y < midY

    // Calculate target parent and new index
    const targetNode = nodes[parentNodeId]
    const siblings: string[] = targetNode?.data?.nodes || []
    const targetIndex = siblings.indexOf(nodeId)
    const newIndex = dropBefore ? targetIndex : targetIndex + 1

    // Don't move if already at same position
    const currentSiblings: string[] = nodes[parentNodeId]?.data?.nodes || []
    const currentIndex = currentSiblings.indexOf(draggedId)
    const adjustedIndex = (currentIndex < newIndex && parentNodeId === dndStateRef.current.draggedParentId)
      ? newIndex - 1
      : newIndex

    actions.move(draggedId, parentNodeId, adjustedIndex)
  }, [nodeId, parentNodeId, nodes, actions, dndStateRef])

  const handleDragEnd = useCallback(() => {
    dndStateRef.current.draggedNodeId = null
    dndStateRef.current.draggedParentId = null

    // Clean up all visual indicators
    document.querySelectorAll(".tree-node-dragging, .tree-node-drop-before, .tree-node-drop-after")
      .forEach((el) => {
        el.classList.remove("tree-node-dragging", "tree-node-drop-before", "tree-node-drop-after")
        if (el instanceof HTMLElement) el.style.opacity = ""
      })
  }, [dndStateRef])

  // Filter out ROOT children from display, but still show their children
  const visibleChildren = childIds.filter((id) => id !== "ROOT")
  const hasVisibleChildren = visibleChildren.length > 0

  return (
    <div>
      {/* Node row */}
      <div
        draggable
        onPointerDown={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md text-xs cursor-pointer transition-all group",
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* Drag handle */}
        <GripVertical
          size={10}
          className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0 transition-opacity"
        />

        {/* Collapse toggle for containers */}
        {isContainer && hasVisibleChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 shrink-0"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Type icon */}
        <span className="shrink-0 flex items-center justify-center w-4 h-4">
          {getIcon(name)}
        </span>

        {/* Name */}
        <span className="truncate font-medium text-[11px] flex-1 min-w-0">{name}</span>

        {/* Child count badge */}
        {isContainer && hasVisibleChildren && !collapsed && (
          <span className="ml-auto text-[9px] text-gray-400 dark:text-gray-600 font-mono shrink-0">
            {visibleChildren.length}
          </span>
        )}

        {/* Quick-add button (visible on hover, for containers) */}
        {isContainer && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAddPopover(!showAddPopover) }}
              className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              title="Add child component"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Quick-add popover */}
            {showAddPopover && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowAddPopover(false) }} />
                <div
                  className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-40 overflow-hidden animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                    Add component
                  </div>
                  {QUICK_ADD_COMPONENTS.map((comp) => (
                    <button
                      key={comp.label}
                      onClick={(e) => handleAddChild(e, comp)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      title={comp.description}
                    >
                      <span className="shrink-0 flex items-center justify-center w-4 h-4">
                        {comp.icon}
                      </span>
                      <span>{comp.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delete button (visible on row hover) */}
        <button
          onClick={handleDelete}
          className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
          title="Delete component"
        >
          <Trash2 size={12} />
        </button>

        {/* Selected indicator */}
        {isSelected && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        )}
      </div>

      {/* Children (if expanded) */}
      {isContainer && hasVisibleChildren && !collapsed && (
        <div>
          {visibleChildren.map((childId) => {
            const childNode = nodes[childId]
            const childName = childNode?.data?.displayName || "Unknown"
            return (
              <TreeNode
                key={childId}
                nodeId={childId}
                name={childName}
                depth={depth + 1}
                parentNodeId={nodeId}
                dndStateRef={dndStateRef}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})
TreeNode.displayName = "TreeNode"

// ── LayerTree Root ─────────────────────────────────────────────────

interface LayerTreeProps {
  className?: string
}

export const LayerTree: React.FC<LayerTreeProps> = React.memo(({ className }) => {
  const { nodes, selectedNodeId } = useEditor((state) => ({
    nodes: state.nodes,
    selectedNodeId: state.events.selected.size > 0 ? [...state.events.selected][0] : null,
  }))

  // Shared DnD state ref (stable across renders)
  const dndStateRef = useRef<DnDState>({ draggedNodeId: null, draggedParentId: null })

  // Find ROOT node children (top-level nodes)
  const rootChildren = useMemo(() => {
    const rootNode = nodes["ROOT"]
    if (!rootNode) return []
    const childIds: string[] = rootNode.data?.nodes || []
    return childIds.filter((id) => id !== "ROOT")
  }, [nodes])

  if (rootChildren.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-48 text-center px-4", className)}>
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
          <Layers size={20} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No layers yet</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Add components to the canvas to see the DOM tree.
        </p>
      </div>
    )
  }

  // Render count stats
  const totalNodes = Object.keys(nodes).length - 1 // exclude ROOT

  return (
    <div className={cn("py-2", className)}>
      {/* Tree header */}
      <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100 dark:border-gray-700/50 mb-1">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          DOM Tree
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          {totalNodes} node{totalNodes !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tree nodes */}
      <div className="px-1">
        {rootChildren.map((childId) => {
          const childNode = nodes[childId]
          const childName = childNode?.data?.displayName || "Unknown"
          return (
            <TreeNode
              key={childId}
              nodeId={childId}
              name={childName}
              depth={0}
              parentNodeId="ROOT"
              dndStateRef={dndStateRef}
            />
          )
        })}
      </div>
    </div>
  )
})
LayerTree.displayName = "LayerTree"
