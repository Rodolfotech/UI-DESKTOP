"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface AvatarNodeProps {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  shape?: "circle" | "square"
  name?: string
}

export const AvatarNode: UserComponent<AvatarNodeProps> = ({
  src = "",
  alt = "Avatar",
  size = "md",
  shape = "circle",
  name = "JD",
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }))

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-lg",
  }

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium",
        sizeClasses[size],
        shapeClasses[shape],
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        name
      )}
    </div>
  )
}

export const AvatarNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as AvatarNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="text"
          value={props.src || ""}
          onChange={(e) => setProp((p: AvatarNodeProps) => (p.src = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name (fallback)</label>
        <input
          type="text"
          value={props.name || "JD"}
          onChange={(e) => setProp((p: AvatarNodeProps) => (p.name = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
        <select
          value={props.size || "md"}
          onChange={(e) => setProp((p: AvatarNodeProps) => (p.size = e.target.value as AvatarNodeProps["size"]))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
        <select
          value={props.shape || "circle"}
          onChange={(e) => setProp((p: AvatarNodeProps) => (p.shape = e.target.value as AvatarNodeProps["shape"]))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="circle">Circle</option>
          <option value="square">Square</option>
        </select>
      </div>
    </div>
  )
}

AvatarNode.craft = {
  displayName: "Avatar",
  props: {
    src: "",
    alt: "Avatar",
    size: "md",
    shape: "circle",
    name: "JD",
  } as AvatarNodeProps,
  related: {
    settings: AvatarNodeSettings,
  },
}
