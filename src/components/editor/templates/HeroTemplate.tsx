"use client"

import React from "react"
import { useNode, useEditor, Element, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ContainerNode } from "../nodes/ContainerNode"
import { HeadingNode } from "../nodes/HeadingNode"
import { TextNode } from "../nodes/TextNode"
import { ButtonNode } from "../nodes/ButtonNode"
import { ImageNode } from "../nodes/ImageNode"

export interface HeroTemplateProps {
  title?: string
  subtitle?: string
  buttonText?: string
  background?: string
  textColor?: string
}

export const HeroTemplate: UserComponent<HeroTemplateProps> = ({
  title = "Build Something Amazing",
  subtitle = "Create beautiful interfaces with our drag-and-drop visual editor. No coding required.",
  buttonText = "Get Started",
  background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  textColor = "#ffffff",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "relative overflow-hidden",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{
        background,
        color: textColor,
        minHeight: "400px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Element
              is={HeadingNode}
              text={title}
              level="h1"
              color={textColor}
            />
            <div className="mt-4">
              <Element
                is={TextNode}
                text={subtitle}
                fontSize={18}
                color={textColor}
              />
            </div>
            <div className="mt-8">
              <Element
                is={ButtonNode}
                text={buttonText}
                variant="default"
                size="lg"
              />
            </div>
          </div>
          <div className="hidden md:block">
            <Element
              is={ImageNode}
              src="https://via.placeholder.com/500x400"
              alt="Hero illustration"
              width={500}
              height={400}
              borderRadius={16}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const HeroTemplateSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HeroTemplateProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={props.title || "Build Something Amazing"}
          onChange={(e) => setProp((p: HeroTemplateProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <textarea
          value={props.subtitle || ""}
          onChange={(e) => setProp((p: HeroTemplateProps) => (p.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
        <input
          type="text"
          value={props.buttonText || "Get Started"}
          onChange={(e) => setProp((p: HeroTemplateProps) => (p.buttonText = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
        <input
          type="text"
          value={props.background || ""}
          onChange={(e) => setProp((p: HeroTemplateProps) => (p.background = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="linear-gradient(...) or color"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
        <input
          type="color"
          value={props.textColor || "#ffffff"}
          onChange={(e) => setProp((p: HeroTemplateProps) => (p.textColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  )
}

HeroTemplate.craft = {
  displayName: "Hero Section",
  props: {
    title: "Build Something Amazing",
    subtitle: "Create beautiful interfaces with our drag-and-drop visual editor. No coding required.",
    buttonText: "Get Started",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
  } as HeroTemplateProps,
  related: {
    settings: HeroTemplateSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
