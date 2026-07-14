"use client"

import { useNode, useEditor, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface ModalNodeProps {
  title?: string
  showClose?: boolean
  background?: string
  borderRadius?: number
  width?: number
  children?: React.ReactNode
}

export const ModalNode: UserComponent<ModalNodeProps> = ({
  title = "Modal Title",
  showClose = true,
  background = "#ffffff",
  borderRadius = 16,
  width = 480,
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
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Backdrop */}
      <div className="bg-gray-500/50 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
        {/* Modal Content */}
        <div
          style={{
            background,
            borderRadius: `${borderRadius}px`,
            width: `${width}px`,
            maxWidth: "100%",
          }}
          className="shadow-xl"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showClose && (
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="px-6 py-4">
            {children}
            {!children && (
              <p className="text-gray-600">Modal content goes here. Drop components to build your dialog.</p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ModalNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ModalNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={props.title || "Modal Title"}
          onChange={(e) => setProp((p: ModalNodeProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Width ({props.width || 480}px)</label>
        <input
          type="range"
          min="320"
          max="800"
          value={props.width || 480}
          onChange={(e) => setProp((p: ModalNodeProps) => (p.width = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius ({props.borderRadius || 16}px)</label>
        <input
          type="range"
          min="0"
          max="32"
          value={props.borderRadius || 16}
          onChange={(e) => setProp((p: ModalNodeProps) => (p.borderRadius = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.showClose ?? true}
          onChange={(e) => setProp((p: ModalNodeProps) => (p.showClose = e.target.checked))}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">Show Close Button</label>
      </div>
    </div>
  )
}

ModalNode.craft = {
  displayName: "Modal",
  props: {
    title: "Modal Title",
    showClose: true,
    background: "#ffffff",
    borderRadius: 16,
    width: 480,
  } as ModalNodeProps,
  related: {
    settings: ModalNodeSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
