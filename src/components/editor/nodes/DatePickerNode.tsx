"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface DatePickerNodeProps {
  label?: string
  placeholder?: string
  width?: number
}

export const DatePickerNode: UserComponent<DatePickerNodeProps> = ({
  label = "Date",
  placeholder = "Select date",
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
      <div className="relative">
        <input
          type="date"
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export const DatePickerNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as DatePickerNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={props.label || "Date"}
          onChange={(e) => setProp((p: DatePickerNodeProps) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
        <input
          type="text"
          value={props.placeholder || "Select date"}
          onChange={(e) => setProp((p: DatePickerNodeProps) => (p.placeholder = e.target.value))}
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
          onChange={(e) => setProp((p: DatePickerNodeProps) => (p.width = Number(e.target.value)))}
          className="w-full"
        />
      </div>
    </div>
  )
}

DatePickerNode.craft = {
  displayName: "DatePicker",
  props: {
    label: "Date",
    placeholder: "Select date",
    width: 250,
  } as DatePickerNodeProps,
  related: {
    settings: DatePickerNodeSettings,
  },
}
