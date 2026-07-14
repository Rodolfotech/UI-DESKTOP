/**
 * Carbon Design System Plugin
 *
 * Maps IBM Carbon DS v12 components to Craft.js compatible adapters.
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
  { type: "CarbonButton", name: "Button", props: { text: "Button", kind: "primary" as const, size: "lg" as const }, category: "basic", description: "Carbon button", icon: "MousePointer2" },
  { type: "CarbonTag", name: "Tag", props: { text: "Tag", type: "blue" as const }, category: "basic", description: "Carbon tag", icon: "Tag" },
  { type: "CarbonLink", name: "Link", props: { text: "Link", href: "#" }, category: "basic", description: "Carbon link", icon: "Link" },

  // Form
  { type: "CarbonTextInput", name: "Text Input", props: { labelText: "Label", placeholder: "Enter text..." }, category: "form", description: "Carbon text input", icon: "TextCursorInput" },
  { type: "CarbonSelect", name: "Select", props: { labelText: "Select", items: ["Option 1", "Option 2"] }, category: "form", description: "Carbon select", icon: "ChevronDown" },
  { type: "CarbonCheckbox", name: "Checkbox", props: { labelText: "Checkbox", checked: false }, category: "form", description: "Carbon checkbox", icon: "CheckSquare" },
  { type: "CarbonRadioButton", name: "Radio Button", props: { labelText: "Options", valueSelected: "A", items: ["A", "B", "C"] }, category: "form", description: "Carbon radio button", icon: "CircleDot" },
  { type: "CarbonToggle", name: "Toggle", props: { labelA: "Off", labelB: "On", toggled: false }, category: "form", description: "Carbon toggle switch", icon: "ToggleLeft" },
  { type: "CarbonDatePicker", name: "Date Picker", props: { dateFormat: "m/d/Y", placeholder: "mm/dd/yyyy" }, category: "form", description: "Carbon date picker", icon: "Calendar" },

  // Display
  { type: "CarbonProgressBar", name: "Progress Bar", props: { value: 60, max: 100, label: "Progress" }, category: "display", description: "Carbon progress bar", icon: "TrendingUp" },
  { type: "CarbonLoading", name: "Loading", props: { description: "Loading..." }, category: "display", description: "Carbon loading spinner", icon: "Loader" },
  { type: "CarbonAccordion", name: "Accordion", props: { title: "Accordion Title", children: "Accordion content" }, category: "display", description: "Carbon accordion", icon: "LayoutTemplate" },

  // Feedback
  { type: "CarbonInlineNotification", name: "Notification", props: { title: "Notification", subtitle: "Message", kind: "info" as const }, category: "feedback", description: "Carbon inline notification", icon: "AlertTriangle" },
  { type: "CarbonToast", name: "Toast Notification", props: { title: "Toast", subtitle: "Toast message", kind: "success" as const }, category: "feedback", description: "Carbon toast notification", icon: "MessageSquare" },
]

// ── Import Statements ─────────────────────────────────────────────────

function getImportStatements(type: string): string[] {
  const map: Record<string, string[]> = {
    CarbonButton: ["Button"],
    CarbonTag: ["Tag"],
    CarbonLink: ["Link"],
    CarbonTextInput: ["TextInput"],
    CarbonSelect: ["Select"],
    CarbonCheckbox: ["Checkbox"],
    CarbonRadioButton: ["RadioButton"],
    CarbonToggle: ["Toggle"],
    CarbonDatePicker: ["DatePicker"],
    CarbonProgressBar: ["ProgressBar"],
    CarbonLoading: ["Loading"],
    CarbonAccordion: ["Accordion"],
    CarbonInlineNotification: ["InlineNotification"],
    CarbonToast: ["ToastNotification"],
  }
  const names = map[type]
  if (!names) return []
  return [`import { ${names.join(", ")} } from "@carbon/react"`]
}

// ── Adapter Factory ───────────────────────────────────────────────────

function loadAdapter(type: string): Promise<{ component: UserComponent<any>; settings?: React.ComponentType<any> }> {
  const create = () => {
    switch (type) {
      case "CarbonButton": return createButtonAdapter()
      case "CarbonTag": return createTagAdapter()
      case "CarbonLink": return createLinkAdapter()
      case "CarbonTextInput": return createTextInputAdapter()
      case "CarbonSelect": return createSelectAdapter()
      case "CarbonCheckbox": return createCheckboxAdapter()
      case "CarbonRadioButton": return createRadioButtonAdapter()
      case "CarbonToggle": return createToggleAdapter()
      case "CarbonDatePicker": return createDatePickerAdapter()
      case "CarbonProgressBar": return createProgressBarAdapter()
      case "CarbonLoading": return createLoadingAdapter()
      case "CarbonAccordion": return createAccordionAdapter()
      case "CarbonInlineNotification": return createInlineNotificationAdapter()
      case "CarbonToast": return createToastAdapter()
      default: throw new Error(`Unknown Carbon component: ${type}`)
    }
  }
  return Promise.resolve(create())
}

// ── Individual Adapters ──────────────────────────────────────────────

function createButtonAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Button),
    "CarbonButton", "Button",
    { text: "Button", kind: "primary", size: "lg" },
  )}
}

function createTagAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Tag),
    "CarbonTag", "Tag",
    { text: "Tag", type: "blue" },
  )}
}

function createLinkAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Link),
    "CarbonLink", "Link",
    { text: "Link", href: "#" },
  )}
}

function createTextInputAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.TextInput),
    "CarbonTextInput", "Text Input",
    { labelText: "Label", placeholder: "Enter text..." },
  )}
}

function createSelectAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Select),
    "CarbonSelect", "Select",
    { labelText: "Select", items: ["Option 1", "Option 2"] },
  )}
}

function createCheckboxAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Checkbox),
    "CarbonCheckbox", "Checkbox",
    { labelText: "Checkbox", checked: false },
  )}
}

function createRadioButtonAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.RadioButton),
    "CarbonRadioButton", "Radio Button",
    { labelText: "Options", valueSelected: "A", items: ["A", "B", "C"] },
  )}
}

function createToggleAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Toggle),
    "CarbonToggle", "Toggle",
    { labelA: "Off", labelB: "On", toggled: false },
  )}
}

function createDatePickerAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.DatePicker),
    "CarbonDatePicker", "Date Picker",
    { dateFormat: "m/d/Y", placeholder: "mm/dd/yyyy" },
  )}
}

function createProgressBarAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.ProgressBar),
    "CarbonProgressBar", "Progress Bar",
    { value: 60, max: 100, label: "Progress" },
  )}
}

function createLoadingAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Loading),
    "CarbonLoading", "Loading",
    { description: "Loading..." },
  )}
}

function createAccordionAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.Accordion),
    "CarbonAccordion", "Accordion",
    { title: "Accordion Title", children: "Accordion content" },
  )}
}

function createInlineNotificationAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.InlineNotification),
    "CarbonInlineNotification", "Notification",
    { title: "Notification", subtitle: "Message", kind: "info" },
  )}
}

function createToastAdapter() {
  return { component: createExternalAdapter(
    () => import("@carbon/react").then(m => m.ToastNotification),
    "CarbonToast", "Toast Notification",
    { title: "Toast", subtitle: "Toast message", kind: "success" },
  )}
}

// ── Plugin Export ───────────────────────────────────────────────────

export const carbonPlugin: DesignSystemPlugin = {
  id: "carbon",
  name: "Carbon DS 12.x",
  version: "12.x",
  description: "IBM Carbon Design System — enterprise-grade UI",
  components,
  enabled: true,
  loadAdapter,
  getImportStatements,
}
