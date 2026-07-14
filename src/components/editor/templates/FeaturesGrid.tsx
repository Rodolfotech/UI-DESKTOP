"use client"

import React from "react"
import { useNode, useEditor, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface FeaturesGridProps {
  title?: string
  subtitle?: string
  features?: Array<{
    icon: string
    title: string
    description: string
  }>
  columns?: 2 | 3 | 4
}

export const FeaturesGrid: UserComponent<FeaturesGridProps> = ({
  title = "Everything you need",
  subtitle = "Powerful features to help you build faster and better.",
  features = [
    { icon: "🎨", title: "Drag & Drop", description: "Intuitive visual editor for building interfaces without code." },
    { icon: "⚡", title: "Fast Performance", description: "Optimized rendering for smooth, responsive experiences." },
    { icon: "🔒", title: "Secure by Default", description: "Built-in security best practices to protect your app." },
    { icon: "📱", title: "Responsive Design", description: "Mobile-first components that look great on any device." },
    { icon: "🎯", title: "Pixel Perfect", description: "Precise control over every detail of your design." },
    { icon: "🚀", title: "Export Code", description: "Generate clean, production-ready React code." },
  ],
  columns = 3,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "py-16 px-4 bg-white",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        <div className={cn("mt-12 grid gap-8", gridCols[columns])}>
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const FeaturesGridSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as FeaturesGridProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={props.title || "Everything you need"}
          onChange={(e) => setProp((p: FeaturesGridProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={props.subtitle || ""}
          onChange={(e) => setProp((p: FeaturesGridProps) => (p.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
        <select
          value={props.columns || 3}
          onChange={(e) => setProp((p: FeaturesGridProps) => (p.columns = Number(e.target.value) as 2 | 3 | 4))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Edit feature details by clicking on the cards in the canvas.</p>
      </div>
    </div>
  )
}

FeaturesGrid.craft = {
  displayName: "Features Grid",
  props: {
    title: "Everything you need",
    subtitle: "Powerful features to help you build faster and better.",
    columns: 3,
  } as FeaturesGridProps,
  related: {
    settings: FeaturesGridSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
