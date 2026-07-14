"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface TextareaNodeProps {
  label?: string
  placeholder?: string
  rows?: number
  width?: number
}

export const TextareaNode: UserComponent<TextareaNodeProps> = ({
  label = "Message",
  placeholder = "Enter your message...",
  rows = 4,
  width = 300,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }))

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "inline-block",
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      style={{ width: `${width}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        readOnly
      />
    </div>
  )
}

export const TextareaNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TextareaNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Message"}
          onChange={(e) => setProp((p: TextareaNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
        <input
          type="text"
          value={props.placeholder || "Enter your message..."}
          onChange={(e) => setProp((p: TextareaNodeProps) => (p.placeholder = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rows ({props.rows || 4})</label>
        <input
          type="range"
          min="2"
          max="10"
          value={props.rows || 4}
          onChange={(e) => setProp((p: TextareaNodeProps) => (p.rows = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Width ({props.width || 300}px)</label>
        <input
          type="range"
          min="200"
          max="500"
          value={props.width || 300}
          onChange={(e) => setProp((p: TextareaNodeProps) => (p.width = Number(e.target.value)))}
          className="w-full"
        />
      </div>
    </div>
  )
}

TextareaNode.craft = {
  displayName: "Textarea",
  props: {
    label: "Message",
    placeholder: "Enter your message...",
    rows: 4,
    width: 300,
  } as TextareaNodeProps,
  related: {
    settings: TextareaNodeSettings,
  },
}
