"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface Guide {
  orientation: "horizontal" | "vertical"
  position: number
  start: number
  end: number
}

interface SnapGuide {
  x: number | null
  y: number | null
}

const ALIGNMENT_THRESHOLD = 5 // px

/**
 * useSmartGuides — Figma-style alignment guides for the canvas
 *
 * Calculates alignment lines between the dragged component and all other
 * components on the canvas. Returns visual guide positions and snap deltas.
 */
export function useSmartGuides() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [snapGuide, setSnapGuide] = useState<SnapGuide>({ x: null, y: null })
  const guidesRef = useRef<Guide[]>([])
  const snapRef = useRef<SnapGuide>({ x: null, y: null })

  /**
   * Calculate alignment guides between a dragged element and all other elements
   */
  const calculateGuides = useCallback(
    (draggedRect: DOMRect | null, containerEl: HTMLElement | null) => {
      if (!draggedRect || !containerEl) {
        guidesRef.current = []
        snapRef.current = { x: null, y: null }
        setGuides([])
        setSnapGuide({ x: null, y: null })
        return { snapX: 0, snapY: 0 }
      }

      const containerRect = containerEl.getBoundingClientRect()
      const result: Guide[] = []
      let snapX: number | null = null
      let snapY: number | null = null
      let minSnapDistX = ALIGNMENT_THRESHOLD
      let minSnapDistY = ALIGNMENT_THRESHOLD

      // Dragged element edges
      const dLeft = draggedRect.left - containerRect.left
      const dRight = draggedRect.right - containerRect.left
      const dTop = draggedRect.top - containerRect.top
      const dBottom = draggedRect.bottom - containerRect.top
      const dCenterX = dLeft + draggedRect.width / 2
      const dCenterY = dTop + draggedRect.height / 2

      // Get all component elements inside the frame
      const frameEl = containerEl.querySelector('[class*="craftjs-renderer"]') ||
        containerEl.querySelector('[class*="Frame"]') ||
        containerEl.querySelector('[class*="bg-white"]') ||
        containerEl
      const allElements = frameEl.querySelectorAll('[class*="craft"] *, [class*="renderer"] *')

      for (const el of allElements) {
        const rect = el.getBoundingClientRect()
        // Skip the element being dragged by checking proximity (we can't perfectly identify it)
        const elLeft = rect.left - containerRect.left
        const elRight = rect.right - containerRect.left
        const elTop = rect.top - containerRect.top
        const elBottom = rect.bottom - containerRect.top
        const elCenterX = elLeft + rect.width / 2
        const elCenterY = elTop + rect.height / 2

        // ---- Horizontal alignments ----
        const alignmentsY = [
          { pos: elTop, label: "top" },
          { pos: elCenterY, label: "center-y" },
          { pos: elBottom, label: "bottom" },
        ]

        for (const a of alignmentsY) {
          // Check all dragged edges
          for (const dPos of [dTop, dCenterY, dBottom]) {
            const dist = Math.abs(dPos - a.pos)
            if (dist < minSnapDistY) {
              minSnapDistY = dist
              snapY = a.pos - dPos
              // Create guide
              const existing = result.find(
                (g) => g.orientation === "horizontal" && Math.abs(g.position - a.pos) < 1
              )
              if (!existing) {
                result.push({
                  orientation: "horizontal",
                  position: a.pos,
                  start: Math.min(dLeft, elLeft),
                  end: Math.max(dRight, elRight),
                })
              }
            }
          }
        }

        // ---- Vertical alignments ----
        const alignmentsX = [
          { pos: elLeft, label: "left" },
          { pos: elCenterX, label: "center-x" },
          { pos: elRight, label: "right" },
        ]

        for (const a of alignmentsX) {
          for (const dPos of [dLeft, dCenterX, dRight]) {
            const dist = Math.abs(dPos - a.pos)
            if (dist < minSnapDistX) {
              minSnapDistX = dist
              snapX = a.pos - dPos
              const existing = result.find(
                (g) => g.orientation === "vertical" && Math.abs(g.position - a.pos) < 1
              )
              if (!existing) {
                result.push({
                  orientation: "vertical",
                  position: a.pos,
                  start: Math.min(dTop, elTop),
                  end: Math.max(dBottom, elBottom),
                })
              }
            }
          }
        }
      }

      guidesRef.current = result
      snapRef.current = { x: snapX, y: snapY }
      setGuides(result)
      setSnapGuide({ x: snapX, y: snapY })

      return { snapX: snapX ?? 0, snapY: snapY ?? 0 }
    },
    []
  )

  // Clean up guides when dragging ends
  const clearGuides = useCallback(() => {
    guidesRef.current = []
    snapRef.current = { x: null, y: null }
    setGuides([])
    setSnapGuide({ x: null, y: null })
  }, [])

  return {
    guides,
    snapGuide,
    calculateGuides,
    clearGuides,
  }
}
