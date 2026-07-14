"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface ImageNodeProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  borderRadius?: number
}

export const ImageNode: UserComponent<ImageNodeProps> = ({
  src = "https://via.placeholder.com/300x200",
  alt = "Placeholder image",
  width = 300,
  height = 200,
  borderRadius = 8,
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
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${borderRadius}px`,
          objectFit: "cover",
        }}
        className="block"
      />
    </div>
  )
}

export const ImageNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ImageNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={props.src || ""}
          onChange={(e) =>
            setProp((p: ImageNodeProps) => (p.src = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={props.alt || ""}
          onChange={(e) =>
            setProp((p: ImageNodeProps) => (p.alt = e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            type="number"
            value={props.width || 300}
            onChange={(e) =>
              setProp((p: ImageNodeProps) => (p.width = Number(e.target.value)))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="number"
            value={props.height || 200}
            onChange={(e) =>
              setProp((p: ImageNodeProps) => (p.height = Number(e.target.value)))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Radius ({props.borderRadius || 8}px)
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={props.borderRadius || 8}
          onChange={(e) =>
            setProp(
              (p: ImageNodeProps) => (p.borderRadius = Number(e.target.value))
            )
          }
          className="w-full"
        />
      </div>
    </div>
  )
}

ImageNode.craft = {
  displayName: "Image",
  props: {
    src: "https://via.placeholder.com/300x200",
    alt: "Placeholder image",
    width: 300,
    height: 200,
    borderRadius: 8,
  } as ImageNodeProps,
  related: {
    settings: ImageNodeSettings,
  },
}
