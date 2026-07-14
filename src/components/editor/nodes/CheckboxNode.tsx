"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxNodeProps {
  label?: string
  checked?: boolean
  disabled?: boolean
}

export const CheckboxNode: UserComponent<CheckboxNodeProps> = ({
  label = "Checkbox",
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
        "flex items-center gap-2 p-2",
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => setProp((p: CheckboxNodeProps) => (p.checked = e.target.checked))}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  )
}

export const CheckboxNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CheckboxNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Checkbox"}
          onChange={(e) => setProp((p: CheckboxNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.checked ?? false}
          onChange={(e) => setProp((p: CheckboxNodeProps) => (p.checked = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Checked</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.disabled ?? false}
          onChange={(e) => setProp((p: CheckboxNodeProps) => (p.disabled = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Disabled</label>
      </div>
    </div>
  )
}

CheckboxNode.craft = {
  displayName: "Checkbox",
  props: {
    label: "Checkbox",
    checked: false,
    disabled: false,
  } as CheckboxNodeProps,
  related: {
    settings: CheckboxNodeSettings,
  },
}
