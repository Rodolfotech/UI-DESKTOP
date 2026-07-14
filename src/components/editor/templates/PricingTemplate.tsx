"use client"

import React from "react"
import { useNode, useEditor, Element, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ContainerNode } from "../nodes/ContainerNode"
import { HeadingNode } from "../nodes/HeadingNode"
import { TextNode } from "../nodes/TextNode"
import { ButtonNode } from "../nodes/ButtonNode"

export interface PricingTemplateProps {
  title?: string
  plans?: Array<{
    name: string
    price: string
    features: string[]
    highlighted?: boolean
  }>
}

export const PricingTemplate: UserComponent<PricingTemplateProps> = ({
  title = "Simple, Transparent Pricing",
  plans = [
    {
      name: "Starter",
      price: "$9",
      features: ["5 Projects", "10GB Storage", "Basic Support"],
    },
    {
      name: "Pro",
      price: "$29",
      features: ["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Analytics"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      features: ["Unlimited Everything", "1TB Storage", "24/7 Support", "Custom Integrations", "Dedicated Manager"],
    },
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
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref))
      }}
      className={cn(
        "py-16 px-4 bg-gray-50",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto">
        <Element
          is={HeadingNode}
          text={title}
          level="h2"
          color="#111827"
        />
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "rounded-2xl p-8",
                plan.highlighted
                  ? "bg-blue-600 text-white ring-4 ring-blue-600 scale-105"
                  : "bg-white shadow-lg"
              )}
            >
              <h3 className={cn("text-xl font-semibold", plan.highlighted ? "text-white" : "text-gray-900")}>
                {plan.name}
              </h3>
              <div className="mt-4">
                <span className={cn("text-4xl font-bold", plan.highlighted ? "text-white" : "text-gray-900")}>
                  {plan.price}
                </span>
                <span className={cn("text-sm", plan.highlighted ? "text-blue-100" : "text-gray-500")}>/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className={cn("w-5 h-5", plan.highlighted ? "text-blue-200" : "text-blue-600")} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={cn("text-sm", plan.highlighted ? "text-blue-100" : "text-gray-600")}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Element
                  is={ButtonNode}
                  text={plan.highlighted ? "Get Started" : "Choose Plan"}
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const PricingTemplateSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as PricingTemplateProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={props.title || "Simple, Transparent Pricing"}
          onChange={(e) => setProp((p: PricingTemplateProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Edit plan details by clicking on the pricing cards in the canvas.</p>
      </div>
    </div>
  )
}

PricingTemplate.craft = {
  displayName: "Pricing Table",
  props: {
    title: "Simple, Transparent Pricing",
    plans: [
      {
        name: "Starter",
        price: "$9",
        features: ["5 Projects", "10GB Storage", "Basic Support"],
      },
      {
        name: "Pro",
        price: "$29",
        features: ["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Analytics"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "$99",
        features: ["Unlimited Everything", "1TB Storage", "24/7 Support", "Custom Integrations", "Dedicated Manager"],
      },
    ],
  } as PricingTemplateProps,
  related: {
    settings: PricingTemplateSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
