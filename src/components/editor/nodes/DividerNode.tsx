"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface DividerNodeProps {
  color?: string
  thickness?: number
  style?: "solid" | "dashed" | "dotted"
  width?: number
}

export const DividerNode: UserComponent<DividerNodeProps> = ({
  color = "#e5e7eb",
  thickness = 1,
  style = "solid",
  width = 100,
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
        "py-2",
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      style={{ width: `${width}%` }}
      onClick={(e) => e.stopPropagation()}
    >
      <hr
        style={{
          borderColor: color,
          borderWidth: `${thickness}px`,
          borderStyle: style,
        }}
      />
    </div>
  )
}

export const DividerNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as DividerNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <input
          type="color"
          value={props.color || "#e5e7eb"}
          onChange={(e) => setProp((p: DividerNodeProps) => (p.color = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thickness ({props.thickness || 1}px)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={props.thickness || 1}
          onChange={(e) => setProp((p: DividerNodeProps) => (p.thickness = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
        <select
          value={props.style || "solid"}
          onChange={(e) => setProp((p: DividerNodeProps) => (p.style = e.target.value as DividerNodeProps["style"]))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Width ({props.width || 100}%)</label>
        <input
          type="range"
          min="10"
          max="100"
          value={props.width || 100}
          onChange={(e) => setProp((p: DividerNodeProps) => (p.width = Number(e.target.value)))}
          className="w-full"
        />
      </div>
    </div>
  )
}

DividerNode.craft = {
  displayName: "Divider",
  props: {
    color: "#e5e7eb",
    thickness: 1,
    style: "solid",
    width: 100,
  } as DividerNodeProps,
  related: {
    settings: DividerNodeSettings,
  },
}
