"use client"

import React from "react"
import { useNode, useEditor, Element, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { HeadingNode } from "../nodes/HeadingNode"
import { TextNode } from "../nodes/TextNode"

export interface FooterTemplateProps {
  companyName?: string
  tagline?: string
  background?: string
  textColor?: string
  columns?: Array<{
    title: string
    links: string[]
  }>
}

export const FooterTemplate: UserComponent<FooterTemplateProps> = ({
  companyName = "Proyect-UI",
  tagline = "Build beautiful interfaces with ease.",
  background = "#1f2937",
  textColor = "#ffffff",
  columns = [
    { title: "Product", links: ["Features", "Pricing", "Docs", "Changelog"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security"] },
  ],
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
    <footer
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "py-12",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background, color: textColor }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold">{companyName}</h3>
            <p className="mt-2 text-sm opacity-80">{tagline}</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold uppercase tracking-wider">{column.title}</h4>
              <ul className="mt-4 space-y-2">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-sm opacity-70 text-center">
            © 2024 {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export const FooterTemplateSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as FooterTemplateProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={props.companyName || "Proyect-UI"}
          onChange={(e) => setProp((p: FooterTemplateProps) => (p.companyName = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input
          type="text"
          value={props.tagline || ""}
          onChange={(e) => setProp((p: FooterTemplateProps) => (p.tagline = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
        <input
          type="color"
          value={props.background || "#1f2937"}
          onChange={(e) => setProp((p: FooterTemplateProps) => (p.background = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
        <input
          type="color"
          value={props.textColor || "#ffffff"}
          onChange={(e) => setProp((p: FooterTemplateProps) => (p.textColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  )
}

FooterTemplate.craft = {
  displayName: "Footer",
  props: {
    companyName: "Proyect-UI",
    tagline: "Build beautiful interfaces with ease.",
    background: "#1f2937",
    textColor: "#ffffff",
  } as FooterTemplateProps,
  related: {
    settings: FooterTemplateSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
