"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface HeadingNodeProps {
  text?: string
  level?: "h1" | "h2" | "h3" | "h4"
  color?: string
}

export const HeadingNode: UserComponent<HeadingNodeProps> = ({
  text = "Heading",
  level = "h2",
  color = "#111827",
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }))

  const sizeClasses = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-semibold",
  }

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={cn(
        "cursor-move",
        sizeClasses[level || "h2"],
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      style={{ color }}
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </div>
  )
}

export const HeadingNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HeadingNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text
        </label>
        <input
          type="text"
          value={props.text || ""}
          onChange={(e) =>
            setProp((p: HeadingNodeProps) => (p.text = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Level
        </label>
        <select
          value={props.level || "h2"}
          onChange={(e) =>
            setProp(
              (p: HeadingNodeProps) =>
                (p.level = e.target.value as HeadingNodeProps["level"])
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={props.color || "#111827"}
          onChange={(e) =>
            setProp((p: HeadingNodeProps) => (p.color = e.target.value))
          }
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  )
}

HeadingNode.craft = {
  displayName: "Heading",
  props: {
    text: "Heading",
    level: "h2",
    color: "#111827",
  } as HeadingNodeProps,
  related: {
    settings: HeadingNodeSettings,
  },
}
