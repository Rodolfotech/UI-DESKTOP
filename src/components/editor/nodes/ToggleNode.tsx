"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface ToggleNodeProps {
  label?: string
  checked?: boolean
  disabled?: boolean
}

export const ToggleNode: UserComponent<ToggleNodeProps> = ({
  label = "Toggle",
  checked = false,
  disabled = false,
}) => {
  const {
    connectors: { connect, drag },
    selected,
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
        "flex items-center gap-3 p-2",
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => setProp((p: ToggleNodeProps) => (p.checked = !p.checked))}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  )
}

export const ToggleNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ToggleNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Toggle"}
          onChange={(e) => setProp((p: ToggleNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.checked ?? false}
          onChange={(e) => setProp((p: ToggleNodeProps) => (p.checked = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Enabled (On)</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.disabled ?? false}
          onChange={(e) => setProp((p: ToggleNodeProps) => (p.disabled = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Disabled</label>
      </div>
    </div>
  )
}

ToggleNode.craft = {
  displayName: "Toggle",
  props: {
    label: "Toggle",
    checked: false,
    disabled: false,
  } as ToggleNodeProps,
  related: {
    settings: ToggleNodeSettings,
  },
}
