"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-cyan-100 text-cyan-800",
        gray: "bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeNodeProps extends VariantProps<typeof badgeVariants> {
  text?: string
}

export const BadgeNode: UserComponent<BadgeNodeProps> = ({
  text = "Badge",
  variant = "default",
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
        selected && "ring-2 ring-blue-500 ring-offset-2 rounded-full"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <span className={cn(badgeVariants({ variant }))}>{text}</span>
    </div>
  )
}

export const BadgeNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as BadgeNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
        <input
          type="text"
          value={props.text || "Badge"}
          onChange={(e) => setProp((p: BadgeNodeProps) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
        <select
          value={props.variant || "default"}
          onChange={(e) => setProp((p: BadgeNodeProps) => (p.variant = e.target.value as BadgeNodeProps["variant"]))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default (Blue)</option>
          <option value="success">Success (Green)</option>
          <option value="warning">Warning (Yellow)</option>
          <option value="danger">Danger (Red)</option>
          <option value="info">Info (Cyan)</option>
          <option value="gray">Gray</option>
        </select>
      </div>
    </div>
  )
}

BadgeNode.craft = {
  displayName: "Badge",
  props: {
    text: "Badge",
    variant: "default",
  } as BadgeNodeProps,
  related: {
    settings: BadgeNodeSettings,
  },
}
