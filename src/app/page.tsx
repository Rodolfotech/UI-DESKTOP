"use client"

import dynamic from "next/dynamic"
import React, { useState, useCallback, useRef } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import { setActiveProject } from "@/lib/projectManager"
import type { ViewMode } from "@/components/editor/TopBar"

// ── Dynamic imports — modals are heavy (craftjs, nodes, templates, jszip, icons)
// They're loaded lazily only when the user opens them.

const ExportModal = dynamic(
  () => import("@/components/editor/ExportModal").then((mod) => mod.ExportModal),
  { ssr: false }
)

const PreviewModal = dynamic(
  () => import("@/components/editor/PreviewModal").then((mod) => mod.PreviewModal),
  { ssr: false }
)

const ProjectManagerModal = dynamic(
  () => import("@/components/editor/ProjectManagerModal").then((mod) => mod.ProjectManagerModal),
  { ssr: false }
)

const DeployModal = dynamic(
  () => import("@/components/editor/DeployModal").then((mod) => mod.DeployModal),
  { ssr: false }
)

const BackupModal = dynamic(
  () => import("@/components/editor/BackupModal").then((mod) => mod.BackupModal),
  { ssr: false }
)

// Dynamically import the editor (with TopBar inside) to avoid SSR issues with Craft.js
const EditorArea = dynamic(() => import("@/components/editor/EditorArea").then((mod) => mod.EditorArea), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* TopBar skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-pulse" />
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      {/* Editor skeleton — 3-column layout mimicking the real editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar skeleton (Palette) */}
        <div className="w-72 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-2.5 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center canvas skeleton */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl min-h-[400px] p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-blue-500/20">
              <div className="w-8 h-8 bg-white/80 rounded-lg" />
            </div>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-6" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-10 w-28 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Loading editor components...
          </p>
        </div>

        {/* Right sidebar skeleton (Inspector) */}
        <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
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
