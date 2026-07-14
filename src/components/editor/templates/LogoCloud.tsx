"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface LogoCloudProps {
  title?: string
  subtitle?: string
  logos?: string
  backgroundColor?: string
  columns?: 3 | 4 | 5 | 6
}

const defaultLogos = [
  { name: "Company A", initials: "CA" },
  { name: "Brand B", initials: "BB" },
  { name: "Corp C", initials: "CC" },
  { name: "Design D", initials: "DD" },
  { name: "Tech E", initials: "TE" },
  { name: "Studio F", initials: "SF" },
]

const logoColors = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
]

export const LogoCloud: UserComponent<LogoCloudProps> = ({
  title = "Trusted by Industry Leaders",
  subtitle = "Companies of all sizes use our platform to build better products.",
  logos = defaultLogos.map(l => `${l.name}|${l.initials}`).join("\n"),
  backgroundColor = "#f9fafb",
  columns = 6,
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
    3: "grid-cols-3 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-6",
  }

  const parsedLogos = logos.split("\n").filter(Boolean).map((line, i) => {
    const [name, initials] = line.split("|")
    const fallback = defaultLogos[i % defaultLogos.length]
    return { name: name || fallback.name, initials: initials || fallback.initials }
  })

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-12 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "250px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-10">{subtitle}</p>
        <div className={cn("grid gap-6 items-center", gridCols[columns])}>
          {parsedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mr-3",
                logoColors[index % logoColors.length]
              )}>
                {logo.initials}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const LogoCloudSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as LogoCloudProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: LogoCloudProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: LogoCloudProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
        <select value={props.columns || 6} onChange={(e) => setProp((p: LogoCloudProps) => (p.columns = Number(e.target.value) as 3 | 4 | 5 | 6))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
          <option value={5}>5 Columns</option>
          <option value={6}>6 Columns</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logos (Name|Initials per line)</label>
        <textarea value={props.logos || ""} onChange={(e) => setProp((p: LogoCloudProps) => (p.logos = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={4} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#f9fafb"} onChange={(e) => setProp((p: LogoCloudProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

LogoCloud.craft = {
  displayName: "Logo Cloud",
  props: {
    title: "Trusted by Industry Leaders",
    subtitle: "Companies of all sizes use our platform to build better products.",
    logos: defaultLogos.map(l => `${l.name}|${l.initials}`).join("\n"),
    backgroundColor: "#f9fafb",
    columns: 6,
  } as LogoCloudProps,
  related: { settings: LogoCloudSettings },
  rules: { canDrag: () => true },
}
