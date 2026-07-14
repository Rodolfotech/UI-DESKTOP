"use client"

import React, { useRef, useEffect, useState, useMemo } from "react"
import { History, Undo2, Redo2, X, Search, RotateCcw, ArrowUp, Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/hooks/useHistoryTracker"

interface HistoryDropdownProps {
  entries: HistoryEntry[]
  currentIndex: number
  isOpen: boolean
  canUndo: boolean
  canRedo: boolean
  onToggle: () => void
  onClose: () => void
  onNavigate: (index: number) => void
  onUndo: () => void
  onRedo: () => void
}

type ActionType = "all" | "added" | "modified" | "deleted" | "reordered" | "initial"

interface ActionFilter {
  type: ActionType
  label: string
  icon: React.ReactNode
  color: string
  activeColor: string
}

const ACTION_FILTERS: ActionFilter[] = [
  { type: "all", label: "All", icon: null, color: "bg-gray-100 text-gray-600", activeColor: "bg-gray-800 text-white" },
  { type: "added", label: "Added", icon: <Plus size={10} />, color: "bg-emerald-50 text-emerald-600", activeColor: "bg-emerald-600 text-white" },
  { type: "modified", label: "Modified", icon: <Pencil size={10} />, color: "bg-amber-50 text-amber-600", activeColor: "bg-amber-600 text-white" },
  { type: "deleted", label: "Deleted", icon: <Trash2 size={10} />, color: "bg-rose-50 text-rose-600", activeColor: "bg-rose-600 text-white" },
  { type: "reordered", label: "Reordered", icon: <ArrowUp size={10} />, color: "bg-violet-50 text-violet-600", activeColor: "bg-violet-600 text-white" },
  { type: "initial", label: "Initial", icon: <RotateCcw size={10} />, color: "bg-sky-50 text-sky-600", activeColor: "bg-sky-600 text-white" },
]

function getActionType(description: string): ActionType {
  const lower = description.toLowerCase()
  if (lower === "initial state") return "initial"
  if (lower.startsWith("added")) return "added"
  if (lower.startsWith("modified")) return "modified"
  if (lower.startsWith("deleted") || lower.startsWith("delete")) return "deleted"
  if (lower.startsWith("reordered")) return "reordered"
  // "Modified design" fallback
  if (lower === "modified design") return "modified"
  return "modified"
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 1000) return "just now"
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

// Highlight matching search text in a string
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 font-medium">{part}</span>
      : part
  )
}

