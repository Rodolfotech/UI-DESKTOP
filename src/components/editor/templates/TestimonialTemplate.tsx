"use client"

import React from "react"
import { useNode, useEditor, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"

export interface TestimonialTemplateProps {
  quote?: string
  author?: string
  role?: string
  avatar?: string
  rating?: number
}

export const TestimonialTemplate: UserComponent<TestimonialTemplateProps> = ({
  quote = "This tool has completely transformed how we build interfaces. The drag-and-drop editor is incredibly intuitive.",
  author = "Sarah Johnson",
  role = "Product Designer at TechCorp",
  avatar = "https://via.placeholder.com/80",
  rating = 5,
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
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "py-12 px-4 bg-gray-50",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={cn("w-6 h-6", i < rating ? "text-yellow-400" : "text-gray-200")}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-xl md:text-2xl text-gray-900 font-medium leading-relaxed">
            &ldquo;{quote}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="mt-8 flex items-center gap-4">
            <img
              src={avatar}
              alt={author}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-gray-900">{author}</div>
              <div className="text-sm text-gray-500">{role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const TestimonialTemplateSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TestimonialTemplateProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
        <textarea
          value={props.quote || ""}
          onChange={(e) => setProp((p: TestimonialTemplateProps) => (p.quote = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
        <input
          type="text"
          value={props.author || "Sarah Johnson"}
          onChange={(e) => setProp((p: TestimonialTemplateProps) => (p.author = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <input
          type="text"
          value={props.role || ""}
          onChange={(e) => setProp((p: TestimonialTemplateProps) => (p.role = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
        <input
          type="text"
          value={props.avatar || ""}
          onChange={(e) => setProp((p: TestimonialTemplateProps) => (p.avatar = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={props.rating || 5}
          onChange={(e) => setProp((p: TestimonialTemplateProps) => (p.rating = Number(e.target.value)))}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-500 mt-1">{props.rating || 5} stars</div>
      </div>
    </div>
  )
}

TestimonialTemplate.craft = {
  displayName: "Testimonial",
  props: {
    quote: "This tool has completely transformed how we build interfaces. The drag-and-drop editor is incredibly intuitive.",
    author: "Sarah Johnson",
    role: "Product Designer at TechCorp",
    avatar: "https://via.placeholder.com/80",
    rating: 5,
  } as TestimonialTemplateProps,
  related: {
    settings: TestimonialTemplateSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
