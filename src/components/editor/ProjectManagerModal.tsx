"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { X, Plus, Trash2, Edit3, Check, ExternalLink, FolderOpen, Clock, FileText, Search, GripVertical, Copy, CheckCircle2, Download, Upload, Tag, History, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  listProjects,
  createProject,
  renameProject,
  deleteProject,
  duplicateProject,
  reorderProjects,
  setActiveProject,
  getCurrentProject,
  exportProject,
  exportAllProjects,
  importProject,
  setProjectTags,
  type ProjectSummary,
} from "@/lib/projectManager"
import { HistoryTimeline } from "./HistoryTimeline"

interface ProjectManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectOpen: (projectId: number) => void
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  onProjectOpen,
}) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({})
  const [importError, setImportError] = useState<string | null>(null)
  const [historyProjectId, setHistoryProjectId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const [all, current] = await Promise.all([
      listProjects(),
      getCurrentProject(),
    ])
    setProjects(all)
    setActiveProjectId(current?.id ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadProjects()
      setSearchQuery("")
      setEditingId(null)
      setDeleteConfirmId(null)
      setCreatingNew(false)
    }
  }, [isOpen, loadProjects])

  const handleCreate = async () => {
    const name = newName.trim() || "Untitled Design"
    const id = await createProject("", name, newDescription.trim())
    if (id) {
      setActiveProject(id)
      onProjectOpen(id)
    }
    setCreatingNew(false)
    setNewName("")
    setNewDescription("")
  }

  const handleRename = async (id: number) => {
    if (editName.trim()) {
      await renameProject(id, editName.trim(), editDescription.trim())
    }
    // Save tags if they were edited
    const tagValue = tagInputs[id]
    if (tagValue !== undefined) {
      const tags = tagValue.split(',').map((t) => t.trim()).filter(Boolean)
      await setProjectTags(id, tags)
      setTagInputs((prev) => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    }
    setEditingId(null)
    loadProjects()
  }

  const handleDelete = async (id: number) => {
    await deleteProject(id)
    setDeleteConfirmId(null)
    loadProjects()
  }

  const handleOpen = (id: number) => {
    setActiveProject(id)
    onProjectOpen(id)
  }

  const startEditing = (project: ProjectSummary) => {
    setEditingId(project.id)
    setEditName(project.name)
    setEditDescription(project.description)
  }

  // ── Drag-and-drop handlers ──────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder the array
    const reordered = [...projects]
    const [movedItem] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, movedItem)

    // Update state immediately for responsive UI
    setProjects(reordered)
    setDragIndex(null)
    setDragOverIndex(null)

    // Persist the new order
    await reorderProjects(reordered.map((p) => p.id))
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDuplicate = async (id: number) => {
    const newId = await duplicateProject(id)
    if (newId) {
      setActiveProject(newId)
      onProjectOpen(newId)
    }
  }

  // Filter projects based on search (name, description, and tags)
  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FolderOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage your designs and layouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search + Create Bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              onClick={() => setCreatingNew(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
            <button
              onClick={async () => {
                const data = await exportAllProjects()
                if (data) {
                  const blob = new Blob([data], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `proyect-ui-projects-${new Date().toISOString().slice(0, 10)}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors ring-1 ring-gray-200 hover:ring-gray-300"
              title="Export all projects"
            >
              <Download size={15} />
              <span>Export</span>
            </button>
            <button
              onClick={() => document.getElementById("import-file-input")?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors ring-1 ring-gray-200 hover:ring-gray-300"
              title="Import projects"
            >
              <Upload size={15} />
              <span>Import</span>
            </button>
            <input
              ref={fileInputRef}
              id="import-file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setImportError(null)
                try {
                  const text = await file.text()
                  const id = await importProject(text)
                  if (id) {
                    setActiveProject(id)
                    onProjectOpen(id)
                  } else {
                    setImportError("Invalid project file format")
                  }
                } catch {
                  setImportError("Failed to read file")
                }
                // Reset input so the same file can be re-imported
                e.target.value = ""
              }}
            />
          </div>

          {/* Import Error */}
          {importError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <XCircle size={16} />
                {importError}
              </div>
              <button onClick={() => setImportError(null)} className="text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* New Project Form */}
          {creatingNew && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="My Amazing Design"
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate()
                      if (e.key === "Escape") setCreatingNew(false)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1.5">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="A brief description..."
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate()
                      if (e.key === "Escape") setCreatingNew(false)
                    }}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setCreatingNew(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-5 animate-pulse"
                >
                  <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-72 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first design project to get started"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setCreatingNew(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Create Project</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  draggable={deleteConfirmId !== project.id && editingId !== project.id}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group bg-white border border-gray-200 rounded-xl transition-all",
                    deleteConfirmId === project.id && "border-red-300 bg-red-50",
                    dragIndex === index && "opacity-50 scale-[0.98] shadow-sm",
                    dragOverIndex === index && dragIndex !== index && "border-blue-400 bg-blue-50/50 shadow-md scale-[1.01]",
                    dragIndex !== null && dragIndex !== index && "cursor-grab"
                  )}
                >
                  {deleteConfirmId === project.id ? (
                    /* Delete Confirmation */
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Delete &quot;{project.name}&quot;?
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                          This action cannot be undone.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : editingId === project.id ? (
                    /* Edit Form */
                    <div className="p-5 space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(project.id)
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(project.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                          />
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                              Tags (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={tagInputs[project.id] ?? project.tags}
                              onChange={(e) => setTagInputs((prev) => ({ ...prev, [project.id]: e.target.value }))}
                              placeholder="design, landing, responsive"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename(project.id)
                                if (e.key === "Escape") setEditingId(null)
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRename(project.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Check size={14} />
                              <span>Save</span>
                            </button>
                          </div>
                    </div>
                  ) : (
                    /* Project Card */
                    <div className="flex items-center gap-4 p-5">
                      {/* Drag Handle */}
                      <button
                        className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to reorder"
                        onMouseDown={(e) => {
                          // Prevent text selection when grabbing
                          e.preventDefault()
                        }}
                      >
                        <GripVertical size={18} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {project.name}
                          </h3>
                          {/* Active Project Badge */}
                          {activeProjectId === project.id && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0">
                              <CheckCircle2 size={10} />
                              Active
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        {/* Tags */}
                        {project.tags && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {project.tags.split(',').filter(Boolean).map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium"
                              >
                                <Tag size={9} />
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>
                              {new Date(project.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FileText size={12} />
                            <span>
                              Created{" "}
                              {new Date(project.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpen(project.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                          title="Open project"
                        >
                          <ExternalLink size={12} />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(project.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                          title="Duplicate project"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => startEditing(project)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setHistoryProjectId(project.id)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-all"
                          title="View history"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const data = await exportProject(project.id)
                            if (data) {
                              const blob = new Blob([data], { type: "application/json" })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement("a")
                              a.href = url
                              a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`
                              a.click()
                              URL.revokeObjectURL(url)
                            }
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                          title="Export project"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <GripVertical size={12} className="opacity-50" />
              Drag the grip handle to reorder projects
            </span>
          </p>
          <p className="text-xs text-gray-400">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* History Timeline */}
      {historyProjectId && (
        <HistoryTimeline
          isOpen={true}
          onClose={() => setHistoryProjectId(null)}
          projectId={historyProjectId}
          projectName={projects.find((p) => p.id === historyProjectId)?.name || "Project"}
          onRestore={() => window.location.reload()}
        />
      )}
    </div>
  )
}
