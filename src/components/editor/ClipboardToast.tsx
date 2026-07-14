"use client"

import React, { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Copy, Clipboard } from "lucide-react"

export interface ClipboardFeedback {
  type: "copied" | "pasted" | "duplicated" | "unsupported" | null
  name?: string
}

const icons: Record<string, React.ElementType> = {
  copied: Copy,
  pasted: Clipboard,
  duplicated: Clipboard,
  unsupported: Clipboard,
}

const config: Record<string, { color: string; label: string }> = {
  copied: { color: "bg-blue-600", label: "Copied" },
  pasted: { color: "bg-emerald-600", label: "Pasted" },
  duplicated: { color: "bg-violet-600", label: "Duplicated" },
  unsupported: { color: "bg-amber-600", label: "Can't paste template" },
}

export function ClipboardToast({ feedback, onDone }: { feedback: ClipboardFeedback; onDone: () => void }) {
  useEffect(() => {
    if (!feedback.type) return
    const timer = setTimeout(onDone, 1500)
    return () => clearTimeout(timer)
  }, [feedback, onDone])

  if (!feedback.type) return null

  const cfg = config[feedback.type]
  const Icon = icons[feedback.type] || Copy

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-white text-sm font-medium", cfg.color)}>
        <Icon size={16} />
        <span>{cfg.label}</span>
        {feedback.name && <span className="opacity-80">• {feedback.name}</span>}
      </div>
    </div>
  )
}
