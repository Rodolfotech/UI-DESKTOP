"use client"

import React, { useEffect, useCallback } from "react"
import { useEditor } from "@craftjs/core"

interface KeyboardShortcutsProps {
  /** Callback to toggle the history dropdown visibility */
  onHistoryToggle?: () => void
  /** Callback to focus the history search input */
  onFocusSearch?: () => void
}

/**
 * Global keyboard shortcuts for the editor.
 * Must be placed inside a <Editor> context from @craftjs/core.
 *
 * Registered shortcuts:
 *   Ctrl+Z        — Undo
 *   Ctrl+Shift+Z  — Redo
 *   Ctrl+Y        — Redo (alternative)
 *   Ctrl+H        — Toggle history panel
 *   /             — Focus search / toggle history
 *
 * These shortcuts are ignored when focus is inside an input, textarea, or
 * contentEditable element to avoid conflicts with inline editing.
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onHistoryToggle,
  onFocusSearch,
}) => {
  const { actions } = useEditor()

  // Stable callback refs to avoid re-registering the listener
  const toggleRef = React.useRef(onHistoryToggle)
  const focusRef = React.useRef(onFocusSearch)
  const actionsRef = React.useRef(actions)

  toggleRef.current = onHistoryToggle
  focusRef.current = onFocusSearch
  actionsRef.current = actions

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if the user is typing in a text input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if ((e.target as HTMLElement)?.contentEditable === "true") return

      const mod = e.ctrlKey || e.metaKey

      // ── Undo: Ctrl+Z ──────────────────────────────────────────
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        actionsRef.current.history.undo()
        return
      }

      // ── Redo: Ctrl+Shift+Z or Ctrl+Y ──────────────────────────
      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) {
        e.preventDefault()
        e.stopPropagation()
        actionsRef.current.history.redo()
        return
      }

      // ── Toggle History: Ctrl+H ────────────────────────────────
      if (mod && e.key === "h") {
        e.preventDefault()
        e.stopPropagation()
        toggleRef.current?.()
        return
      }

      // ── Focus Search: / (forward slash) ──────────────────────
      if (!mod && e.key === "/") {
        e.preventDefault()
        e.stopPropagation()
        if (focusRef.current) {
          focusRef.current()
        } else {
          // Fallback: toggle the history panel (it has a search input)
          toggleRef.current?.()
        }
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true })
  }, []) // Empty deps — refs keep values stable

  return null // This component renders nothing visible
}
