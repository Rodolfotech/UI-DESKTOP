"use client"

import React, { useEffect, useRef, useState } from "react"
import { useEditor, Frame, Element } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ContainerNode } from "./nodes/ContainerNode"
import { ButtonNode } from "./nodes/ButtonNode"
import { TextNode } from "./nodes/TextNode"
import { ImageNode } from "./nodes/ImageNode"
import { InputNode } from "./nodes/InputNode"
import { HeadingNode } from "./nodes/HeadingNode"
import { 
  Undo2, 
  Redo2, 
  Layers,
  Grid3X3,
  GripVertical,
  Smartphone,
  Tablet,
  Monitor,
  ChevronDown,
  Copy,
  Clipboard,
  CopyPlus,
  Minus
} from "lucide-react"

import { ViewMode } from "./TopBar"
import { HistoryDropdown } from "./HistoryDropdown"
import type { HistoryEntry } from "@/hooks/useHistoryTracker"
import { useSmartGuides } from "@/hooks/useSmartGuides"

interface CanvasProps {
  className?: string
  zoom?: number
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  // Clipboard
  onCopy?: () => void
  onPaste?: () => void
  onDuplicate?: () => void
  // History
  historyEntries?: HistoryEntry[]
  historyCurrentIndex?: number
  historyIsOpen?: boolean
  onHistoryToggle?: () => void
  onHistoryClose?: () => void
  onHistoryNavigate?: (index: number, doUndo: () => void, doRedo: () => void) => void
}

const BREAKPOINTS: { mode: ViewMode; width: number }[] = [
  { mode: "mobile", width: 375 },
  { mode: "tablet", width: 768 },
  { mode: "desktop", width: 1200 },
]

const DEVICE_PRESETS: { name: string; width: number; mode: ViewMode; icon: React.ElementType; frame?: "phone" | "tablet" | "none" }[] = [
  { name: "iPhone 14", width: 390, mode: "mobile", icon: Smartphone, frame: "phone" },
  { name: "iPhone 14 Pro Max", width: 430, mode: "mobile", icon: Smartphone, frame: "phone" },
  { name: "Galaxy S23", width: 360, mode: "mobile", icon: Smartphone, frame: "phone" },
  { name: "iPad Mini", width: 744, mode: "tablet", icon: Tablet, frame: "tablet" },
  { name: "iPad Pro", width: 1024, mode: "tablet", icon: Tablet, frame: "tablet" },
  { name: "Desktop HD", width: 1280, mode: "desktop", icon: Monitor, frame: "none" },
  { name: "Desktop 4K", width: 1920, mode: "desktop", icon: Monitor, frame: "none" },
]

const MIN_CANVAS_WIDTH = 320
const MAX_CANVAS_WIDTH = 1400

const SNAP_THRESHOLD = 60

function snapToBreakpoint(width: number): ViewMode {
  let closest = BREAKPOINTS[0]
  let minDiff = Infinity
  for (const bp of BREAKPOINTS) {
    const diff = Math.abs(width - bp.width)
    if (diff < minDiff) {
      minDiff = diff
      closest = bp
    }
  }
  return closest.mode
}

