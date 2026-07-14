"use client"

import React, { useState } from "react"
import { useNode, useEditor, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

export interface FAQSectionProps {
  title?: string
  subtitle?: string
  questions?: string
  backgroundColor?: string
}

const faqDefaults = [
  { q: "How do I get started?", a: "Simply drag and drop components from the palette onto the canvas to build your interface." },
  { q: "Can I export my design?", a: "Yes! Use the Export button to download your design as React code or raw JSON." },
  { q: "Is there a dark mode?", a: "Absolutely! Click the Sun/Moon icon in the top bar to toggle between light and dark themes." },
  { q: "Can I save multiple projects?", a: "Yes, use the Projects button to create, manage, and switch between different design projects." },
]

export const FAQSection: UserComponent<FAQSectionProps> = ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about Proyect-UI.",
  questions = faqDefaults.map(f => `${f.q}|${f.a}`).join("\n"),
  backgroundColor = "#ffffff",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const parsedQuestions = questions.split("\n").filter(Boolean).map((line, i) => {
    const [q, ...aParts] = line.split("|")
    return { q: q || `Question ${i + 1}`, a: aParts.join("|") || faqDefaults[i % faqDefaults.length].a }
  })

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-16 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "350px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="space-y-3">
          {parsedQuestions.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
                  {item.q}
                </span>
                {openIndex === index ? (
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const FAQSectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as FAQSectionProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || ""} onChange={(e) => setProp((p: FAQSectionProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: FAQSectionProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Questions (Q|A per line)</label>
        <textarea value={props.questions || ""} onChange={(e) => setProp((p: FAQSectionProps) => (p.questions = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={6} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.backgroundColor || "#ffffff"} onChange={(e) => setProp((p: FAQSectionProps) => (p.backgroundColor = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

FAQSection.craft = {
  displayName: "FAQ Section",
  props: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about Proyect-UI.",
    questions: faqDefaults.map(f => `${f.q}|${f.a}`).join("\n"),
    backgroundColor: "#ffffff",
  } as FAQSectionProps,
  related: { settings: FAQSectionSettings },
  rules: { canDrag: () => true },
}
