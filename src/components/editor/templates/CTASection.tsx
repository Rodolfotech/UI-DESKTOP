"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export interface CTASectionProps {
  title?: string
  description?: string
  primaryText?: string
  secondaryText?: string
  backgroundColor?: string
  accentColor?: string
  showArrow?: boolean
  layout?: "centered" | "split"
}

export const CTASection: UserComponent<CTASectionProps> = ({
  title = "Ready to Get Started?",
  description = "Join thousands of happy users and transform your workflow today.",
  primaryText = "Get Started Free",
  secondaryText = "Learn More",
  backgroundColor = "#2563eb",
  accentColor = "#ffffff",
  showArrow = true,
  layout = "centered",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-16 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "250px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn(
        "max-w-7xl mx-auto",
        layout === "centered" ? "text-center" : "flex items-center justify-between gap-12"
      )}>
        <div className={layout === "split" ? "flex-1" : ""}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: accentColor }}>
            {title}
          </h2>
          <p className="text-lg max-w-2xl mx-auto"
            style={{ color: accentColor, opacity: 0.9 }}>
            {description}
          </p>
        </div>
        <div className={cn(
          "flex flex-col sm:flex-row gap-3 mt-8",
          layout === "centered" ? "justify-center" : "shrink-0 mt-0"
        )}>
          <button
            className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 inline-flex items-center gap-2"
            style={{ background: accentColor, color: backgroundColor }}
          >
            {primaryText}
            {showArrow && <ArrowRight size={16} />}
          </button>
          <button
            className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{ background: "transparent", color: accentColor, border: `2px solid ${accentColor}` }}
          >
            {secondaryText}
          </button>
        </div>
      </div>
    </div>
  )
}

export const CTASectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CTASectionProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: CTASectionProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <input type="text" value={props.description || ""} onChange={(e) => setProp((p: CTASectionProps) => (p.description = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary text</label>
          <input type="text" value={props.primaryText || ""} onChange={(e) => setProp((p: CTASectionProps) => (p.primaryText = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary text</label>
          <input type="text" value={props.secondaryText || ""} onChange={(e) => setProp((p: CTASectionProps) => (p.secondaryText = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Layout</label>
        <select value={props.layout || "centered"} onChange={(e) => setProp((p: CTASectionProps) => (p.layout = e.target.value as "centered" | "split"))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="centered">Centered</option>
          <option value="split">Split (side by side)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
          <input type="color" value={props.backgroundColor || "#2563eb"} onChange={(e) => setProp((p: CTASectionProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text color</label>
          <input type="color" value={props.accentColor || "#ffffff"} onChange={(e) => setProp((p: CTASectionProps) => (p.accentColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={props.showArrow !== false} onChange={(e) => setProp((p: CTASectionProps) => (p.showArrow = e.target.checked))} className="rounded" />
        <label className="text-sm text-gray-700 dark:text-gray-300">Show arrow icon</label>
      </div>
    </div>
  )
}

CTASection.craft = {
  displayName: "CTA Section",
  props: {
    title: "Ready to Get Started?",
    description: "Join thousands of happy users and transform your workflow today.",
    primaryText: "Get Started Free",
    secondaryText: "Learn More",
    backgroundColor: "#2563eb",
    accentColor: "#ffffff",
    showArrow: true,
    layout: "centered",
  } as CTASectionProps,
  related: { settings: CTASectionSettings },
  rules: { canDrag: () => true },
}
