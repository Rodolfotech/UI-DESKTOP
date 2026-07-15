"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useEditor } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { Code, ChevronDown, ChevronUp, Copy, Check, X } from "lucide-react"
import { generateReactCode } from "@/lib/codeGenerator"

interface LiveCodePanelProps {
  className?: string
}

// ── Simple syntax highlighter (no external dependency) ──────────────

function highlightJSX(code: string): string {
  // Escape HTML entities
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Highlight JSX tags: <Tag ...>
  escaped = escaped.replace(
    /(&lt;\/?)([\w-]+)/g,
    '$1<span class="code-tag">$2</span>'
  )

  // Highlight JSX attributes: attr="value" or attr='value' or attr={value}
  escaped = escaped.replace(
    /(\s)([\w-]+)(=)(&quot;|&#39;|{)/g,
    '$1<span class="code-attr">$2</span>$3$4'
  )

  // Highlight string values in quotes
  escaped = escaped.replace(
    /(&quot;[^&]*&quot;|&#39;[^&#]*&#39;)/g,
    '<span class="code-string">$1</span>'
  )

  // Highlight JSX expressions: {expression}
  escaped = escaped.replace(
    /({[^}]+})/g,
    '<span class="code-expression">$1</span>'
  )

  // Highlight comments
  escaped = escaped.replace(
    /(\/\/.*)/g,
    '<span class="code-comment">$1</span>'
  )

  return escaped
}

// ── LiveCodePanel ───────────────────────────────────────────────────

export const LiveCodePanel: React.FC<LiveCodePanelProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLPreElement>(null)

  // Get serialized editor state for code generation
  const { query } = useEditor()
  const queryRef = useRef(query)
  queryRef.current = query // always keep ref up-to-date without triggering re-renders

  // Generate code with debounce (only when panel is open, limit to every 500ms)
  const [generatedCode, setGeneratedCode] = useState("")
  const lastGenerateRef = useRef(0)
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const generate = () => {
      const now = Date.now()
      if (now - lastGenerateRef.current < 500) {
        if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
        generateTimerRef.current = setTimeout(generate, 500)
        return
      }
      lastGenerateRef.current = now
      try {
        const json = queryRef.current.serialize()
        const code = generateReactCode(json)
        setGeneratedCode(code)
      } catch (err) {
        console.error("[LiveCode] Generation error:", err)
        setGeneratedCode("// Error generating code")
      }
    }

    generate()
    const interval = setInterval(generate, 2000)
    return () => {
      clearInterval(interval)
      if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
    }
  }, [isOpen]) // removed query from deps — use queryRef instead

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [generatedCode])

  const highlightedCode = useMemo(
    () => (generatedCode ? highlightJSX(generatedCode) : '// Select a component or add elements to the canvas'),
    [generatedCode]
  )

  return (
    <div className={cn("border-t border-gray-200 dark:border-gray-700", className)}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2.5 transition-colors",
          isOpen
            ? "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
            : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        <Code size={15} />
        <span className="text-xs font-semibold uppercase tracking-wider">Live Code</span>
        <span className={cn(
          "ml-auto text-[10px] text-gray-400",
          isOpen && "text-blue-400"
        )}>
          {generatedCode ? `${generatedCode.split('\n').length} lines` : "—"}
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Code panel */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-black">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
            <span className="text-[10px] text-gray-500 font-mono">TSX</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <><Check size={11} className="text-emerald-400" /> Copied</>
                ) : (
                  <><Copy size={11} /> Copy</>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Code content */}
          <div className="max-h-48 overflow-auto">
            <pre
              ref={codeRef}
              className="p-3 text-[11px] font-mono leading-relaxed text-gray-300 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </div>
        </div>
      )}

      {/* Code highlighting styles are defined in globals.css */}
    </div>
  )
}
