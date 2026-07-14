"use client"

import React, { useState } from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface PricingTableDetailedProps {
  title?: string
  subtitle?: string
  backgroundColor?: string
  cardBackground?: string
}

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Perfect for getting started",
    features: ["1 Project", "5MB Storage", "Basic Components", "Community Support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    monthlyPrice: "$9",
    yearlyPrice: "$7",
    description: "For individuals and small teams",
    features: ["5 Projects", "50MB Storage", "All Components", "Export to Code", "Email Support"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$29",
    yearlyPrice: "$24",
    description: "For professionals and growing teams",
    features: [
      "Unlimited Projects",
      "500MB Storage",
      "All Components & Templates",
      "Export to Code + JSON",
      "Version History (90 days)",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "$99",
    yearlyPrice: "$83",
    description: "For large organizations",
    features: [
      "Unlimited Everything",
      "5GB Storage",
      "Custom Components",
      "Team Collaboration",
      "Advanced Analytics",
      "Version History (unlimited)",
      "24/7 Dedicated Support",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export const PricingTableDetailed: UserComponent<PricingTableDetailedProps> = ({
  title = "Choose Your Plan",
  subtitle = "The perfect plan for your needs. Upgrade anytime.",
  backgroundColor = "#ffffff",
  cardBackground = "#ffffff",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  const [isYearly, setIsYearly] = useState(false)

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "py-16 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background: backgroundColor, minHeight: "500px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              isYearly ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                isYearly ? "translate-x-6" : "translate-x-0.5"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
            Yearly
            <span className="ml-1 text-xs text-green-600 dark:text-green-400 font-semibold">Save ~20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 items-start">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-6 flex flex-col",
                tier.highlighted
                  ? "ring-2 shadow-xl scale-105 z-10"
                  : "shadow-lg",
                tier.highlighted ? "bg-blue-600" : "bg-white dark:bg-gray-800"
              )}
            >
              {/* Most Popular Badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className={cn(
                "text-lg font-semibold",
                tier.highlighted ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                {tier.name}
              </h3>

              {/* Description */}
              <p className={cn(
                "mt-1 text-sm",
                tier.highlighted ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
              )}>
                {tier.description}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-1">
                <span className={cn(
                  "text-4xl font-bold",
                  tier.highlighted ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                  {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span className={cn(
                  "text-sm",
                  tier.highlighted ? "text-blue-200" : "text-gray-500"
                )}>
                  /month
                </span>
              </div>

              {/* Features */}
              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={16} className={cn(
                      "mt-0.5 shrink-0",
                      tier.highlighted ? "text-blue-200" : "text-blue-600 dark:text-blue-400"
                    )} />
                    <span className={cn(
                      "text-sm",
                      tier.highlighted ? "text-blue-100" : "text-gray-600 dark:text-gray-300"
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={cn(
                  "mt-8 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                  tier.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  )
}

export const PricingTableDetailedSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as PricingTableDetailedProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={props.title || ""}
          onChange={(e) => setProp((p: PricingTableDetailedProps) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input
          type="text"
          value={props.subtitle || ""}
          onChange={(e) => setProp((p: PricingTableDetailedProps) => (p.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor || "#ffffff"}
          onChange={(e) => setProp((p: PricingTableDetailedProps) => (p.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Edit plan details (names, prices, features) by modifying the template source code.
        </p>
      </div>
    </div>
  )
}

PricingTableDetailed.craft = {
  displayName: "Pricing Table Detailed",
  props: {
    title: "Choose Your Plan",
    subtitle: "The perfect plan for your needs. Upgrade anytime.",
    backgroundColor: "#ffffff",
    cardBackground: "#ffffff",
  } as PricingTableDetailedProps,
  related: {
    settings: PricingTableDetailedSettings,
  },
  rules: {
    canDrag: () => true,
  },
}
