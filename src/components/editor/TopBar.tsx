"use client"

import React, { useState } from "react"
import { useEditor } from "@craftjs/core"
import { 
  Undo2, 
  Redo2, 
  Download, 
  Code, 
  Eye, 
  Settings,
  Save,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  FolderOpen,
  Sun,
  Moon,
  Rocket,
  Shield,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ThemeProvider"
import { Tooltip } from "@/components/ui/Tooltip"

export type ViewMode = "desktop" | "tablet" | "mobile"

interface TopBarProps {
  projectName?: string
  zoom?: number
  onZoomChange?: (zoom: number) => void
  onExportCode?: () => void
  onSave?: () => void
  onClear?: () => void
  onProjectsClick?: () => void
  onPreviewClick?: () => void
  onDeployClick?: () => void
  onBackupClick?: () => void
  lastSaved?: string
  hasUnsavedChanges?: boolean
  draftStatus?: "saving" | "saved" | null
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

export const TopBar: React.FC<TopBarProps> = ({ projectName, zoom = 100, onZoomChange, onExportCode, onSave, onClear, onProjectsClick, onPreviewClick, onDeployClick, onBackupClick, lastSaved, hasUnsavedChanges, draftStatus, viewMode = "desktop", onViewModeChange }) => {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))
  const { theme, toggleTheme } = useTheme()


  const [showCode, setShowCode] = useState(false)

  const viewModes = [
    { mode: "desktop" as const, icon: Monitor, label: "Desktop" },
    { mode: "tablet" as const, icon: Tablet, label: "Tablet" },
    { mode: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between transition-colors">
      {/* Left - Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Layers size={16} className="text-white" />
          </div>
        </div>

        {/* Breadcrumb: Proyect-UI / Project Name */}
        <nav className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="font-semibold text-gray-900 dark:text-white shrink-0">Proyect-UI</span>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
            {projectName || "Untitled Design"}
          </span>

          {/* Save Status Indicator — minimal dot (more detailed status shown next to Save button) */}
          <span className="ml-1.5 shrink-0">
            {draftStatus === "saving" && (
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            )}
            {draftStatus === "saved" && (
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400" />
            )}
            {lastSaved && !hasUnsavedChanges && !draftStatus && (
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400" />
            )}
            {hasUnsavedChanges && !draftStatus && (
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </span>
        </nav>
      </div>

      {/* Center - History Controls */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <Tooltip content="Undo" shortcut="Ctrl+Z">
          <button
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-md transition-all",
              canUndo 
                ? "hover:bg-white dark:hover:bg-gray-700 hover:shadow text-gray-700 dark:text-gray-200" 
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            )}
          >
            <Undo2 size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Redo" shortcut="Ctrl+Shift+Z">
          <button
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-md transition-all",
              canRedo 
                ? "hover:bg-white dark:hover:bg-gray-700 hover:shadow text-gray-700 dark:text-gray-200" 
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            )}
          >
            <Redo2 size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Right - Actions grouped by context */}
      <div className="flex items-center gap-2">
        {/* ── VIEW GROUP (Viewport + Zoom) ─────────────────────── */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <Tooltip key={mode} content={label}>
              <button
                onClick={() => onViewModeChange?.(mode)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === mode 
                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                )}
              >
                <Icon size={15} />
              </button>
            </Tooltip>
          ))}
          <span className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <Tooltip content="Zoom Out" shortcut="Ctrl+-">
            <button
              onClick={() => onZoomChange?.(Math.max(50, zoom - 10))}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
            >
              <ZoomOut size={14} />
            </button>
          </Tooltip>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 w-8 text-center tabular-nums select-none">
            {zoom}%
          </span>
          <Tooltip content="Zoom In" shortcut="Ctrl+=">
            <button
              onClick={() => onZoomChange?.(Math.min(200, zoom + 10))}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
            >
              <ZoomIn size={14} />
            </button>
          </Tooltip>
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* ── PROJECT GROUP ────────────────────────────────────── */}
        <Tooltip content="Manage projects">
          <button
            onClick={onProjectsClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <FolderOpen size={15} />
            <span>Projects</span>
          </button>
        </Tooltip>
        <Tooltip content="Database backup">
          <button
            onClick={onBackupClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <Shield size={15} />
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* ── ACTIONS GROUP (Preview + Code + Deploy) ──────────── */}
        <Tooltip content="Preview design">
          <button
            onClick={onPreviewClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <Eye size={15} />
            <span>Preview</span>
          </button>
        </Tooltip>
        <Tooltip content="View generated code">
          <button
            onClick={() => setShowCode(!showCode)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              showCode 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}
          >
            <Code size={15} />
            <span>Code</span>
          </button>
        </Tooltip>
        <Tooltip content="Deploy to Vercel">
          <button
            onClick={onDeployClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            <Rocket size={15} />
            <span>Deploy</span>
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* ── SETTINGS GROUP ───────────────────────────────────── */}
        <Tooltip content={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* Save Status bar — detailed indicator next to Save button */}
        <div className="flex items-center">
          {(hasUnsavedChanges || lastSaved || draftStatus) && (
            <div className="mr-2 text-[10px] leading-none">
              {draftStatus === "saving" && (
                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Saving...
                </span>
              )}
              {draftStatus === "saved" && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Draft saved
                </span>
              )}
              {!draftStatus && hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {!draftStatus && !hasUnsavedChanges && lastSaved && (
                <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Saved {lastSaved}
                </span>
              )}
            </div>
          )}

          {/* Save / Clear */}
          <div className={cn(
            "flex items-center gap-1 rounded-lg p-0.5 transition-all duration-300",
            hasUnsavedChanges && !draftStatus
              ? "bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-300 dark:ring-amber-700"
              : "bg-gray-100 dark:bg-gray-800"
          )}>
            <Tooltip content={hasUnsavedChanges ? "Save changes (Ctrl+S)" : "Save to local storage (Ctrl+S)"}>
              <button
                onClick={onSave}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all",
                  hasUnsavedChanges && !draftStatus
                    ? "bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-700/50 shadow-sm"
                    : "hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-600 dark:text-gray-400"
                )}
              >
                <Save size={13} className={cn(
                  hasUnsavedChanges && !draftStatus && "animate-pulse"
                )} />
                <span>Save</span>
              </button>
            </Tooltip>
            <Tooltip content="Clear saved design">
              <button
                onClick={onClear}
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 dark:text-gray-500 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Export (primary CTA) */}
        <Tooltip content="Export generated code" shortcut="Ctrl+E">
          <button
            onClick={onExportCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
