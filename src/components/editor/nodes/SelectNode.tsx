"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface SelectNodeProps {
  label?: string
  placeholder?: string
  options?: string[]
  width?: number
}

export const SelectNode: UserComponent<SelectNodeProps> = ({
  label = "Select",
  placeholder = "Choose an option",
  options = ["Option 1", "Option 2", "Option 3"],
  width = 250,
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
      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="" disabled>{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

export const SelectNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as SelectNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Select"}
          onChange={(e) => setProp((p: SelectNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
        <input
          type="text"
          value={props.placeholder || "Choose an option"}
          onChange={(e) => setProp((p: SelectNodeProps) => (p.placeholder = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
        <input
          type="text"
          value={props.options?.join(", ") || "Option 1, Option 2, Option 3"}
          onChange={(e) => setProp((p: SelectNodeProps) => (p.options = e.target.value.split(",").map(s => s.trim())))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Width ({props.width || 250}px)</label>
        <input
          type="range"
          min="150"
          max="500"
          value={props.width || 250}
          onChange={(e) => setProp((p: SelectNodeProps) => (p.width = Number(e.target.value)))}
          className="w-full"
        />
      </div>
    </div>
  )
}

SelectNode.craft = {
  displayName: "Select",
  props: {
    label: "Select",
    placeholder: "Choose an option",
    options: ["Option 1", "Option 2", "Option 3"],
    width: 250,
  } as SelectNodeProps,
  related: {
    settings: SelectNodeSettings,
  },
}
