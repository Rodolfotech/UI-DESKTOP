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
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ThemeProvider"

export type ViewMode = "desktop" | "tablet" | "mobile"

interface TopBarProps {
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

export const TopBar: React.FC<TopBarProps> = ({ onExportCode, onSave, onClear, onProjectsClick, onPreviewClick, onDeployClick, onBackupClick, lastSaved, hasUnsavedChanges, draftStatus, viewMode = "desktop", onViewModeChange }) => {
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
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Proyect-UI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Visual Editor</p>
          </div>
        </div>
      </div>

      {/* Center - History Controls */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => actions.history.undo()}
          disabled={!canUndo}
          className={cn(
            "p-2 rounded-md transition-all",
            canUndo 
              ? "hover:bg-white dark:hover:bg-gray-700 hover:shadow text-gray-700 dark:text-gray-200" 
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={() => actions.history.redo()}
          disabled={!canRedo}
          className={cn(
            "p-2 rounded-md transition-all",
            canRedo 
              ? "hover:bg-white dark:hover:bg-gray-700 hover:shadow text-gray-700 dark:text-gray-200" 
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          )}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Right - View & Actions */}
      <div className="flex items-center gap-3">
        {/* Viewport Mode */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange?.(mode)}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === mode 
                  ? "bg-white shadow text-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Projects Button */}
        <button
          onClick={onProjectsClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition-colors"
          title="Manage projects"
        >
          <FolderOpen size={16} />
          <span>Projects</span>
        </button>

        <button
          onClick={onBackupClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition-colors"
          title="Database backup"
        >
          <Shield size={16} />
          <span>Backup</span>
        </button>

        <div className="w-px h-6 bg-gray-200" />

        {/* Action Buttons */}
        <button
          onClick={() => setShowCode(!showCode)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            showCode 
              ? "bg-blue-100 text-blue-700" 
              : "hover:bg-gray-100 text-gray-700"
          )}
        >
          <Code size={16} />
          <span>Code</span>
        </button>

        <button
          onClick={onPreviewClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition-colors"
          title="Preview design"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <button
          onClick={onDeployClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
          title="Deploy to Vercel"
        >
          <Rocket size={16} />
          <span>Deploy</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        {/* Save/Clear Actions */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:shadow text-gray-700 transition-all"
            title="Save to local storage"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:shadow text-gray-700 transition-all"
            title="Clear saved design"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>

        <button
          onClick={onExportCode}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          <span>Export</span>
        </button>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2">
          {/* Draft auto-save status */}
          {draftStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Saving...
            </span>
          )}
          {draftStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Draft saved
            </span>
          )}
          {/* Storage save status (localStorage) */}
          {lastSaved && !hasUnsavedChanges && !draftStatus ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Saved {lastSaved}
            </span>
          ) : hasUnsavedChanges && !draftStatus ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
