"use client"

import React from "react"
import { useNode, useEditor, Element, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { HeadingNode } from "../nodes/HeadingNode"
import { TextNode } from "../nodes/TextNode"
import { ButtonNode } from "../nodes/ButtonNode"
import { InputNode } from "../nodes/InputNode"
import { TextareaNode } from "../nodes/TextareaNode"

export interface ContactFormProps {
  title?: string
  subtitle?: string
  buttonText?: string
  background?: string
}

export const ContactForm: UserComponent<ContactFormProps> = ({
  title = "Get in Touch",
  subtitle = "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  buttonText = "Send Message",
  background = "#f9fafb",
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
      style={{ background, minHeight: "500px" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Element is={HeadingNode} text={title} level="h2" color="#111827" />
          <div className="mt-3 max-w-lg mx-auto">
            <Element is={TextNode} text={subtitle} fontSize={15} color="#6b7280" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Element is={InputNode} label="First Name" placeholder="John" type="text" />
            <Element is={InputNode} label="Last Name" placeholder="Doe" type="text" />
          </div>
          <div className="mt-4">
            <Element is={InputNode} label="Email" placeholder="john@example.com" type="email" />
          </div>
          <div className="mt-4">
            <Element is={InputNode} label="Subject" placeholder="How can we help?" type="text" />
          </div>
          <div className="mt-4">
            <Element is={TextareaNode} label="Message" placeholder="Tell us more about your inquiry..." rows={5} />
          </div>
          <div className="mt-6">
            <Element is={ButtonNode} text={buttonText} variant="default" size="lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const ContactFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ContactFormProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || "Get in Touch"} onChange={(e) => setProp((p: ContactFormProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <textarea value={props.subtitle || ""} onChange={(e) => setProp((p: ContactFormProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
        <input type="text" value={props.buttonText || "Send Message"} onChange={(e) => setProp((p: ContactFormProps) => (p.buttonText = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.background || "#f9fafb"} onChange={(e) => setProp((p: ContactFormProps) => (p.background = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

ContactForm.craft = {
  displayName: "Contact Form",
  props: {
    title: "Get in Touch",
    subtitle: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    buttonText: "Send Message",
    background: "#f9fafb",
  } as ContactFormProps,
  related: { settings: ContactFormSettings },
  rules: { canDrag: () => true },
}
