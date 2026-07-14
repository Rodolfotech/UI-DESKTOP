"use client"

import { useNode, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow hover:bg-blue-700",
        destructive: "bg-red-600 text-white shadow hover:bg-red-700",
        outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50",
        secondary: "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300",
        ghost: "hover:bg-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonNodeProps extends VariantProps<typeof buttonVariants> {
  text?: string
}

export const ButtonNode: UserComponent<ButtonNodeProps> = ({
  text = "Button",
  variant = "default",
  size = "default",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }))

  return (
    <button
      ref={(ref) => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={cn(
        buttonVariants({ variant, size }),
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </button>
  )
}

export const ButtonNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ButtonNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text
        </label>
        <input
          type="text"
          value={props.text || "Button"}
          onChange={(e) => setProp((p: ButtonNodeProps) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant
        </label>
        <select
          value={props.variant || "default"}
          onChange={(e) =>
            setProp(
              (p: ButtonNodeProps) =>
                (p.variant = e.target.value as ButtonNodeProps["variant"])
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="destructive">Destructive</option>
          <option value="outline">Outline</option>
          <option value="secondary">Secondary</option>
          <option value="ghost">Ghost</option>
          <option value="link">Link</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size
        </label>
        <select
          value={props.size || "default"}
          onChange={(e) =>
            setProp(
              (p: ButtonNodeProps) =>
                (p.size = e.target.value as ButtonNodeProps["size"])
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="sm">Small</option>
          <option value="lg">Large</option>
          <option value="icon">Icon</option>
        </select>
      </div>
    </div>
  )
}

ButtonNode.craft = {
  displayName: "Button",
  props: {
    text: "Button",
    variant: "default",
    size: "default",
  } as ButtonNodeProps,
  related: {
    settings: ButtonNodeSettings,
  },
}
