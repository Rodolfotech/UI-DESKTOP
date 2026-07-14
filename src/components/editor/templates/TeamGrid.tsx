"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface TeamGridProps {
  title?: string
  subtitle?: string
  members?: string
  backgroundColor?: string
}

const defaultMembers = [
  { name: "Alice Johnson", role: "CEO & Founder", initials: "AJ" },
  { name: "Bob Smith", role: "CTO", initials: "BS" },
  { name: "Carol Davis", role: "Design Lead", initials: "CD" },
  { name: "David Wilson", role: "Frontend Developer", initials: "DW" },
  { name: "Eva Martinez", role: "Backend Developer", initials: "EM" },
  { name: "Frank Lee", role: "Product Manager", initials: "FL" },
]

export const TeamGrid: UserComponent<TeamGridProps> = ({
  title = "Meet Our Team",
  subtitle = "We're a passionate group of designers, developers, and thinkers.",
  members = defaultMembers.map(m => `${m.name}|${m.role}|${m.initials}`).join("\n"),
  backgroundColor = "#f9fafb",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const parsedMembers = members.split("\n").filter(Boolean).map((line, i) => {
    const [name, role, initials] = line.split("|")
    const fallback = defaultMembers[i % defaultMembers.length]
    return {
      name: name || fallback.name,
      role: role || fallback.role,
      initials: initials || fallback.initials,
    }
  })

  const avatarColors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
  ]

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
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {parsedMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold",
                avatarColors[index % avatarColors.length]
              )}>
                {member.initials}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {member.role}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">in</div>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">X</div>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">GH</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const TeamGridSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TeamGridProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: TeamGridProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: TeamGridProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Members (Name|Role|Initials per line)</label>
        <textarea value={props.members || ""} onChange={(e) => setProp((p: TeamGridProps) => (p.members = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={6} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#f9fafb"} onChange={(e) => setProp((p: TeamGridProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

TeamGrid.craft = {
  displayName: "Team Grid",
  props: {
    title: "Meet Our Team",
    subtitle: "We're a passionate group of designers, developers, and thinkers.",
    members: defaultMembers.map(m => `${m.name}|${m.role}|${m.initials}`).join("\n"),
    backgroundColor: "#f9fafb",
  } as TeamGridProps,
  related: { settings: TeamGridSettings },
  rules: { canDrag: () => true },
}
