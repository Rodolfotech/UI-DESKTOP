/**
 * Shadcn UI / Radix Plugin
 *
 * Maps Radix UI primitives to Craft.js compatible adapters.
 * All components are lazy-loaded when the user selects this DS.
 */

import React from "react"
import { useNode } from "@craftjs/core"
import type { UserComponent } from "@craftjs/core"
import type { DesignSystemPlugin, DesignSystemComponent } from "./types"
import { createExternalAdapter } from "./adapter"

// ── Component Metadata ────────────────────────────────────────────────

const components: DesignSystemComponent[] = [
  // Basic
  { type: "RadixButton", name: "Button", props: { text: "Button", variant: "default" as const, size: "default" as const }, category: "basic", description: "Radix UI button", icon: "MousePointer2" },
  { type: "RadixLabel", name: "Label", props: { text: "Label" }, category: "basic", description: "Radix UI label", icon: "Tag" },

  // Form
  { type: "RadixInput", name: "Input", props: { placeholder: "Enter text..." }, category: "form", description: "Radix UI input", icon: "TextCursorInput" },
  { type: "RadixSelect", name: "Select", props: { placeholder: "Select...", options: ["Option 1", "Option 2"] }, category: "form", description: "Radix UI select", icon: "ChevronDown" },
  { type: "RadixCheckbox", name: "Checkbox", props: { label: "Checkbox", checked: false }, category: "form", description: "Radix UI checkbox", icon: "CheckSquare" },
  { type: "RadixSwitch", name: "Switch", props: { label: "Switch", checked: false }, category: "form", description: "Radix UI toggle switch", icon: "ToggleLeft" },
  { type: "RadixRadioGroup", name: "Radio Group", props: { label: "Options", options: ["A", "B", "C"] }, category: "form", description: "Radix UI radio group", icon: "CircleDot" },
  { type: "RadixSlider", name: "Slider", props: { label: "Slider", value: 50, min: 0, max: 100 }, category: "form", description: "Radix UI slider", icon: "TrendingUp" },

  // Display
  { type: "RadixAvatar", name: "Avatar", props: { name: "User", size: "md" as const }, category: "display", description: "Radix UI avatar", icon: "Circle" },
  { type: "RadixProgress", name: "Progress", props: { value: 60, max: 100 }, category: "display", description: "Radix UI progress bar", icon: "TrendingUp" },
  { type: "RadixTabs", name: "Tabs", props: { tabs: ["Tab 1", "Tab 2", "Tab 3"], activeTab: 0 }, category: "display", description: "Radix UI tabs", icon: "LayoutTemplate" },

  // Feedback
  { type: "RadixDialog", name: "Dialog", props: { title: "Dialog", description: "Dialog content here" }, category: "feedback", description: "Radix UI dialog modal", icon: "PanelTop" },
  { type: "RadixToast", name: "Toast", props: { title: "Notification", description: "Toast message" }, category: "feedback", description: "Radix UI toast notification", icon: "AlertTriangle" },

  // Navigation
  { type: "RadixTooltip", name: "Tooltip", props: { text: "Tooltip", side: "top" as const }, category: "navigation", description: "Radix UI tooltip", icon: "Info" },
]

// ── Import Statements ─────────────────────────────────────────────────

function getImportStatements(type: string): string[] {
  const map: Record<string, string> = {
    RadixButton: "@radix-ui/react-slot",
    RadixLabel: "@radix-ui/react-label",
    RadixInput: "input",
    RadixSelect: "@radix-ui/react-select",
    RadixCheckbox: "@radix-ui/react-checkbox",
    RadixSwitch: "@radix-ui/react-switch",
    RadixRadioGroup: "@radix-ui/react-radio-group",
    RadixSlider: "@radix-ui/react-slider",
    RadixAvatar: "@radix-ui/react-avatar",
    RadixProgress: "@radix-ui/react-progress",
    RadixTabs: "@radix-ui/react-tabs",
    RadixDialog: "@radix-ui/react-dialog",
    RadixToast: "@radix-ui/react-toast",
    RadixTooltip: "@radix-ui/react-tooltip",
  }
  const pkg = map[type]
  if (!pkg) return []
  if (pkg === "input") return []
  return [`import * as ${type.replace("Radix", "Radix")} from "${pkg}"`]
}

