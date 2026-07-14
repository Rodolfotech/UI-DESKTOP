"use client"

import { useNode, useEditor, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface CardNodeProps {
  background?: string
  borderRadius?: number
  shadow?: boolean
  padding?: number
  border?: boolean
  children?: React.ReactNode
}

export const CardNode: UserComponent<CardNodeProps> = ({
  background = "#ffffff",
  borderRadius = 12,
  shadow = true,
  padding = 24,
  border = true,
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "transition-all",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{
        background,
        borderRadius: `${borderRadius}px`,
        boxShadow: shadow ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" : "none",
        padding: `${padding}px`,
        border: border ? "1px solid #e5e7eb" : "none",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {!children && (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-sm">Drop components in card</span>
        </div>
      )}
    </div>
  )
}

export const CardNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CardNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
        <input
          type="color"
          value={props.background || "#ffffff"}
          onChange={(e) => setProp((p: CardNodeProps) => (p.background = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Padding ({props.padding || 24}px)</label>
        <input
          type="range"
          min="0"
          max="64"
          value={props.padding || 24}
          onChange={(e) => setProp((p: CardNodeProps) => (p.padding = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius ({props.borderRadius || 12}px)</label>
        <input
          type="range"
          min="0"
          max="32"
          value={props.borderRadius || 12}
          onChange={(e) => setProp((p: CardNodeProps) => (p.borderRadius = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.shadow ?? true}
          onChange={(e) => setProp((p: CardNodeProps) => (p.shadow = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Shadow</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.border ?? true}
          onChange={(e) => setProp((p: CardNodeProps) => (p.border = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Border</label>
      </div>
    </div>
  )
}

CardNode.craft = {
  displayName: "Card",
  props: {
    background: "#ffffff",
    borderRadius: 12,
    shadow: true,
    padding: 24,
    border: true,
  } as CardNodeProps,
  related: {
    settings: CardNodeSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
