"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface TableOfContentsProps {
  title?: string
  titleColor?: string
  backgroundColor?: string
  sections?: string
}

export const TableOfContents: UserComponent<TableOfContentsProps> = ({
  title = "On This Page",
  titleColor = "#111827",
  backgroundColor = "#f9fafb",
  sections = "Introduction, Getting Started, Configuration, Usage, API Reference, Examples, Troubleshooting",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const sectionList = sections.split(",").map((s) => s.trim())

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "rounded-xl p-6",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "300px" }}
    >
      <h3
        className="text-lg font-bold mb-4 pb-3 border-b"
        style={{ color: titleColor, borderColor: `${titleColor}20` }}
      >
        {title}
      </h3>
      <nav className="space-y-1">
        {sectionList.map((section, i) => {
          const isActive = i === 0
          const isSubSection = i > 0 && i % 2 === 1
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-default",
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100",
                isSubSection && "ml-4 text-xs"
              )}
            >
              {!isActive && !isSubSection && (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              )}
              {isSubSection && (
                <div className="w-3 h-px bg-gray-300 flex-shrink-0" />
              )}
              <span>{section}</span>
              {isActive && (
                <span className="ml-auto text-[10px] text-blue-500 font-medium">Current</span>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export const TableOfContentsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TableOfContentsProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || "On This Page"} onChange={(e) => setProp((p: TableOfContentsProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sections (comma-separated)</label>
        <textarea value={props.sections || ""} onChange={(e) => setProp((p: TableOfContentsProps) => (p.sections = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={4} placeholder="Introduction, Getting Started, Configuration" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title Color</label>
        <input type="color" value={props.titleColor || "#111827"} onChange={(e) => setProp((p: TableOfContentsProps) => (p.titleColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#f9fafb"} onChange={(e) => setProp((p: TableOfContentsProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

TableOfContents.craft = {
  displayName: "Table of Contents",
  props: {
    title: "On This Page",
    titleColor: "#111827",
    backgroundColor: "#f9fafb",
    sections: "Introduction, Getting Started, Configuration, Usage, API Reference, Examples, Troubleshooting",
  } as TableOfContentsProps,
  related: { settings: TableOfContentsSettings },
  rules: { canDrag: () => true },
}
