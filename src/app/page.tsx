"use client"

import dynamic from "next/dynamic"
import React, { useState, useCallback, useRef } from "react"
import { ExportModal } from "@/components/editor/ExportModal"
import { PreviewModal } from "@/components/editor/PreviewModal"
import { ProjectManagerModal } from "@/components/editor/ProjectManagerModal"
import { DeployModal } from "@/components/editor/DeployModal"
import { BackupModal } from "@/components/editor/BackupModal"
import { useAutoSave } from "@/hooks/useAutoSave"
import { setActiveProject } from "@/lib/projectManager"
import type { ViewMode } from "@/components/editor/TopBar"

// Dynamically import the editor (with TopBar inside) to avoid SSR issues with Craft.js
const EditorArea = dynamic(() => import("@/components/editor/EditorArea").then((mod) => mod.EditorArea), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors">
      {/* TopBar skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      {/* Editor skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white/80 rounded" />
          </div>
          <p className="text-gray-500 text-sm">Loading editor...</p>
        </div>
      </div>
    </div>
  ),
})

export default function Home() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportData, setExportData] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("desktop")
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState("")
  const [isDeployOpen, setIsDeployOpen] = useState(false)
  const [deployData, setDeployData] = useState("")
  const [isBackupOpen, setIsBackupOpen] = useState(false)
  const { save, load, clear, forceSaveNow, lastSaved, hasUnsavedChanges } = useAutoSave()
  const saveDataRef = useRef<string>("")

  const handleExportCode = useCallback(() => {
    const editorState = load()
    if (editorState) {
      setExportData(editorState)
    } else {
      setExportData(JSON.stringify({ message: "No design data found" }, null, 2))
    }
    setIsExportModalOpen(true)
  }, [load])

  const handleSave = useCallback(() => {
    if (saveDataRef.current) {
      forceSaveNow(saveDataRef.current)
    }
  }, [forceSaveNow])

  const handleSaveCallback = useCallback((json: string) => {
    saveDataRef.current = json
    save(json)
  }, [save])

  const handleClear = useCallback(() => {
    clear()
    window.location.reload()
  }, [clear])

  const handleProjectOpen = useCallback((projectId: number) => {
    setActiveProject(projectId)
    // Reload so EditorLoader picks up the new project from the project manager
    window.location.reload()
  }, [])

  const handlePreviewClick = useCallback(() => {
    const editorState = load()
    if (editorState) {
      setPreviewData(editorState)
    } else {
      // If no saved state, show a placeholder
      setPreviewData(JSON.stringify({
        ROOT: {
          type: { resolvedName: "ContainerNode" },
          props: {
            background: "#f8fafc",
            padding: 24,
            borderRadius: 12,
          },
          nodes: [],
        },
      }))
    }
    setIsPreviewOpen(true)
  }, [load])

  const handleDeployClick = useCallback(() => {
    const editorState = load()
    if (editorState) {
      setDeployData(editorState)
    } else {
      setDeployData(JSON.stringify({ message: "No design data found" }, null, 2))
    }
    setIsDeployOpen(true)
  }, [load])

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors">
      <EditorArea
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        save={handleSaveCallback}
        onExportCode={handleExportCode}
        onSave={handleSave}
        onClear={handleClear}
        onProjectsClick={() => setIsProjectManagerOpen(true)}
        onDeployClick={handleDeployClick}
        onPreviewClick={handlePreviewClick}
        onBackupClick={() => setIsBackupOpen(true)}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        jsonData={exportData}
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        jsonData={previewData}
      />

      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        jsonData={deployData}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        onProjectOpen={handleProjectOpen}
      />
    </div>
  )
}
