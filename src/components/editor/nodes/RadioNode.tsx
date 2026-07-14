"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface RadioNodeProps {
  label?: string
  name?: string
  options?: string[]
  selected?: string
}

export const RadioNode: UserComponent<RadioNodeProps> = ({
  label = "Select an option",
  name = "radio-group",
  options = ["Option 1", "Option 2", "Option 3"],
  selected = "Option 1",
}) => {
  const {
    connectors: { connect, drag },
    selected: isSelected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }))

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "p-2",
        isSelected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected === option}
              onChange={() => setProp((p: RadioNodeProps) => (p.selected = option))}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export const RadioNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as RadioNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Select an option"}
          onChange={(e) => setProp((p: RadioNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
        <input
          type="text"
          value={props.name || "radio-group"}
          onChange={(e) => setProp((p: RadioNodeProps) => (p.name = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
        <input
          type="text"
          value={props.options?.join(", ") || "Option 1, Option 2, Option 3"}
          onChange={(e) => setProp((p: RadioNodeProps) => (p.options = e.target.value.split(",").map(s => s.trim())))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Selection</label>
        <select
          value={props.selected || "Option 1"}
          onChange={(e) => setProp((p: RadioNodeProps) => (p.selected = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {props.options?.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          )) || <option>Option 1</option>}
        </select>
      </div>
    </div>
  )
}

RadioNode.craft = {
  displayName: "Radio",
  props: {
    label: "Select an option",
    name: "radio-group",
    options: ["Option 1", "Option 2", "Option 3"],
    selected: "Option 1",
  } as RadioNodeProps,
  related: {
    settings: RadioNodeSettings,
  },
}
