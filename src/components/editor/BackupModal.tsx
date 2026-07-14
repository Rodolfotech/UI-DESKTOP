"use client"

import React, { useState, useRef, useCallback } from "react"
import { X, Download, Upload, FileUp, Check, AlertTriangle, Shield, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  downloadBackup,
  importFullBackup,
  readBackupFile,
  type BackupResult,
} from "@/lib/db-backup"

interface BackupModalProps {
  isOpen: boolean
  onClose: () => void
}

type BackupStatus = "idle" | "exporting" | "exported" | "importing" | "success" | "error"

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<BackupStatus>("idle")
  const [result, setResult] = useState<BackupResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStatus("idle")
      setResult(null)
    }
  }, [isOpen])

  const handleExport = useCallback(async () => {
    setStatus("exporting")
    try {
      await downloadBackup()
      setStatus("exported")
      setResult({ success: true, message: "Backup downloaded successfully" })
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("error")
      setResult({ success: false, message: "Failed to create backup" })
    }
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith(".json")) {
      setStatus("error")
      setResult({ success: false, message: "Please select a .json backup file" })
      return
    }

    setStatus("importing")
    try {
      const content = await readBackupFile(file)
      const importResult = await importFullBackup(content)
      setResult(importResult)
      setStatus(importResult.success ? "success" : "error")

      if (importResult.success) {
        // Auto-refresh after 2s so the user sees the success message
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch {
      setStatus("error")
      setResult({ success: false, message: "Failed to read or import file" })
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Database Backup</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Export or import your entire project database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Export Section */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                <Download size={20} className="text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Export Backup
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Download all projects and their history as a single JSON file.
                  Perfect for transfering between computers or keeping a safety copy.
                </p>
                <button
                  onClick={handleExport}
                  disabled={status === "exporting"}
                  className={cn(
                    "mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    status === "exported"
                      ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25"
                  )}
                >
                  {status === "exporting" ? (
                    <>
                      <Package size={15} className="animate-pulse" />
                      <span>Exporting...</span>
                    </>
                  ) : status === "exported" ? (
                    <>
                      <Check size={15} />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Download Backup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Import Backup
              </span>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragOver
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FileUp size={24} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDragOver ? "Drop file here" : "Click or drag a backup file"}
                </p>
                <p className="text-xs text-gray-400">
                  Only .json backup files are supported
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {result && (
            <div
              className={cn(
                "p-4 rounded-xl border flex items-start gap-3",
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              )}
            >
              {result.success ? (
                <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                  )}
                >
                  {result.success ? "Import successful" : "Import failed"}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {result.message}
                </p>
                {result.projectCount !== undefined && (
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-green-600 dark:text-green-400">
                      {result.projectCount} projects
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {result.snapshotCount} snapshots
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  About backup format
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  The backup includes all projects and their revision history as a
                  single JSON file. This format is compatible across Ubuntu and
                  Windows. Use it to safely transfer your work between machines
                  running the Tauri desktop app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
