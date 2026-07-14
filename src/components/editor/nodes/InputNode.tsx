"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface InputNodeProps {
  placeholder?: string
  label?: string
  type?: string
  width?: number
}

export const InputNode: UserComponent<InputNodeProps> = ({
  placeholder = "Enter text...",
  label = "Label",
  type = "text",
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
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={cn(
        "inline-block",
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      style={{ width: `${width}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        readOnly
      />
    </div>
  )
}

export const InputNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as InputNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={props.label || ""}
          onChange={(e) =>
            setProp((p: InputNodeProps) => (p.label = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={props.placeholder || ""}
          onChange={(e) =>
            setProp((p: InputNodeProps) => (p.placeholder = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={props.type || "text"}
          onChange={(e) =>
            setProp((p: InputNodeProps) => (p.type = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="password">Password</option>
          <option value="number">Number</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Width ({props.width || 250}px)
        </label>
        <input
          type="range"
          min="150"
          max="500"
          value={props.width || 250}
          onChange={(e) =>
            setProp((p: InputNodeProps) => (p.width = Number(e.target.value)))
          }
          className="w-full"
        />
      </div>
    </div>
  )
}

InputNode.craft = {
  displayName: "Input",
  props: {
    placeholder: "Enter text...",
    label: "Label",
    type: "text",
    width: 250,
  } as InputNodeProps,
  related: {
    settings: InputNodeSettings,
  },
}
