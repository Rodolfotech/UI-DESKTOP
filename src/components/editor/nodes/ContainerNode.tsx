"use client"

import { useNode, useEditor, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface ContainerNodeProps {
  background?: string
  padding?: number
  margin?: number
  borderRadius?: number
  flexDirection?: "row" | "column"
  children?: React.ReactNode
}

export const ContainerNode: UserComponent<ContainerNodeProps> = ({
  background = "#ffffff",
  padding = 16,
  margin = 0,
  borderRadius = 8,
  flexDirection = "column",
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
    actions: { setProp },
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
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={cn(
        "min-h-[100px] transition-all",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{
        background,
        padding: `${padding}px`,
        margin: `${margin}px`,
        borderRadius: `${borderRadius}px`,
        display: "flex",
        flexDirection,
        gap: "8px",
        minHeight: "60px",
        border: enabled ? "2px dashed #d1d5db" : "none",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {!children && (
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
          Drop components here
        </div>
      )}
    </div>
  )
}

export const ContainerNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ContainerNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background
        </label>
        <input
          type="color"
          value={props.background || "#ffffff"}
          onChange={(e) =>
            setProp((p: ContainerNodeProps) => (p.background = e.target.value))
          }
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Padding ({props.padding || 16}px)
        </label>
        <input
          type="range"
          min="0"
          max="64"
          value={props.padding || 16}
          onChange={(e) =>
            setProp((p: ContainerNodeProps) => (p.padding = Number(e.target.value)))
          }
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Radius ({props.borderRadius || 8}px)
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={props.borderRadius || 8}
          onChange={(e) =>
            setProp(
              (p: ContainerNodeProps) => (p.borderRadius = Number(e.target.value))
            )
          }
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Flex Direction
        </label>
        <select
          value={props.flexDirection || "column"}
          onChange={(e) =>
            setProp(
              (p: ContainerNodeProps) =>
                (p.flexDirection = e.target.value as "row" | "column")
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="column">Column</option>
          <option value="row">Row</option>
        </select>
      </div>
    </div>
  )
}

ContainerNode.craft = {
  displayName: "Container",
  props: {
    background: "#ffffff",
    padding: 16,
    margin: 0,
    borderRadius: 8,
    flexDirection: "column",
  } as ContainerNodeProps,
  related: {
    settings: ContainerNodeSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