export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  entries,
  currentIndex,
  isOpen,
  canUndo,
  canRedo,
  onToggle,
  onClose,
  onNavigate,
  onUndo,
  onRedo,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<ActionType>("all")

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    // Reset filters when closed
    if (!isOpen) {
      setSearchQuery("")
      setActionFilter("all")
    }
  }, [isOpen])

  // Scroll to current item when opened or when filters change
  useEffect(() => {
    if (isOpen && listRef.current) {
      const currentItem = listRef.current.querySelector("[data-current=\"true\"]")
      if (currentItem) {
        currentItem.scrollIntoView({ block: "center", behavior: "smooth" })
      }
    }
  }, [isOpen, searchQuery, actionFilter])

  // Filter entries based on search query and action type filter
  // Returns both the entry and its original index for navigation/timeline
  const filteredData = useMemo(() => {
    return entries.reduce<{ entry: HistoryEntry; originalIndex: number }[]>((acc, entry, i) => {
      if (actionFilter !== "all" && getActionType(entry.description) !== actionFilter) return acc
      if (searchQuery.trim() && !entry.description.toLowerCase().includes(searchQuery.toLowerCase())) return acc
      acc.push({ entry, originalIndex: i })
      return acc
    }, [])
  }, [entries, actionFilter, searchQuery])

  // Get counts per action type
  const actionCounts = useMemo(() => {
    const counts = new Map<ActionType, number>()
    for (const entry of entries) {
      const type = getActionType(entry.description)
      counts.set(type, (counts.get(type) || 0) + 1)
    }
    return counts
  }, [entries])

  const futureCount = entries.length - 1 - currentIndex
  const hasActiveFilter = actionFilter !== "all" || searchQuery.trim().length > 0

  return (
    <div ref={dropdownRef} className="relative">
      {/* History trigger button */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          isOpen
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-100 text-gray-700"
        )}
        title="History"
      >
        <History size={16} />
        <span className="hidden sm:inline">History</span>
        {entries.length > 1 && (
          <span className="text-[10px] text-gray-400 font-normal ml-0.5">
            {currentIndex}/{entries.length - 1}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <History size={16} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">History</span>
              {hasActiveFilter && (
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  {filteredData.length} shown
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search input */}
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by component name..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Action type filter chips */}
          <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap">
            {ACTION_FILTERS.map((f) => {
              const count = f.type === "all" ? entries.length : actionCounts.get(f.type) || 0
              if (count === 0 && f.type !== "all") return null
              return (
                <button
                  key={f.type}
                  onClick={() => setActionFilter(f.type)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                    actionFilter === f.type
                      ? f.activeColor + " shadow-sm"
                      : f.color + " hover:opacity-80"
                  )}
                >
                  {f.icon}
                  <span>{f.label}</span>
                  <span className={cn(
                    "text-[9px] ml-0.5",
                    actionFilter === f.type ? "opacity-80" : "opacity-60"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setActionFilter("all")
                  setSearchQuery("")
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all ml-auto"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Navigation controls */}
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                canUndo
                  ? "hover:bg-white hover:shadow text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              )}
            >
              <Undo2 size={14} />
              <span>Undo</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                canRedo
                  ? "hover:bg-white hover:shadow text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              )}
            >
              <Redo2 size={14} />
              <span>Redo</span>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                {hasActiveFilter
                  ? `${filteredData.length} of ${entries.length}`
                  : `${currentIndex + 1} of ${entries.length}`
                }
              </span>
              {hasActiveFilter && (
                <div className="w-1 h-1 rounded-full bg-blue-400" />
              )}
            </div>
          </div>

          {/* History list */}
          <div
            ref={listRef}
            className="max-h-72 overflow-y-auto overscroll-contain"
          >
            {filteredData.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Search size={24} className="mx-auto mb-2 text-gray-300" />
                <div className="text-sm text-gray-400 font-medium">No matching entries</div>
                <div className="text-[10px] text-gray-300 mt-1">
                  Try a different search or filter
                </div>
                {hasActiveFilter && (
                  <button
                    onClick={() => {
                      setActionFilter("all")
                      setSearchQuery("")
                    }}
                    className="mt-3 text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredData.map(({ entry, originalIndex }) => {
                const isPast = originalIndex < currentIndex
                const isCurrent = originalIndex === currentIndex
                const isFuture = originalIndex > currentIndex
                const actionType = getActionType(entry.description)

                return (
                  <button
                    key={entry.id}
                    data-current={isCurrent ? "true" : "false"}
                    onClick={() => onNavigate(originalIndex)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors border-l-2",
                      isCurrent
                        ? "bg-blue-50 border-l-blue-500 hover:bg-blue-100"
                        : isPast
                          ? "border-l-transparent hover:bg-gray-50"
                          : "border-l-transparent hover:bg-gray-50 opacity-60"
                    )}
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full ring-1",
                          isCurrent
                            ? "bg-blue-500 ring-blue-300"
                            : isPast
                              ? "bg-gray-400 ring-gray-200"
                              : "bg-gray-300 ring-gray-200"
                        )}
                      />
                      {originalIndex < entries.length - 1 && (
                        <div className="w-px h-full bg-gray-200" />
                      )}
                    </div>

                    {/* Entry content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm leading-tight truncate",
                          isCurrent
                            ? "font-semibold text-blue-900"
                            : "text-gray-700"
                        )}
                      >
                        {searchQuery.trim() ? highlightText(entry.description, searchQuery) : entry.description}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        {/* Action type badge */}
                        <span className={cn(
                          "text-[9px] font-medium px-1 py-0.5 rounded",
                          actionType === "added" && "text-emerald-600 bg-emerald-50",
                          actionType === "modified" && "text-amber-600 bg-amber-50",
                          actionType === "deleted" && "text-rose-600 bg-rose-50",
                          actionType === "reordered" && "text-violet-600 bg-violet-50",
                          actionType === "initial" && "text-sky-600 bg-sky-50",
                        )}>
                          {actionType === "added" && <Plus size={8} className="inline mr-0.5" />}
                          {actionType === "modified" && <Pencil size={8} className="inline mr-0.5" />}
                          {actionType === "deleted" && <Trash2 size={8} className="inline mr-0.5" />}
                          {actionType === "reordered" && <ArrowUp size={8} className="inline mr-0.5" />}
                          {actionType === "initial" && <RotateCcw size={8} className="inline mr-0.5" />}
                          {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Current indicator */}
                    {isCurrent && (
                      <div className="flex-shrink-0">
                        <div className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          NOW
                        </div>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-gray-400">Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-[10px] text-gray-400">Past</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-[10px] text-gray-400">
                  {futureCount > 0 ? `${futureCount} future` : "Future"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[10px] text-gray-400 hover:text-gray-600 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
