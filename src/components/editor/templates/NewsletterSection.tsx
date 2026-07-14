"use client"

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { Mail } from "lucide-react"

export interface NewsletterSectionProps {
  title?: string
  subtitle?: string
  placeholder?: string
  buttonText?: string
  disclaimer?: string
  backgroundColor?: string
  accentColor?: string
  showIcon?: boolean
}

export const NewsletterSection: UserComponent<NewsletterSectionProps> = ({
  title = "Stay in the Loop",
  subtitle = "Get the latest updates, tips, and resources delivered to your inbox.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  disclaimer = "No spam. Unsubscribe anytime.",
  backgroundColor = "#1e3a5f",
  accentColor = "#3b82f6",
  showIcon = true,
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
      style={{ background: backgroundColor, minHeight: "300px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-2xl mx-auto text-center">
        {showIcon && (
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10">
            <Mail size={28} className="text-white" />
          </div>
        )}
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-blue-100 mb-8">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            placeholder={placeholder}
            className="flex-1 px-5 py-3.5 rounded-xl border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm"
            readOnly
          />
          <button
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
            style={{ background: accentColor }}
          >
            {buttonText}
          </button>
        </div>
        {disclaimer && (
          <p className="mt-4 text-sm text-blue-200">{disclaimer}</p>
        )}
      </div>
    </div>
  )
}

export const NewsletterSectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as NewsletterSectionProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={props.title || ""}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input
          type="text"
          value={props.subtitle || ""}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
        <input
          type="text"
          value={props.buttonText || "Subscribe"}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.buttonText = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor || "#1e3a5f"}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
        <input
          type="color"
          value={props.accentColor || "#3b82f6"}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.accentColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.showIcon !== false}
          onChange={(e) => setProp((p: NewsletterSectionProps) => (p.showIcon = e.target.checked))}
          className="rounded"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">Show mail icon</label>
      </div>
    </div>
  )
}

NewsletterSection.craft = {
  displayName: "Newsletter Section",
  props: {
    title: "Stay in the Loop",
    subtitle: "Get the latest updates, tips, and resources delivered to your inbox.",
    placeholder: "Enter your email address",
    buttonText: "Subscribe",
    disclaimer: "No spam. Unsubscribe anytime.",
    backgroundColor: "#1e3a5f",
    accentColor: "#3b82f6",
    showIcon: true,
  } as NewsletterSectionProps,
  related: { settings: NewsletterSectionSettings },
  rules: { canDrag: () => true },
}
