/**
 * Chakra UI Plugin
 *
 * Maps Chakra UI v3 components to Craft.js compatible adapters.
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
  { type: "ChakraButton", name: "Button", props: { text: "Button", colorScheme: "blue" as const, size: "md" as const }, category: "basic", description: "Chakra UI button", icon: "MousePointer2" },
  { type: "ChakraHeading", name: "Heading", props: { text: "Heading", size: "xl" as const }, category: "typography", description: "Chakra UI heading", icon: "Heading1" },
  { type: "ChakraText", name: "Text", props: { text: "Some text content" }, category: "typography", description: "Chakra UI text", icon: "Type" },
  { type: "ChakraBadge", name: "Badge", props: { text: "Badge", variant: "solid" as const, colorScheme: "blue" as const }, category: "basic", description: "Chakra UI badge", icon: "Tag" },
  // Chakra UI Divider removed — not available in v3 export


  // Form
  { type: "ChakraInput", name: "Input", props: { placeholder: "Enter text...", size: "md" as const }, category: "form", description: "Chakra UI input", icon: "TextCursorInput" },
  { type: "ChakraSelect", name: "Select", props: { placeholder: "Select...", options: ["Option 1", "Option 2", "Option 3"] }, category: "form", description: "Chakra UI select", icon: "ChevronDown" },
  { type: "ChakraCheckbox", name: "Checkbox", props: { label: "Checkbox", checked: false }, category: "form", description: "Chakra UI checkbox", icon: "CheckSquare" },
  { type: "ChakraSwitch", name: "Switch", props: { label: "Switch", checked: false }, category: "form", description: "Chakra UI toggle switch", icon: "ToggleLeft" },
  { type: "ChakraRadioGroup", name: "Radio Group", props: { label: "Options", options: ["A", "B", "C"] }, category: "form", description: "Chakra UI radio group", icon: "CircleDot" },

  // Display
  { type: "ChakraCard", name: "Card", props: { title: "Card Title", body: "Card content" }, category: "display", description: "Chakra UI card", icon: "CreditCard" },
  { type: "ChakraAvatar", name: "Avatar", props: { name: "User", size: "md" as const }, category: "display", description: "Chakra UI avatar", icon: "Circle" },
  { type: "ChakraProgress", name: "Progress", props: { value: 60, max: 100, size: "md" as const }, category: "display", description: "Chakra UI progress bar", icon: "TrendingUp" },
  { type: "ChakraSpinner", name: "Spinner", props: { size: "md" as const, label: "Loading..." }, category: "display", description: "Chakra UI loading spinner", icon: "Loader" },

  // Feedback
  { type: "ChakraAlert", name: "Alert", props: { title: "Alert", description: "Alert message", status: "info" as const }, category: "feedback", description: "Chakra UI alert", icon: "AlertTriangle" },
]

// ── Import Statements ─────────────────────────────────────────────────

function getImportStatements(type: string): string[] {
  const map: Record<string, string[]> = {
    ChakraButton: ["Button"],
    ChakraHeading: ["Heading"],
    ChakraText: ["Text"],
    ChakraBadge: ["Badge"],
ChakraInput: ["Input"],
    ChakraSelect: ["Select"],
    ChakraCheckbox: ["Checkbox"],
    ChakraSwitch: ["Switch"],
    ChakraRadioGroup: ["RadioGroup"],
    ChakraCard: ["Card", "CardHeader", "CardBody"],
    ChakraAvatar: ["Avatar"],
    ChakraProgress: ["Progress"],
    ChakraSpinner: ["Spinner"],
    ChakraAlert: ["Alert", "AlertIcon", "AlertTitle", "AlertDescription"],
  }
  const names = map[type]
  if (!names) return []
  return [`import { ${names.join(", ")} } from "@chakra-ui/react"`]
}

// ── Adapter Factory ───────────────────────────────────────────────────

function loadAdapter(type: string): Promise<{ component: UserComponent<any>; settings?: React.ComponentType<any> }> {
  const create = () => {
    switch (type) {
      case "ChakraButton": return createButtonAdapter()
      case "ChakraHeading": return createHeadingAdapter()
      case "ChakraText": return createTextAdapter()
      case "ChakraBadge": return createBadgeAdapter()
  
      case "ChakraInput": return createInputAdapter()
      case "ChakraSelect": return createSelectAdapter()
      case "ChakraCheckbox": return createCheckboxAdapter()
      case "ChakraSwitch": return createSwitchAdapter()
      case "ChakraRadioGroup": return createRadioGroupAdapter()
      case "ChakraCard": return createCardAdapter()
      case "ChakraAvatar": return createAvatarAdapter()
      case "ChakraProgress": return createProgressAdapter()
      case "ChakraSpinner": return createSpinnerAdapter()
      case "ChakraAlert": return createAlertAdapter()
      default: throw new Error(`Unknown Chakra component: ${type}`)
    }
  }
  return Promise.resolve(create())
}

// ── Individual Adapters ──────────────────────────────────────────────

function createButtonAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Button),
    "ChakraButton", "Button",
    { text: "Button", colorScheme: "blue", size: "md" },
  )}
}

function createHeadingAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Heading),
    "ChakraHeading", "Heading",
    { text: "Heading", size: "xl" },
  )}
}

function createTextAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Text),
    "ChakraText", "Text",
    { text: "Some text content" },
  )}
}

function createBadgeAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Badge),
    "ChakraBadge", "Badge",
    { text: "Badge", variant: "solid", colorScheme: "blue" },
  )}
}

function createInputAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Input),
    "ChakraInput", "Input",
    { placeholder: "Enter text...", size: "md" },
  )}
}

function createSelectAdapter() {
  // Chakra UI v3 Select is a compound namespace, use a simple wrapper
  return { component: createExternalAdapter(
    () => Promise.resolve((props: any) => {
      const opts: string[] = props.options || ["Option 1", "Option 2"]
      return React.createElement('select', 
        { style: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' } },
        props.placeholder ? React.createElement('option', null, props.placeholder) : null,
        ...opts.map((o: string) => React.createElement('option', { key: o }, o))
      )
    }),
    "ChakraSelect", "Select",
    { placeholder: "Select...", options: ["Option 1", "Option 2", "Option 3"] },
  )}
}

function createCheckboxAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Checkbox),
    "ChakraCheckbox", "Checkbox",
    { label: "Checkbox", checked: false },
  )}
}

function createSwitchAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Switch),
    "ChakraSwitch", "Switch",
    { label: "Switch", checked: false },
  )}
}

function createRadioGroupAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.RadioGroup),
    "ChakraRadioGroup", "Radio Group",
    { label: "Options", options: ["A", "B", "C"] },
  )}
}

function createCardAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Card),
    "ChakraCard", "Card",
    { title: "Card Title", body: "Card content" },
  )}
}

function createAvatarAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Avatar),
    "ChakraAvatar", "Avatar",
    { name: "User", size: "md" },
  )}
}

function createProgressAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Progress),
    "ChakraProgress", "Progress",
    { value: 60, max: 100, size: "md" },
  )}
}

function createSpinnerAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Spinner),
    "ChakraSpinner", "Spinner",
    { size: "md", label: "Loading..." },
  )}
}

function createAlertAdapter() {
  return { component: createExternalAdapter(
    () => import("@chakra-ui/react").then(m => m.Alert),
    "ChakraAlert", "Alert",
    { title: "Alert", description: "Alert message", status: "info" },
  )}
}

// ── Plugin Export ───────────────────────────────────────────────────

export const chakraPlugin: DesignSystemPlugin = {
  id: "chakra",
  name: "Chakra UI 3.x",
  version: "3.x",
  description: "Chakra UI — simple, modular, accessible component library",
  components,
  enabled: true,
  loadAdapter,
  getImportStatements,
}