export const Canvas: React.FC<CanvasProps> = ({ 
  className, 
  zoom = 100,
  viewMode = "desktop", 
  onViewModeChange,
  onCopy,
  onPaste,
  onDuplicate,
  historyEntries = [],
  historyCurrentIndex = 0,
  historyIsOpen = false,
  onHistoryToggle,
  onHistoryClose,
  onHistoryNavigate,
}) => {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const undo = React.useCallback(() => actions.history.undo(), [actions])
  const redo = React.useCallback(() => actions.history.redo(), [actions])

  const handleHistoryNavigate = React.useCallback((index: number) => {
    onHistoryNavigate?.(index, () => undo(), () => redo())
  }, [onHistoryNavigate, undo, redo])

  const [showGrid, setShowGrid] = React.useState(true)
  const [showDevicePicker, setShowDevicePicker] = React.useState(false)
  const devicePickerRef = React.useRef<HTMLDivElement>(null)

  // ── Smart alignment guides (FASE 3.3) ────────────────────
  const { guides, calculateGuides, clearGuides } = useSmartGuides()

  // Track drag for guide calculation
  const isDraggingComponent = useRef(false)

  // Observe position changes during drag
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver(() => {
      if (isDraggingComponent.current && containerRef.current) {
        // Use Craft.js selected class to find dragged element
        const selectedEl = containerRef.current.querySelector('[class*="selected"]')
        if (selectedEl) {
          const rect = selectedEl.getBoundingClientRect()
          calculateGuides(rect, containerRef.current)
        }
      }
    })

    observer.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class'],
    })

    // Listen for drag start/end
    const handleDragStart = () => { isDraggingComponent.current = true }
    const handleDragEnd = () => {
      isDraggingComponent.current = false
      setTimeout(() => clearGuides(), 100)
    }
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('dragend', handleDragEnd)
    // Handle Craft.js internal pointer events
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[class*="craft"]') || target.closest('[draggable]')) {
        isDraggingComponent.current = true
      }
    }
    const handlePointerUp = () => {
      setTimeout(() => {
        isDraggingComponent.current = false
        clearGuides()
      }, 200)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      observer.disconnect()
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('dragend', handleDragEnd)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [calculateGuides, clearGuides])

  // Drag resize state using refs to avoid stale closures
  const [isDragging, setIsDragging] = useState(false)
  const [customWidth, setCustomWidth] = useState<number | null>(null)
  const [showWidthIndicator, setShowWidthIndicator] = useState(false)

  const dragRef = useRef({ startX: 0, startWidth: 0, width: 0 })
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeWidth = customWidth ?? BREAKPOINTS.find(bp => bp.mode === viewMode)?.width ?? 1200

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, _side?: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Clear any pending snap timeout
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current)
      snapTimeoutRef.current = null
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX

    dragRef.current = {
      startX: clientX,
      startWidth: activeWidth,
      width: activeWidth,
    }
    
    setIsDragging(true)
    setShowWidthIndicator(true)
  }

  // Determine current display mode label for the indicator
  const getModeForWidth = (w: number): string => {
    if (w <= BREAKPOINTS[0].width + 100) return "Mobile"
    if (w <= BREAKPOINTS[1].width + 100) return "Tablet"
    return "Desktop"
  }

  // Attach global mouse/touch move and end listeners using refs to avoid stale closures
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const delta = clientX - dragRef.current.startX
      const newWidth = Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, dragRef.current.startWidth + delta))

      dragRef.current.width = newWidth
      setCustomWidth(newWidth)
    }

    const handleEnd = () => {
      setIsDragging(false)
      setShowWidthIndicator(false)
      
      const finalWidth = dragRef.current.width
      if (finalWidth > 0) {
        // Snap to nearest breakpoint
        const snappedMode = snapToBreakpoint(finalWidth)
        const snappedWidth = BREAKPOINTS.find(bp => bp.mode === snappedMode)!.width
        
        setCustomWidth(snappedWidth)
        onViewModeChange?.(snappedMode)
        
        // Brief delay to show snap, then reset customWidth
        snapTimeoutRef.current = setTimeout(() => {
          setCustomWidth(null)
          snapTimeoutRef.current = null
        }, 150)
      }
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", handleEnd)

    // Prevent text selection while dragging
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
  }, [isDragging, onViewModeChange])

  // Show snapping indicator dots
  const breakpointPositions = BREAKPOINTS.map(bp => {
    const totalRange = MAX_CANVAS_WIDTH - MIN_CANVAS_WIDTH
    const pos = ((bp.width - MIN_CANVAS_WIDTH) / totalRange) * 100
    return { ...bp, percent: pos }
  })

  return (
    <div className={cn("flex-1 flex flex-col bg-gray-100 dark:bg-gray-900", className)}>
      {/* Canvas Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          {/* History Controls */}
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-lg transition-colors",
              canUndo 
                ? "hover:bg-gray-100 text-gray-700" 
                : "text-gray-300 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-lg transition-colors",
              canRedo 
                ? "hover:bg-gray-100 text-gray-700" 
                : "text-gray-300 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* View Controls */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showGrid 
                ? "bg-blue-100 text-blue-700" 
                : "hover:bg-gray-100 text-gray-700"
            )}
            title="Toggle Grid (dot grid)"
          >
            {showGrid ? <Grid3X3 size={18} /> : <Minus size={18} />}
          </button>

          {/* Device Preset Picker */}
          <div className="relative ml-2" ref={devicePickerRef}>
            <button
              onClick={() => setShowDevicePicker(!showDevicePicker)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                showDevicePicker ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {(() => {
                const current = DEVICE_PRESETS.find(d => d.mode === viewMode && Math.abs(d.width - activeWidth) < 50)
                const Icon = current?.icon || Monitor
                return <><Icon size={14} /><span>{current?.name || viewMode}</span><ChevronDown size={12} /></>
              })()}
            </button>
            {showDevicePicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDevicePicker(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 py-1 w-44 overflow-hidden">
                  {DEVICE_PRESETS.map((device) => {
                    const Icon = device.icon
                    const isActive = Math.abs(activeWidth - device.width) < 10
                    return (
                      <button
                        key={device.name}
                        onClick={() => {
                          setCustomWidth(device.width)
                          onViewModeChange?.(device.mode)
                          setShowDevicePicker(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors",
                          isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={14} className={isActive ? "text-blue-600" : "text-gray-400"} />
                        <span className="flex-1 text-left">{device.name}</span>
                        <span className="text-gray-400">{device.width}px</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clipboard buttons */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={onCopy}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Copy (Ctrl+C)"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={onPaste}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Paste (Ctrl+V)"
            >
              <Clipboard size={16} />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <CopyPlus size={16} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
          </div>

          <HistoryDropdown
            entries={historyEntries}
            currentIndex={historyCurrentIndex}
            isOpen={historyIsOpen}
            canUndo={canUndo}
            canRedo={canRedo}
            onToggle={onHistoryToggle || (() => {})}
            onClose={onHistoryClose || (() => {})}
            onNavigate={handleHistoryNavigate}
            onUndo={() => undo()}
            onRedo={() => redo()}
          />
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
            <Layers size={14} className="text-gray-500" />
            <span className="text-xs text-gray-600">Canvas</span>
          </div>
        </div>
      </div>

      {/* Canvas Area — with CSS containment for performance isolation */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto p-8 relative",
          showGrid && "canvas-dot-grid"
        )}
        style={{
          contain: "layout style paint",
          contentVisibility: "auto",
        }}
      >
        <div 
          className="relative flex items-start justify-center mx-auto"
          style={{ width: activeWidth + 60, maxWidth: "100%" }}
        >
          {/* Left Drag Handle */}
          <div
            onMouseDown={(e) => handleDragStart(e, "left")}
            onTouchStart={(e) => handleDragStart(e, "left")}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-col-resize z-10",
              "group",
              isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
            )}
            style={{ touchAction: "none" }}
          >
            <div className={cn(
              "w-1.5 h-16 rounded-full transition-all duration-200",
              isDragging 
                ? "bg-blue-500 h-24 shadow-lg shadow-blue-500/30" 
                : "bg-gray-300 group-hover:bg-gray-400 group-hover:h-20"
            )} />
            <div className={cn(
              "absolute inset-0 bg-blue-500/5 rounded-lg transition-opacity",
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />
          </div>

          {/* Canvas Frame — Figma-style elevated artboard */}
          <div 
            ref={canvasRef}
            className={cn(
              "bg-white min-h-[600px] relative",
              !isDragging && "transition-all duration-300",
              "canvas-artboard-shadow canvas-artboard-border canvas-viewport-transition",
              viewMode === "mobile" && "rounded-[26px]",
              viewMode === "tablet" && "rounded-[12px]",
              viewMode === "desktop" && "rounded-xl"
            )}
            style={{ 
              width: activeWidth,
              maxWidth: "100%",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center"
            }}
          >
            {/* Device chrome overlay - phone */}
            {viewMode === "mobile" && (
              <div className="absolute inset-0 rounded-[26px] border-[6px] border-gray-900 pointer-events-none z-10" />
            )}
            {/* Device chrome overlay - tablet */}
            {viewMode === "tablet" && (
              <div className="absolute inset-0 rounded-[12px] border-[4px] border-gray-800 pointer-events-none z-10" />
            )}

            {/* Device Label & Width Indicator */}
            <div className="flex items-center justify-center py-2 bg-gray-50 border-b border-gray-200 relative">
              {showWidthIndicator ? (
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {activeWidth}px • {getModeForWidth(activeWidth)}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {DEVICE_PRESETS.find(d => Math.abs(d.width - activeWidth) < 50)?.name || viewMode} • {activeWidth}px
                </span>
              )}
              
              {/* Snap indicator dots */}
              {!isDragging && (
                <div className="absolute right-3 flex items-center gap-1">
                  {breakpointPositions.map(bp => (
                    <div
                      key={bp.mode}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        viewMode === bp.mode ? "bg-blue-500" : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Phone notch in header bar */}
              {viewMode === "mobile" && (
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-16 h-3.5 bg-gray-900 rounded-b-xl flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                    <div className="w-6 h-1 rounded-full bg-gray-700" />
                  </div>
                </div>
              )}
            </div>

            {/* Snap indicator during drag */}
            {isDragging && (
              <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-3">
                {BREAKPOINTS.map(bp => {
                  const distance = Math.abs(activeWidth - bp.width)
                  const isNear = distance < SNAP_THRESHOLD
                  return (
                    <div
                      key={bp.mode}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-all duration-150",
                        isNear 
                          ? "bg-blue-100 text-blue-700 scale-110" 
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <span>{bp.mode}</span>
                      <span className="text-[9px] opacity-60">{bp.width}px</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Smart alignment guides overlay */}
            {guides.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-50"
                style={{ width: activeWidth, height: '100%', left: 0, top: 0 }}
              >
                {guides.map((guide, i) => (
                  <line
                    key={i}
                    x1={guide.orientation === "vertical" ? guide.position : guide.start}
                    y1={guide.orientation === "horizontal" ? guide.position : guide.start}
                    x2={guide.orientation === "vertical" ? guide.position : guide.end}
                    y2={guide.orientation === "horizontal" ? guide.position : guide.end}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    opacity={0.8}
                  />
                ))}
              </svg>
            )}

            <Frame>
              <Element
                is={ContainerNode}
                canvas
                background="#f8fafc"
                padding={24}
                borderRadius={12}
              >
                <HeadingNode text="Welcome to Proyect-UI" level="h1" />
                <TextNode text="Drag and drop components from the palette on the left to start building your interface." />
                <ButtonNode text="Get Started" />
              </Element>
            </Frame>
          </div>
          {/* Right Drag Handle */}
          <div
            onMouseDown={(e) => handleDragStart(e, "right")}
            onTouchStart={(e) => handleDragStart(e, "right")}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-col-resize z-10",
              "group",
              isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
            )}
            style={{ touchAction: "none" }}
          >
            <div className={cn(
              "w-1.5 h-16 rounded-full transition-all duration-200",
              isDragging 
                ? "bg-blue-500 h-24 shadow-lg shadow-blue-500/30" 
                : "bg-gray-300 group-hover:bg-gray-400 group-hover:h-20"
            )} />
            <div className={cn(
              "absolute inset-0 bg-blue-500/5 rounded-lg transition-opacity",
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />
          </div>
        </div>

        {/* Width ruler at the bottom */}
        {showWidthIndicator && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-blue-400" />
                <span className="text-lg font-bold tabular-nums">{activeWidth}</span>
                <span className="text-xs text-gray-400">px</span>
              </div>
              <div className="w-px h-5 bg-gray-700" />
              <span className="text-sm text-gray-300">{getModeForWidth(activeWidth)}</span>
              
              {/* Snap indicator mini-ruler */}
              <div className="flex items-center gap-1 ml-2">
                {BREAKPOINTS.map(bp => (
                  <div
                    key={bp.mode}
                    className={cn(
                      "w-3 h-1 rounded-full transition-all",
                      Math.abs(activeWidth - bp.width) < SNAP_THRESHOLD 
                        ? "bg-blue-400 scale-125" 
                        : "bg-gray-600"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
