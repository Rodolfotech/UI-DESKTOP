"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "@craftjs/core"
import type { ClipboardFeedback } from "@/components/editor/ClipboardToast"
import { ButtonNode } from "@/components/editor/nodes/ButtonNode"
import { ContainerNode } from "@/components/editor/nodes/ContainerNode"
import { TextNode } from "@/components/editor/nodes/TextNode"
import { ImageNode } from "@/components/editor/nodes/ImageNode"
import { InputNode } from "@/components/editor/nodes/InputNode"
import { HeadingNode } from "@/components/editor/nodes/HeadingNode"
import { CardNode } from "@/components/editor/nodes/CardNode"
import { ModalNode } from "@/components/editor/nodes/ModalNode"
import { NavigationNode } from "@/components/editor/nodes/NavigationNode"
import { CheckboxNode } from "@/components/editor/nodes/CheckboxNode"
import { SelectNode } from "@/components/editor/nodes/SelectNode"
import { TextareaNode } from "@/components/editor/nodes/TextareaNode"
import { DividerNode } from "@/components/editor/nodes/DividerNode"
import { AvatarNode } from "@/components/editor/nodes/AvatarNode"
import { BadgeNode } from "@/components/editor/nodes/BadgeNode"
import { AlertNode } from "@/components/editor/nodes/AlertNode"
import { RadioNode } from "@/components/editor/nodes/RadioNode"
import { ToggleNode } from "@/components/editor/nodes/ToggleNode"
import { DatePickerNode } from "@/components/editor/nodes/DatePickerNode"

const RESOLVER: Record<string, React.ComponentType<any>> = {
  Button: ButtonNode, Container: ContainerNode, Text: TextNode, Image: ImageNode,
  Input: InputNode, Heading: HeadingNode, Card: CardNode, Modal: ModalNode,
  Navigation: NavigationNode, Checkbox: CheckboxNode, Select: SelectNode,
  Textarea: TextareaNode, Divider: DividerNode, Avatar: AvatarNode,
  Badge: BadgeNode, Alert: AlertNode, Radio: RadioNode, Toggle: ToggleNode,
  DatePicker: DatePickerNode,
}

interface CopiedData {
  nodeId: string
  typeName: string
  parentId: string
  serialized: string
}

/**
 * Hook that provides copy/paste functionality for Craft.js components.
 * Uses `actions.add(nodeId, parentId)` to clone by node ID — preserves full subtree.
 * Returns feedback state for visual confirmation via ClipboardToast.
 */
export function useClipboard() {
  const { actions, query } = useEditor()
  const copiedDataRef = useRef<CopiedData | null>(null)
  const [feedback, setFeedback] = useState<ClipboardFeedback>({ type: null })

  const clearFeedback = useCallback(() => setFeedback({ type: null }), [])

  const getSelectedNodeId = useCallback((): string | null => {
    const state = query.getState()
    const selectedIds = [...state.events.selected]
    if (selectedIds.length === 0 || selectedIds[0] === "ROOT") return null
    return selectedIds[0]
  }, [query])

  const extractTypeName = useCallback((nodeId: string): string | null => {
    try {
      const node = query.node(nodeId).get()
      if (!node) return null
      const typeData = node.data.type
      if (typeof typeData === "string") return typeData
      if (typeData && typeof typeData === "object")
        return (typeData as { resolvedName?: string }).resolvedName || null
      return null
    } catch { return null }
  }, [query])

  const cleanName = useCallback((name: string): string => {
    return name.replace(/Node$/, "").replace(/Template$/, "")
  }, [])

  const copySelected = useCallback(() => {
    const nodeId = getSelectedNodeId()
    if (!nodeId) return

    try {
      const node = query.node(nodeId).get()
      if (!node) return

      const typeName = extractTypeName(nodeId) || "Unknown"

      copiedDataRef.current = {
        nodeId,
        typeName,
        parentId: node.data.parent || "ROOT",
        serialized: query.serialize(),
      }

      setFeedback({ type: "copied", name: cleanName(typeName) })
    } catch { /* ignore */ }
  }, [getSelectedNodeId, extractTypeName, query, cleanName])

  const pasteCopied = useCallback(() => {
    const data = copiedDataRef.current
    if (!data) return

    try {
      // Clone by node ID — preserves full subtree including children
      const newNodeId = (actions as any).add(data.nodeId, data.parentId)
      if (newNodeId) {
        setFeedback({ type: "pasted", name: cleanName(data.typeName) })
        return
      }
    } catch { /* try fallback */ }

    // Fallback: parseReactElement for basic component types
    try {
      const d = copiedDataRef.current
      if (!d) return
      const Component = RESOLVER[d.typeName]
      if (!Component) {
        setFeedback({ type: "unsupported", name: d.typeName })
        return
      }
      const parsed = JSON.parse(d.serialized)
      const nodeData = parsed[d.nodeId]
      const cleanProps: Record<string, unknown> = {}
      if (nodeData?.props) {
        for (const [key, val] of Object.entries(nodeData.props)) {
          if (!["nodes","parent","linkedNodes","custom","hidden","displayName","is","canvas"].includes(key)) {
            cleanProps[key] = val
          }
        }
      }
      const element = React.createElement(Component, cleanProps)
      const nodeTree = (query as any).parseReactElement(element).toNodeTree()
      ;(actions as any).addNodeTree(nodeTree, d.parentId)
      setFeedback({ type: "pasted", name: cleanName(d.typeName) })
    } catch {
      console.warn("[Clipboard] Paste failed")
    }
  }, [actions, query, cleanName])

  const duplicateSelected = useCallback(() => {
    const nodeId = getSelectedNodeId()
    if (!nodeId) return

    try {
      const node = query.node(nodeId).get()
      if (!node) return
      const parentId = node.data.parent || "ROOT"
      const typeName = extractTypeName(nodeId) || "Unknown"

      // Clone by node ID
      const newNodeId = (actions as any).add(nodeId, parentId)
      if (newNodeId) {
        setFeedback({ type: "duplicated", name: cleanName(typeName) })
      }
    } catch { /* fallback to copy+paste */ }
  }, [getSelectedNodeId, extractTypeName, query, actions, cleanName])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if ((e.target as HTMLElement)?.contentEditable === "true") return

      if ((e.ctrlKey || e.metaKey) && e.key === "c") { e.preventDefault(); copySelected() }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") { e.preventDefault(); pasteCopied() }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") { e.preventDefault(); duplicateSelected() }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [copySelected, pasteCopied, duplicateSelected])

  return { copySelected, pasteCopied, duplicateSelected, feedback, clearFeedback }
}
