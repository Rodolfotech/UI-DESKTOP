"use client"

import React, { useState } from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { Cookie, X } from "lucide-react"

export interface CookieConsentBannerProps {
  message?: string
  acceptText?: string
  rejectText?: string
  privacyLink?: string
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  position?: "bottom" | "top" | "bottom-left" | "bottom-right"
  showCookieIcon?: boolean
}

export const CookieConsentBanner: UserComponent<CookieConsentBannerProps> = ({
  message = "We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.",
  acceptText = "Accept All",
  rejectText = "Decline",
  privacyLink = "",
  backgroundColor = "#ffffff",
  textColor = "#1f2937",
  accentColor = "#2563eb",
  position = "bottom",
  showCookieIcon = true,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const positionClasses = {
    bottom: "fixed bottom-0 left-0 right-0",
    top: "fixed top-0 left-0 right-0",
    "bottom-left": "fixed bottom-4 left-4 max-w-sm",
    "bottom-right": "fixed bottom-4 right-4 max-w-sm",
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "z-50 p-4 shadow-2xl border-b",
        positionClasses[position],
        selected && "ring-2 ring-blue-500",
        hovered && !selected && "ring-2 ring-blue-300"
      )}
      style={{ background: backgroundColor, borderColor: "rgba(0,0,0,0.08)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn(
        "flex items-start gap-4",
        position.startsWith("bottom-") ? "flex-col" : "flex-col sm:flex-row"
      )}>
        <div className="flex-1 flex items-start gap-3">
          {showCookieIcon && (
            <Cookie size={24} className="shrink-0 mt-0.5" style={{ color: accentColor }} />
          )}
          <p className="text-sm leading-relaxed" style={{ color: textColor }}>
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: accentColor, color: "#ffffff" }}
            onClick={() => setDismissed(true)}
          >
            {acceptText}
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: textColor }}
            onClick={() => setDismissed(true)}
          >
            {rejectText}
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setDismissed(true)}
          >
            <X size={16} style={{ color: textColor }} />
          </button>
        </div>
      </div>
      {privacyLink && position === "bottom" && (
        <div className="mt-2 text-center">
          <a
            href={privacyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline hover:no-underline"
            style={{ color: accentColor }}
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>
        </div>
      )}
    </div>
  )
}

export const CookieConsentBannerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CookieConsentBannerProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
        <textarea
          value={props.message || ""}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.message = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accept Text</label>
        <input
          type="text"
          value={props.acceptText || "Accept All"}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.acceptText = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reject Text</label>
        <input
          type="text"
          value={props.rejectText || "Decline"}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.rejectText = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy Policy URL</label>
        <input
          type="text"
          value={props.privacyLink || ""}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.privacyLink = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="https://example.com/privacy"
        />
        <p className="text-xs text-gray-400 mt-1">Leave empty to hide the link</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
        <select
          value={props.position || "bottom"}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.position = e.target.value as "bottom" | "top" | "bottom-left" | "bottom-right"))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="bottom">Bottom (full width)</option>
          <option value="top">Top (full width)</option>
          <option value="bottom-left">Bottom Left (popover)</option>
          <option value="bottom-right">Bottom Right (popover)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor || "#ffffff"}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
        <input
          type="color"
          value={props.accentColor || "#2563eb"}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.accentColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.showCookieIcon !== false}
          onChange={(e) => setProp((p: CookieConsentBannerProps) => (p.showCookieIcon = e.target.checked))}
          className="rounded"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">Show cookie icon</label>
      </div>
    </div>
  )
}

CookieConsentBanner.craft = {
  displayName: "Cookie Consent Banner",
  props: {
    message: "We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.",
    acceptText: "Accept All",
    rejectText: "Decline",
    privacyLink: "",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#2563eb",
    position: "bottom",
    showCookieIcon: true,
  } as CookieConsentBannerProps,
  related: { settings: CookieConsentBannerSettings },
  rules: { canDrag: () => true },
}
