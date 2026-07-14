"use client"

import React, { useState, useEffect, useCallback } from "react"
import { X, Clock, RotateCcw, Trash2, History, FileJson, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getProjectHistory,
  restoreProjectSnapshot,
  deleteProjectSnapshot,
  saveProjectSnapshot,
  type ProjectSnapshot,
} from "@/lib/projectManager"

interface HistoryTimelineProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
  onRestore: () => void
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onRestore,
}) => {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    const history = await getProjectHistory(projectId)
    setSnapshots(history)
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    if (isOpen) {
      loadHistory()
      setRestoreSuccess(false)
      setDeleteConfirmId(null)
    }
  }, [isOpen, loadHistory])

  const handleSaveSnapshot = async () => {
    const id = await saveProjectSnapshot(projectId, "Manual save")
    if (id) loadHistory()
  }

  const handleRestore = async (snapshotId: number) => {
    setRestoringId(snapshotId)

    // Save a "before restore" snapshot to allow undo
    await saveProjectSnapshot(projectId, 'Before restore: ' + (snapshots.find(s => s.id === snapshotId)?.description || 'unknown'))

    const success = await restoreProjectSnapshot(projectId, snapshotId)
    setRestoringId(null)
    if (success) {
      setRestoreSuccess(true)
      setTimeout(() => {
        onRestore()
        onClose()
      }, 1500)
    }
  }

  const handleDeleteSnapshot = async (snapshotId: number) => {
    await deleteProjectSnapshot(snapshotId)
    setDeleteConfirmId(null)
    loadHistory()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <History size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Version history for "{projectName}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleSaveSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <FileJson size={13} />
            <span>Save Snapshot</span>
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {restoreSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Snapshot restored!</p>
                <p className="text-xs text-green-600 mt-0.5">Reloading editor with restored state...</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No history yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Save a snapshot to track your project's version history.
              </p>
              <button
                onClick={handleSaveSnapshot}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FileJson size={16} />
                <span>Save First Snapshot</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {snapshots.map((snapshot, index) => {
                  const isLatest = index === 0
                  return (
                    <div key={snapshot.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0 mt-1">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-white",
                            isLatest
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          )}
                        >
                          <Clock size={15} />
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 min-w-0">
                        {deleteConfirmId === snapshot.id ? (
                          <div className="bg-white border border-red-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-red-800">
                              Delete this snapshot?
                            </p>
                            <p className="text-xs text-red-600 mt-0.5 mb-3">
                              This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteSnapshot(snapshot.id)}
                                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "bg-white border rounded-xl p-4 transition-all",
                              isLatest
                                ? "border-amber-200 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {snapshot.description}
                                  </p>
                                  {isLatest && (
                                    <span className="inline-flex px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase shrink-0">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(snapshot.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              <div className="flex items-center gap-1 ml-3 shrink-0">
                                <button
                                  onClick={() => handleRestore(snapshot.id)}
                                  disabled={restoringId !== null}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    restoringId === snapshot.id
                                      ? "bg-blue-100 text-blue-400"
                                      : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                                  )}
                                  title="Restore this version"
                                >
                                  {restoringId === snapshot.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <RotateCcw size={12} />
                                  )}
                                  <span>Restore</span>
                                </button>
                                {!isLatest && (
                                  <button
                                    onClick={() => setDeleteConfirmId(snapshot.id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                    title="Delete snapshot"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <AlertTriangle size={11} />
            Restoring will replace the current editor state
          </p>
          <p className="text-xs text-gray-400">
            Auto-saves every significant change (max 50)
          </p>
        </div>
      </div>
    </div>
  )
}
