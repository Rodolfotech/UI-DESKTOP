"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface TimelineSectionProps {
  title?: string
  subtitle?: string
  events?: string
  backgroundColor?: string
  accentColor?: string
}

const defaultEvents = [
  { year: "2021", title: "Company Founded", description: "Started with a vision to transform UI design." },
  { year: "2022", title: "First 1K Users", description: "Reached our first thousand active users worldwide." },
  { year: "2023", title: "$5M Series A", description: "Secured funding to accelerate product development." },
  { year: "2024", title: "Global Expansion", description: "Opened offices in 3 new countries." },
]

export const TimelineSection: UserComponent<TimelineSectionProps> = ({
  title = "Our Journey",
  subtitle = "Key milestones that shaped our story.",
  events = defaultEvents.map(e => `${e.year}|${e.title}|${e.description}`).join("\n"),
  backgroundColor = "#ffffff",
  accentColor = "#3b82f6",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const parsedEvents = events.split("\n").filter(Boolean).map((line, i) => {
    const [year, title, ...descParts] = line.split("|")
    const fallback = defaultEvents[i % defaultEvents.length]
    return {
      year: year || fallback.year,
      title: title || fallback.title,
      description: descParts.join("|") || fallback.description,
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />
          <div className="space-y-8 md:space-y-0">
            {parsedEvents.map((event, index) => (
              <div key={index} className={cn(
                "relative flex items-start gap-6 md:gap-0",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}>
                {/* Content */}
                <div className={cn(
                  "flex-1 md:w-1/2",
                  index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                )}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                      style={{ background: accentColor + "20", color: accentColor }}>
                      {event.year}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                  </div>
                </div>
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800"
                  style={{ background: accentColor, top: "1.75rem" }} />
                {/* Spacer for the other side */}
                <div className="hidden md:block flex-1 md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const TimelineSectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TimelineSectionProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: TimelineSectionProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: TimelineSectionProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Events (Year|Title|Description per line)</label>
        <textarea value={props.events || ""} onChange={(e) => setProp((p: TimelineSectionProps) => (p.events = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={6} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#ffffff"} onChange={(e) => setProp((p: TimelineSectionProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
        <input type="color" value={props.accentColor || "#3b82f6"} onChange={(e) => setProp((p: TimelineSectionProps) => (p.accentColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

TimelineSection.craft = {
  displayName: "Timeline Section",
  props: {
    title: "Our Journey",
    subtitle: "Key milestones that shaped our story.",
    events: defaultEvents.map(e => `${e.year}|${e.title}|${e.description}`).join("\n"),
    backgroundColor: "#ffffff",
    accentColor: "#3b82f6",
  } as TimelineSectionProps,
  related: { settings: TimelineSectionSettings },
  rules: { canDrag: () => true },
}