// ── Adapter Factory ───────────────────────────────────────────────────

function loadAdapter(type: string): Promise<{ component: UserComponent<any>; settings?: React.ComponentType<any> }> {
  const create = () => {
    switch (type) {
      case "RadixButton": return createButtonAdapter()
      case "RadixLabel": return createLabelAdapter()
      case "RadixInput": return createInputAdapter()
      case "RadixSelect": return createSelectAdapter()
      case "RadixCheckbox": return createCheckboxAdapter()
      case "RadixSwitch": return createSwitchAdapter()
      case "RadixRadioGroup": return createRadioGroupAdapter()
      case "RadixSlider": return createSliderAdapter()
      case "RadixAvatar": return createAvatarAdapter()
      case "RadixProgress": return createProgressAdapter()
      case "RadixTabs": return createTabsAdapter()
      case "RadixDialog": return createDialogAdapter()
      case "RadixToast": return createToastAdapter()
      case "RadixTooltip": return createTooltipAdapter()
      default: throw new Error(`Unknown Radix component: ${type}`)
    }
  }
  return Promise.resolve(create())
}

// ── Individual Adapters ──────────────────────────────────────────────

function createButtonAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-slot").then(m => m.Slot as unknown as React.ComponentType<any>),
    "RadixButton", "Button",
    { text: "Button", variant: "default", size: "default" },
  )}
}

function createLabelAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-label").then(m => m.Root),
    "RadixLabel", "Label",
    { text: "Label" },
  )}
}

function createInputAdapter() {
  return { component: createExternalAdapter(
    () => Promise.resolve((props: any) => React.createElement("input", props)),
    "RadixInput", "Input",
    { placeholder: "Enter text..." },
  )}
}

function createSelectAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-select").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixSelect", "Select",
    { placeholder: "Select...", options: ["Option 1", "Option 2"] },
  )}
}

function createCheckboxAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-checkbox").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixCheckbox", "Checkbox",
    { label: "Checkbox", checked: false },
  )}
}

function createSwitchAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-switch").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixSwitch", "Switch",
    { label: "Switch", checked: false },
  )}
}

function createRadioGroupAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-radio-group").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixRadioGroup", "Radio Group",
    { label: "Options", options: ["A", "B", "C"] },
  )}
}

function createSliderAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-slider").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixSlider", "Slider",
    { label: "Slider", value: 50, min: 0, max: 100 },
  )}
}

function createAvatarAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-avatar").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixAvatar", "Avatar",
    { name: "User", size: "md" },
  )}
}

function createProgressAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-progress").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixProgress", "Progress",
    { value: 60, max: 100 },
  )}
}

function createTabsAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-tabs").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixTabs", "Tabs",
    { tabs: ["Tab 1", "Tab 2", "Tab 3"], activeTab: 0 },
  )}
}

function createDialogAdapter() {
  // Wrap headless Radix Root in a visible placeholder
  const adapter = createExternalAdapter(
    () => import("@radix-ui/react-dialog").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixDialog", "Dialog",
    { title: "Dialog", description: "Dialog content here" },
  )
  return { component: adapter }
}

function createToastAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-toast").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixToast", "Toast",
    { title: "Notification", description: "Toast message" },
  )}
}

function createTooltipAdapter() {
  return { component: createExternalAdapter(
    () => import("@radix-ui/react-tooltip").then(m => m.Root as unknown as React.ComponentType<any>),
    "RadixTooltip", "Tooltip",
    { text: "Tooltip", side: "top" },
  )}
}

// ── Plugin Export ───────────────────────────────────────────────────

export const shadcnPlugin: DesignSystemPlugin = {
  id: "shadcn",
  name: "Radix UI / Shadcn",
  version: "2.x",
  description: "Radix UI primitives — unstyled, accessible components",
  components,
  enabled: true,
  loadAdapter,
  getImportStatements,
}
