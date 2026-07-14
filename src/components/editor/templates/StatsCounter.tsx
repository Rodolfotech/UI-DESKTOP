"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface StatsCounterProps {
  title?: string
  stats?: string
  columns?: 2 | 3 | 4
  backgroundColor?: string
}

const defaultStats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Users" },
  { value: "10M+", label: "Requests" },
  { value: "150+", label: "Countries" },
]

export const StatsCounter: UserComponent<StatsCounterProps> = ({
  title = "Our Impact by the Numbers",
  stats = defaultStats.map(s => `${s.value}|${s.label}`).join("\n"),
  columns = 4,
  backgroundColor = "#f8fafc",
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

  const parsedStats = stats.split("\n").filter(Boolean).map((line, i) => {
    const [value, ...labelParts] = line.split("|")
    const fallback = defaultStats[i % defaultStats.length]
    return { value: value || fallback.value, label: labelParts.join("|") || fallback.label }
  })

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-16 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "300px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {title}
          </h2>
        )}
        <div className={cn("grid gap-8", gridCols[columns || 4])}>
          {parsedStats.map((stat, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const StatsCounterSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as StatsCounterProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={props.title || ""}
          onChange={(e) => setProp((p: StatsCounterProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
        <select
          value={props.columns || 4}
          onChange={(e) => setProp((p: StatsCounterProps) => (p.columns = Number(e.target.value) as 2 | 3 | 4))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stats (Value|Label per line)</label>
        <textarea
          value={props.stats || ""}
          onChange={(e) => setProp((p: StatsCounterProps) => (p.stats = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs"
          rows={5}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input
          type="color"
          value={props.backgroundColor || "#f8fafc"}
          onChange={(e) => setProp((p: StatsCounterProps) => (p.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  )
}

StatsCounter.craft = {
  displayName: "Stats Counter",
  props: {
    title: "Our Impact by the Numbers",
    stats: defaultStats.map(s => `${s.value}|${s.label}`).join("\n"),
    columns: 4,
    backgroundColor: "#f8fafc",
  } as StatsCounterProps,
  related: { settings: StatsCounterSettings },
  rules: { canDrag: () => true },
}
