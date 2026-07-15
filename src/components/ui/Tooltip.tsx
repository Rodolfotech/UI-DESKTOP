"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  /** Main tooltip text */
  content: string
  /** Optional keyboard shortcut displayed as a badge (e.g. "Ctrl+Z") */
  shortcut?: string
  /** Side to show the tooltip */
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
  className?: string
}

/**
 * Lightweight tooltip component using CSS hover.
 * Shows a styled tooltip with optional keyboard shortcut badge.
 * No external dependencies — pure CSS with Tailwind.
 */
export function Tooltip({
  content,
  shortcut,
  side = "top",
  children,
  className,
}: TooltipProps) {
  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-700",
    right: "right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-700",
  }

  return (
    <div className={cn("relative group inline-flex", className)}>
      {children}
      <div
        className={cn(
          "pointer-events-none absolute z-50",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "invisible group-hover:visible",
          positionClasses[side],
        )}
      >
        <div className="whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-700 px-2.5 py-1.5 text-xs text-white shadow-lg flex items-center gap-2">
          <span>{content}</span>
          {shortcut && (
            <kbd className="inline-flex items-center gap-0.5 rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white/90">
              {shortcut}
            </kbd>
          )}
        </div>
        <div className={cn("absolute", arrowClasses[side])} />
      </div>
    </div>
  )
}
