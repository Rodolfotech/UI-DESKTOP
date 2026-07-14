"use client"

import React, { useState, useMemo } from "react"
import { X, Copy, Check, Download, FileCode, Braces } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateReactCode } from "@/lib/codeGenerator"
import { designSystemRegistry } from "@/lib/designSystems/registry"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  jsonData: string
}

const TAB_ICONS = {
  json: Braces,
  code: FileCode,
} as const

type TabKey = "json" | "code"

const TABS: { key: TabKey; label: string; language: string; extension: string }[] = [
  { key: "json", label: "JSON Structure", language: "json", extension: "json" },
  { key: "code", label: "React Component", language: "tsx", extension: "tsx" },
]

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  jsonData 
}) => {
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("json")

  const generatedCode = useMemo(() => {
    try {
      const activeDS = designSystemRegistry.getActive()
      return generateReactCode(jsonData, activeDS)
    } catch {
      return "// Error generating code. The design may be empty or corrupted."
    }
  }, [jsonData])

  if (!isOpen) return null

  const getActiveContent = (): string => {
    return activeTab === "json" ? jsonData : generatedCode
  }

  const getActiveExtension = (): string => {
    return TABS.find((t) => t.key === activeTab)?.extension || "txt"
  }

  const handleCopy = async () => {
    const content = getActiveContent()
    try {
      await navigator.clipboard.writeText(content)
      setCopiedContent(content)
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownload = () => {
    const content = getActiveContent()
    const extension = getActiveExtension()
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proyect-ui-design.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isCopied = copiedContent === getActiveContent()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Design</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Export your design as React code or raw JSON
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {TABS.map(({ key, label }) => {
            const Icon = TAB_ICONS[key]
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
                  activeTab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            )
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Code stats */}
          {activeTab === "code" && (
            <div className="flex items-center text-xs text-gray-400">
              {generatedCode.split("\n").length} lines
            </div>
          )}
          {activeTab === "json" && (
            <div className="flex items-center text-xs text-gray-400">
              {(jsonData.length / 1024).toFixed(1)} KB
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="relative group">
            <pre className="bg-[#1e1e2e] text-gray-100 rounded-xl p-5 text-sm leading-relaxed overflow-x-auto font-mono">
              <code>{getActiveContent()}</code>
            </pre>
            {/* Quick copy overlay */}
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Copy to clipboard"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400">
            {activeTab === "code" 
              ? "Uses Tailwind CSS for styling. Compatible with Next.js and React."
              : "Craft.js serialized node tree. Importable via deserialize()."}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                isCopied 
                  ? "bg-green-100 text-green-700 ring-1 ring-green-300" 
                  : "bg-white hover:bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:ring-gray-300"
              )}
            >
              {isCopied ? (
                <>
                  <Check size={15} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
            >
              <Download size={15} />
              <span>Download {TABS.find((t) => t.key === activeTab)?.extension.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
