"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface TextNodeProps {
  text?: string
  fontSize?: number
  fontWeight?: string
  color?: string
  textAlign?: "left" | "center" | "right"
}

export const TextNode: UserComponent<TextNodeProps> = ({
  text = "Text",
  fontSize = 16,
  fontWeight = "normal",
  color = "#000000",
  textAlign = "left",
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
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={cn(
        "cursor-move",
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        textAlign,
        padding: "4px",
      }}
      onClick={(e) => e.stopPropagation()}
      contentEditable={false}
    >
      {text}
    </div>
  )
}

export const TextNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TextNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text
        </label>
        <textarea
          value={props.text || "Text"}
          onChange={(e) =>
            setProp((p: TextNodeProps) => (p.text = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size ({props.fontSize || 16}px)
        </label>
        <input
          type="range"
          min="12"
          max="72"
          value={props.fontSize || 16}
          onChange={(e) =>
            setProp((p: TextNodeProps) => (p.fontSize = Number(e.target.value)))
          }
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={props.color || "#000000"}
          onChange={(e) =>
            setProp((p: TextNodeProps) => (p.color = e.target.value))
          }
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Align
        </label>
        <select
          value={props.textAlign || "left"}
          onChange={(e) =>
            setProp(
              (p: TextNodeProps) =>
                (p.textAlign = e.target.value as "left" | "center" | "right")
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
}

TextNode.craft = {
  displayName: "Text",
  props: {
    text: "Text",
    fontSize: 16,
    fontWeight: "normal",
    color: "#000000",
    textAlign: "left",
  } as TextNodeProps,
  related: {
    settings: TextNodeSettings,
  },
}
