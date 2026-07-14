"use client"

import { useNode, useEditor, UserComponent } from "@craftjs/core"
import React from "react"
import { cn } from "@/lib/utils"

export interface NavigationNodeProps {
  logo?: string
  background?: string
  textColor?: string
  height?: number
  items?: string[]
  children?: React.ReactNode
}

export const NavigationNode: UserComponent<NavigationNodeProps> = ({
  logo = "Brand",
  background = "#1f2937",
  textColor = "#ffffff",
  height = 64,
  items = ["Home", "About", "Services", "Contact"],
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
    <nav
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "transition-all",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{
        background,
        color: textColor,
        height: `${height}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl font-bold">{logo}</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {items.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export const NavigationNodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as NavigationNodeProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
        <input
          type="text"
          value={props.logo || "Brand"}
          onChange={(e) => setProp((p: NavigationNodeProps) => (p.logo = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
        <input
          type="color"
          value={props.background || "#1f2937"}
          onChange={(e) => setProp((p: NavigationNodeProps) => (p.background = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
        <input
          type="color"
          value={props.textColor || "#ffffff"}
          onChange={(e) => setProp((p: NavigationNodeProps) => (p.textColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Height ({props.height || 64}px)</label>
        <input
          type="range"
          min="48"
          max="96"
          value={props.height || 64}
          onChange={(e) => setProp((p: NavigationNodeProps) => (p.height = Number(e.target.value)))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Menu Items (comma separated)</label>
        <input
          type="text"
          value={props.items?.join(", ") || "Home, About, Services, Contact"}
          onChange={(e) => setProp((p: NavigationNodeProps) => (p.items = e.target.value.split(",").map(s => s.trim())))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

NavigationNode.craft = {
  displayName: "Navigation",
  props: {
    logo: "Brand",
    background: "#1f2937",
    textColor: "#ffffff",
    height: 64,
    items: ["Home", "About", "Services", "Contact"],
  } as NavigationNodeProps,
  related: {
    settings: NavigationNodeSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
