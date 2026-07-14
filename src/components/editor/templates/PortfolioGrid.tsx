"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

export interface PortfolioGridProps {
  title?: string
  subtitle?: string
  projects?: string
  backgroundColor?: string
  columns?: 2 | 3 | 4
}

const defaultProjects = [
  { title: "E-commerce Platform", category: "Web App", color: "#3b82f6" },
  { title: "Mobile Dashboard", category: "Mobile", color: "#8b5cf6" },
  { title: "Brand Redesign", category: "Branding", color: "#ec4899" },
  { title: "Analytics Suite", category: "SaaS", color: "#14b8a6" },
  { title: "Social Media App", category: "Mobile", color: "#f59e0b" },
  { title: "Design System", category: "Design", color: "#ef4444" },
]

export const PortfolioGrid: UserComponent<PortfolioGridProps> = ({
  title = "Our Work",
  subtitle = "Explore some of our recent projects and case studies.",
  projects = defaultProjects.map(p => `${p.title}|${p.category}|${p.color}`).join("\n"),
  backgroundColor = "#ffffff",
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

  const parsedProjects = projects.split("\n").filter(Boolean).map((line, i) => {
    const [title, category, color] = line.split("|")
    const fallback = defaultProjects[i % defaultProjects.length]
    return {
      title: title || fallback.title,
      category: category || fallback.category,
      color: color || fallback.color,
    }
  })

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-16 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "400px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={cn("grid gap-6", gridCols[columns])}>
          {parsedProjects.map((project, index) => (
            <div key={index} className="group relative rounded-xl overflow-hidden cursor-pointer"
              style={{ minHeight: "200px" }}>
              {/* Colored background block as image placeholder */}
              <div className="w-full h-48 transition-transform duration-500 group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${project.color}22, ${project.color}44)` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">{project.category}</p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-white font-semibold">{project.title}</h3>
                  <ExternalLink size={14} className="text-white/80" />
                </div>
              </div>
              {/* Always-visible fallback info */}
              <div className="absolute top-3 left-3 group-hover:opacity-0 transition-opacity">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: project.color + "22", color: project.color }}>
                  {project.category}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const PortfolioGridSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as PortfolioGridProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: PortfolioGridProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: PortfolioGridProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
        <select value={props.columns || 3} onChange={(e) => setProp((p: PortfolioGridProps) => (p.columns = Number(e.target.value) as 2 | 3 | 4))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projects (Title|Category|HexColor per line)</label>
        <textarea value={props.projects || ""} onChange={(e) => setProp((p: PortfolioGridProps) => (p.projects = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={5} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#ffffff"} onChange={(e) => setProp((p: PortfolioGridProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

PortfolioGrid.craft = {
  displayName: "Portfolio Grid",
  props: {
    title: "Our Work",
    subtitle: "Explore some of our recent projects and case studies.",
    projects: defaultProjects.map(p => `${p.title}|${p.category}|${p.color}`).join("\n"),
    backgroundColor: "#ffffff",
    columns: 3,
  } as PortfolioGridProps,
  related: { settings: PortfolioGridSettings },
  rules: { canDrag: () => true },
}
