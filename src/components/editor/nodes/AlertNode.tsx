"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface AlertNodeProps {
  title?: string
  message?: string
  variant?: "info" | "success" | "warning" | "error"
  showIcon?: boolean
  showClose?: boolean
}

export const AlertNode: UserComponent<AlertNodeProps> = ({
  title = "Alert",
  message = "This is an alert message.",
  variant = "info",
  showIcon = true,
  showClose = true,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const variantStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  }

  const iconColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  }

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "rounded-lg border p-4",
        variantStyles[variant],
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={cn("flex-shrink-0", iconColors[variant])}>
            {icons[variant]}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{message}</p>
        </div>
        {showClose && (
          <button className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export const AlertNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as AlertNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={props.title || "Alert"}
          onChange={(e) => setProp((p: AlertNodeProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={props.message || "This is an alert message."}
          onChange={(e) => setProp((p: AlertNodeProps) => (p.message = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
        <select
          value={props.variant || "info"}
          onChange={(e) => setProp((p: AlertNodeProps) => (p.variant = e.target.value as AlertNodeProps["variant"]))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="info">Info (Blue)</option>
          <option value="success">Success (Green)</option>
          <option value="warning">Warning (Yellow)</option>
          <option value="error">Error (Red)</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.showIcon ?? true}
          onChange={(e) => setProp((p: AlertNodeProps) => (p.showIcon = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Show Icon</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.showClose ?? true}
          onChange={(e) => setProp((p: AlertNodeProps) => (p.showClose = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Show Close Button</label>
      </div>
    </div>
  )
}

AlertNode.craft = {
  displayName: "Alert",
  props: {
    title: "Alert",
    message: "This is an alert message.",
    variant: "info",
    showIcon: true,
    showClose: true,
  } as AlertNodeProps,
  related: {
    settings: AlertNodeSettings,
  },
}
