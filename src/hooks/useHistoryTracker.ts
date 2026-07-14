"use client"

import { useState, useRef, useCallback } from "react"

export interface HistoryEntry {
  id: string
  description: string
  timestamp: number
  isCurrent: boolean
}

interface SerializedNode {
  type: { resolvedName: string }
  props: Record<string, unknown>
  nodes: string[]
  [key: string]: unknown
}

interface SerializedState {
  ROOT: SerializedNode & {
    nodes: string[]
  }
  [nodeId: string]: SerializedNode
}

const MAX_HISTORY = 50
const DEBOUNCE_MS = 500

function generateEntryId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const COMPONENT_TYPE_LABELS: Record<string, string> = {
  ButtonNode: "Button",
  ContainerNode: "Container",
  TextNode: "Text",
  HeadingNode: "Heading",
  ImageNode: "Image",
  InputNode: "Input",
  CardNode: "Card",
  ModalNode: "Modal",
  NavigationNode: "Navigation",
  CheckboxNode: "Checkbox",
  SelectNode: "Select",
  TextareaNode: "Textarea",
  DividerNode: "Divider",
  AvatarNode: "Avatar",
  BadgeNode: "Badge",
  AlertNode: "Alert",
  RadioNode: "Radio",
  ToggleNode: "Toggle",
  DatePickerNode: "Date Picker",
  HeroTemplate: "Hero Section",
  PricingTemplate: "Pricing Table",
  FooterTemplate: "Footer",
  FeaturesGrid: "Features Grid",
  TestimonialTemplate: "Testimonial",
}

function getComponentLabel(resolvedName: string): string {
  return COMPONENT_TYPE_LABELS[resolvedName] || resolvedName.replace(/Node$/, "")
}

function generateDescription(
  prevState: SerializedState | null,
  nextState: SerializedState
): string {
  if (!prevState) return "Initial state"

  const prevIds = new Set(Object.keys(prevState))
  const nextIds = new Set(Object.keys(nextState))

  // Find added nodes (in next but not in prev)
  const added: string[] = []
  // Find removed nodes (in prev but not in next)
  const removed: string[] = []
  // Find modified nodes (in both but props changed)
  const modified: string[] = []

  for (const id of nextIds) {
    if (id === "ROOT") continue
    if (!prevIds.has(id)) {
      const node = nextState[id]
      added.push(getComponentLabel(node.type.resolvedName))
    } else {
      // Check if props changed
      const prevNode = prevState[id]
      const nextNode = nextState[id]
      if (JSON.stringify(prevNode.props) !== JSON.stringify(nextNode.props)) {
        modified.push(getComponentLabel(nextNode.type.resolvedName))
      }
    }
  }

  for (const id of prevIds) {
    if (id === "ROOT") continue
    if (!nextIds.has(id)) {
      const node = prevState[id]
      removed.push(getComponentLabel(node.type.resolvedName))
    }
  }

  // Build description
  const parts: string[] = []

  if (added.length > 0) {
    if (added.length <= 2) {
      parts.push(`Added ${added.join(" & ")}`)
    } else {
      parts.push(`Added ${added.length} components`)
    }
  }

  if (removed.length > 0) {
    if (removed.length <= 2) {
      parts.push(`Deleted ${removed.join(" & ")}`)
    } else {
      parts.push(`Deleted ${removed.length} components`)
    }
  }

  if (modified.length > 0 && parts.length === 0) {
    if (modified.length <= 2) {
      parts.push(`Modified ${modified.join(" & ")}`)
    } else {
      parts.push(`Modified ${modified.length} components`)
    }
  }

  // Check if only children order/position changed
  if (parts.length === 0) {
    // Check if node ordering within parents changed
    for (const id of nextIds) {
      if (id === "ROOT") continue
      if (prevIds.has(id)) {
        const prevNode = prevState[id]
        const nextNode = nextState[id]
        if (JSON.stringify(prevNode.nodes) !== JSON.stringify(nextNode.nodes)) {
          parts.push("Reordered components")
          break
        }
      }
    }
  }

  if (parts.length === 0) {
    // Fallback: something changed but we couldn't detect what
    return "Modified design"
  }

  return parts.join("; ")
}

export function useHistoryTracker() {
  const [entries, setEntries] = useState<HistoryEntry[]>([
    {
      id: generateEntryId(),
      description: "Initial state",
      timestamp: Date.now(),
      isCurrent: true,
    },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Refs to avoid stale closures in callbacks
  const lastSerializedRef = useRef<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(0)

  // Keep ref in sync with state
  const updateIndex = (newIndex: number) => {
    currentIndexRef.current = newIndex
    setCurrentIndex(newIndex)
  }

  const recordChange = useCallback((serializedJson: string) => {
    const prevJson = lastSerializedRef.current
    lastSerializedRef.current = serializedJson

    if (!prevJson) {
      // First state, nothing to compare
      return
    }

    try {
      const prevState = JSON.parse(prevJson) as SerializedState
      const nextState = JSON.parse(serializedJson) as SerializedState

      const description = generateDescription(prevState, nextState)
      const idx = currentIndexRef.current

      setEntries((prev) => {
        // Remove any entries after current index (redo branch gets cleared)
        const newEntries = prev.slice(0, idx + 1)

        const entry: HistoryEntry = {
          id: generateEntryId(),
          description,
          timestamp: Date.now(),
          isCurrent: false,
        }

        newEntries.push(entry)

        // Update isCurrent flags
        const updated = newEntries.map((e, i) => ({
          ...e,
          isCurrent: i === newEntries.length - 1,
        }))

        // Trim if over max
        if (updated.length > MAX_HISTORY) {
          return updated.slice(updated.length - MAX_HISTORY)
        }
        return updated
      })

      currentIndexRef.current = idx + 1
      setCurrentIndex(Math.min(idx + 1, MAX_HISTORY - 1))
    } catch {
      // If JSON parsing fails, skip recording
    }
  }, []) // No dependencies needed - uses refs

  const saveSnapshot = useCallback((serializedJson: string) => {
    // Debounce rapid changes to avoid flooding the history
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      recordChange(serializedJson)
    }, DEBOUNCE_MS)
  }, [recordChange])

  /** Record the initial serialized state after the editor loads */
  const setInitialSnapshot = useCallback((serializedJson: string) => {
    lastSerializedRef.current = serializedJson
  }, [])

  const navigateTo = useCallback((index: number, doUndo: () => void, doRedo: () => void) => {
    const diff = index - currentIndexRef.current

    if (diff === 0) return
    
    updateIndex(index)
    setEntries((prev) =>
      prev.map((e, i) => ({
        ...e,
        isCurrent: i === index,
      }))
    )

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        doRedo()
      }
    } else {
      for (let i = 0; i < Math.abs(diff); i++) {
        doUndo()
      }
    }
  }, []) // No dependencies needed - uses refs

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    entries,
    currentIndex,
    isOpen,
    toggleOpen,
    close,
    navigateTo,
    saveSnapshot,
  }
}
