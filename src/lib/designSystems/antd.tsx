/**
 * Ant Design Plugin
 *
 * Maps Ant Design v5 components to Craft.js compatible adapters.
 * All components are lazy-loaded — antd is only imported when the user
 * actually selects this Design System.
 */

import React from "react"
import { useNode } from "@craftjs/core"
import type { UserComponent } from "@craftjs/core"
import type { DesignSystemPlugin, DesignSystemComponent } from "./types"
import { createExternalAdapter } from "./adapter"

// ── Component Metadata ────────────────────────────────────────────────

const components: DesignSystemComponent[] = [
  // Basic
  {
    type: "AntDButton",
    name: "Button",
    props: { text: "Button", type: "primary", size: "middle", danger: false, block: false },
    category: "basic",
    description: "Ant Design button",
    icon: "MousePointer2",
  },
  {
    type: "AntDTitle",
    name: "Typography Title",
    props: { text: "Heading", level: 2 },
    category: "typography",
    description: "Ant Design typography title",
    icon: "Heading1",
  },
  {
    type: "AntDText",
    name: "Typography Text",
    props: { text: "Some text content", type: undefined },
    category: "typography",
    description: "Ant Design typography text",
    icon: "Type",
  },
  {
    type: "AntDTag",
    name: "Tag",
    props: { text: "Tag", color: "blue", closable: false },
    category: "basic",
    description: "Ant Design tag",
    icon: "Tag",
  },

  // Form
  {
    type: "AntDInput",
    name: "Input",
    props: { placeholder: "Enter text...", size: "middle", prefix: "", suffix: "" },
    category: "form",
    description: "Ant Design input field",
    icon: "TextCursorInput",
  },
  {
    type: "AntDSelect",
    name: "Select",
    props: {
      placeholder: "Select option",
      size: "middle",
      options: ["Option 1", "Option 2", "Option 3"],
    },
    category: "form",
    description: "Ant Design select dropdown",
    icon: "ChevronDown",
  },
  {
    type: "AntDDatePicker",
    name: "Date Picker",
    props: { placeholder: "Select date", picker: "date", format: "YYYY-MM-DD" },
    category: "form",
    description: "Ant Design date picker",
    icon: "Calendar",
  },
  {
    type: "AntDCheckbox",
    name: "Checkbox",
    props: { label: "Checkbox", checked: false },
    category: "form",
    description: "Ant Design checkbox",
    icon: "CheckSquare",
  },
  {
    type: "AntDRadioGroup",
    name: "Radio Group",
    props: { label: "Radio Group", options: ["Option A", "Option B", "Option C"], value: "Option A" },
    category: "form",
    description: "Ant Design radio group",
    icon: "CircleDot",
  },
  {
    type: "AntDSwitch",
    name: "Switch",
    props: { label: "Switch", checked: false, size: "default" },
    category: "form",
    description: "Ant Design toggle switch",
    icon: "ToggleLeft",
  },
  {
    type: "AntDRate",
    name: "Rate",
    props: { count: 5, value: 3, allowHalf: false },
    category: "form",
    description: "Ant Design star rating",
    icon: "Star",
  },

  // Data Display
  {
    type: "AntDCard",
    name: "Card",
    props: { title: "Card Title", bordered: true, size: "small", bodyPadding: 16 },
    category: "display",
    description: "Ant Design card",
    icon: "CreditCard",
  },
  {
    type: "AntDBadge",
    name: "Badge",
    props: { text: "Badge", count: 5, dot: false, status: "default", overflowCount: 99 },
    category: "display",
    description: "Ant Design badge",
    icon: "Tag",
  },
  {
    type: "AntDAvatar",
    name: "Avatar",
    props: { name: "User", size: "default", shape: "circle" },
    category: "display",
    description: "Ant Design avatar",
    icon: "Circle",
  },
  {
    type: "AntDProgress",
    name: "Progress",
    props: { percent: 60, type: "line", status: "active", showInfo: true, strokeColor: "#1890ff" },
    category: "display",
    description: "Ant Design progress bar",
    icon: "TrendingUp",
  },
  {
    type: "AntDSpin",
    name: "Spin",
    props: { size: "default", tip: "Loading..." },
    category: "display",
    description: "Ant Design loading spinner",
    icon: "Loader",
  },

  // Feedback
  {
    type: "AntDAlert",
    name: "Alert",
    props: { message: "Alert message", type: "info", closable: false, showIcon: true },
    category: "feedback",
    description: "Ant Design alert",
    icon: "AlertTriangle",
  },

  // Layout
  {
    type: "AntDDivider",
    name: "Divider",
    props: { orientation: "center", dashed: false },
    category: "layout",
    description: "Ant Design divider",
    icon: "Minus",
  },
  {
    type: "AntDSpace",
    name: "Space",
    props: { size: "small", direction: "horizontal", wrap: false },
    category: "layout",
    description: "Ant Design space (container)",
    icon: "LayoutGrid",
  },
]

// ── Import Statements ─────────────────────────────────────────────────

function getImportStatements(type: string): string[] {
  // Map: antd components -> their named import
  const importMap: Record<string, string[]> = {
    AntDButton: ["Button"],
    AntDTitle: ["Typography"],
    AntDText: ["Typography"],
    AntDTag: ["Tag"],
    AntDInput: ["Input"],
    AntDSelect: ["Select"],
    AntDDatePicker: ["DatePicker"],
    AntDCheckbox: ["Checkbox"],
    AntDRadioGroup: ["Radio"],
    AntDSwitch: ["Switch"],
    AntDRate: ["Rate"],
    AntDCard: ["Card"],
    AntDBadge: ["Badge"],
    AntDAvatar: ["Avatar"],
    AntDProgress: ["Progress"],
    AntDSpin: ["Spin"],
    AntDAlert: ["Alert"],
    AntDDivider: ["Divider"],
    AntDSpace: ["Space"],
  }

  const names = importMap[type]
  if (!names) return []

  // Collect unique imports across all calls
  const allImports = new Set<string>()
  for (const name of names) {
    allImports.add(name)
  }

  return [`import { ${Array.from(allImports).join(", ")} } from "antd"`]
}

// ── Adapter Factory ───────────────────────────────────────────────────

function loadAdapter(
  type: string,
): Promise<{ component: UserComponent<any>; settings?: React.ComponentType<any> }> {
  const create = (): { component: UserComponent<any>; settings?: React.ComponentType<any> } => {
    switch (type) {
      case "AntDButton":
        return createButtonAdapter()
      case "AntDTitle":
        return createTitleAdapter()
      case "AntDText":
        return createTextAdapter()
      case "AntDTag":
        return createTagAdapter()
      case "AntDInput":
        return createInputAdapter()
      case "AntDSelect":
        return createSelectAdapter()
      case "AntDDatePicker":
        return createDatePickerAdapter()
      case "AntDCheckbox":
        return createCheckboxAdapter()
      case "AntDRadioGroup":
        return createRadioGroupAdapter()
      case "AntDSwitch":
        return createSwitchAdapter()
      case "AntDRate":
        return createRateAdapter()
      case "AntDCard":
        return createCardAdapter()
      case "AntDBadge":
        return createBadgeAdapter()
      case "AntDAvatar":
        return createAvatarAdapter()
      case "AntDProgress":
        return createProgressAdapter()
      case "AntDSpin":
        return createSpinAdapter()
      case "AntDAlert":
        return createAlertAdapter()
      case "AntDDivider":
        return createDividerAdapter()
      case "AntDSpace":
        return createSpaceAdapter()
      default:
        throw new Error(`Unknown Ant Design component: ${type}`)
    }
  }
  return Promise.resolve(create())
}

// ── Individual Component Adapters ─────────────────────────────────────

// Each adapter uses createExternalAdapter with a lazy import.
// The importFn is NOT called during registration — only when the component
// is first rendered on the canvas.

interface ButtonProps {
  text: string
  type?: "primary" | "default" | "dashed" | "link" | "text"
  size?: "large" | "middle" | "small"
  danger?: boolean
  block?: boolean
}

const ButtonSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ButtonProps,
  }))

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((p: ButtonProps) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select
          value={props.type || "primary"}
          onChange={(e) => setProp((p: ButtonProps) => (p.type = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="primary">Primary</option>
          <option value="default">Default</option>
          <option value="dashed">Dashed</option>
          <option value="link">Link</option>
          <option value="text">Text</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
        <select
          value={props.size || "middle"}
          onChange={(e) => setProp((p: ButtonProps) => (p.size = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="large">Large</option>
          <option value="middle">Middle</option>
          <option value="small">Small</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.danger || false}
            onChange={(e) => setProp((p: ButtonProps) => (p.danger = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Danger</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.block || false}
            onChange={(e) => setProp((p: ButtonProps) => (p.block = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Block</span>
        </label>
      </div>
    </div>
  )
}

function createButtonAdapter() {
  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Button),
    "AntDButton",
    "Button",
    { text: "Button", type: "primary", size: "middle", danger: false, block: false },
    ButtonSettings,
  )
  return { component, settings: ButtonSettings }
}

// ── Title (Typography) ──────────────────────────────────────────────

interface TitleProps {
  text: string
  level?: 1 | 2 | 3 | 4 | 5
}

function createTitleAdapter() {
  const TitleSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as TitleProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
          <input
            type="text"
            value={props.text}
            onChange={(e) => setProp((p: TitleProps) => (p.text = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
          <select
            value={props.level || 2}
            onChange={(e) => setProp((p: TitleProps) => (p.level = Number(e.target.value) as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
            <option value={5}>H5</option>
          </select>
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Typography.Title),
    "AntDTitle",
    "Typography Title",
    { text: "Heading", level: 2 },
    TitleSettings,
  )
  return { component, settings: TitleSettings }
}

// ── Text (Typography) ───────────────────────────────────────────────

interface TextProps {
  text: string
  type?: "secondary" | "success" | "warning" | "danger"
}

function createTextAdapter() {
  const TextSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as TextProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
          <input
            type="text"
            value={props.text}
            onChange={(e) => setProp((p: TextProps) => (p.text = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={props.type || ""}
            onChange={(e) => setProp((p: TextProps) => (p.type = (e.target.value || undefined) as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Default</option>
            <option value="secondary">Secondary</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Typography.Text),
    "AntDText",
    "Typography Text",
    { text: "Some text content" },
    TextSettings,
  )
  return { component, settings: TextSettings }
}

// ── Tag ─────────────────────────────────────────────────────────────

interface TagProps {
  text: string
  color?: string
  closable?: boolean
}

function createTagAdapter() {
  const TagSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as TagProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
          <input
            type="text"
            value={props.text}
            onChange={(e) => setProp((p: TagProps) => (p.text = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
          <input
            type="text"
            value={props.color || "blue"}
            onChange={(e) => setProp((p: TagProps) => (p.color = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="blue, red, green, #f50..."
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.closable || false}
            onChange={(e) => setProp((p: TagProps) => (p.closable = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Closable</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Tag),
    "AntDTag",
    "Tag",
    { text: "Tag", color: "blue", closable: false },
    TagSettings,
  )
  return { component, settings: TagSettings }
}

// ── Input ───────────────────────────────────────────────────────────

interface InputProps {
  placeholder: string
  size?: "large" | "middle" | "small"
  prefix?: string
  suffix?: string
}

function createInputAdapter() {
  const InputSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as InputProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
          <input
            type="text"
            value={props.placeholder}
            onChange={(e) => setProp((p: InputProps) => (p.placeholder = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <select
            value={props.size || "middle"}
            onChange={(e) => setProp((p: InputProps) => (p.size = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="large">Large</option>
            <option value="middle">Middle</option>
            <option value="small">Small</option>
          </select>
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Input),
    "AntDInput",
    "Input",
    { placeholder: "Enter text...", size: "middle" },
    InputSettings,
  )
  return { component, settings: InputSettings }
}

// ── Select ──────────────────────────────────────────────────────────

interface SelectProps {
  placeholder: string
  size?: "large" | "middle" | "small"
  options: string[]
}

function createSelectAdapter() {
  const SelectSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as SelectProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
          <input
            type="text"
            value={props.placeholder}
            onChange={(e) => setProp((p: SelectProps) => (p.placeholder = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <select
            value={props.size || "middle"}
            onChange={(e) => setProp((p: SelectProps) => (p.size = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="large">Large</option>
            <option value="middle">Middle</option>
            <option value="small">Small</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Options (comma separated)
          </label>
          <input
            type="text"
            value={(props.options || []).join(", ")}
            onChange={(e) => setProp((p: SelectProps) => (p.options = e.target.value.split(",").map((s: string) => s.trim())))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Select),
    "AntDSelect",
    "Select",
    { placeholder: "Select option", size: "middle", options: ["Option 1", "Option 2", "Option 3"] },
    SelectSettings,
  )
  return { component, settings: SelectSettings }
}

// ── DatePicker ──────────────────────────────────────────────────────

interface DatePickerProps {
  placeholder: string
  picker?: "date" | "week" | "month" | "quarter" | "year"
  format?: string
}

function createDatePickerAdapter() {
  const DatePickerSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as DatePickerProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
          <input
            type="text"
            value={props.placeholder}
            onChange={(e) => setProp((p: DatePickerProps) => (p.placeholder = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Picker</label>
          <select
            value={props.picker || "date"}
            onChange={(e) => setProp((p: DatePickerProps) => (p.picker = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="date">Date</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
          <input
            type="text"
            value={props.format || "YYYY-MM-DD"}
            onChange={(e) => setProp((p: DatePickerProps) => (p.format = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.DatePicker),
    "AntDDatePicker",
    "Date Picker",
    { placeholder: "Select date", picker: "date", format: "YYYY-MM-DD" },
    DatePickerSettings,
  )
  return { component, settings: DatePickerSettings }
}

// ── Checkbox ────────────────────────────────────────────────────────

interface CheckboxProps {
  label: string
  checked?: boolean
}

function createCheckboxAdapter() {
  const CheckboxSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as CheckboxProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={props.label}
            onChange={(e) => setProp((p: CheckboxProps) => (p.label = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Checkbox),
    "AntDCheckbox",
    "Checkbox",
    { label: "Checkbox", checked: false },
    CheckboxSettings,
  )
  return { component, settings: CheckboxSettings }
}

// ── Radio Group ─────────────────────────────────────────────────────

interface RadioGroupProps {
  label: string
  options: string[]
  value?: string
}

function createRadioGroupAdapter() {
  const RadioGroupSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as RadioGroupProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={props.label}
            onChange={(e) => setProp((p: RadioGroupProps) => (p.label = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Options (comma separated)
          </label>
          <input
            type="text"
            value={(props.options || []).join(", ")}
            onChange={(e) =>
              setProp(
                (p: RadioGroupProps) =>
                  (p.options = e.target.value.split(",").map((s: string) => s.trim())),
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Radio),
    "AntDRadioGroup",
    "Radio Group",
    { label: "Radio Group", options: ["Option A", "Option B", "Option C"], value: "Option A" },
    RadioGroupSettings,
  )
  return { component, settings: RadioGroupSettings }
}

// ── Switch ──────────────────────────────────────────────────────────

interface SwitchProps {
  label: string
  checked?: boolean
  size?: "default" | "small"
}

function createSwitchAdapter() {
  const SwitchSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as SwitchProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={props.label}
            onChange={(e) => setProp((p: SwitchProps) => (p.label = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.checked || false}
            onChange={(e) => setProp((p: SwitchProps) => (p.checked = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Checked</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Switch),
    "AntDSwitch",
    "Switch",
    { label: "Switch", checked: false, size: "default" },
    SwitchSettings,
  )
  return { component, settings: SwitchSettings }
}

// ── Rate ────────────────────────────────────────────────────────────

interface RateProps {
  count?: number
  value?: number
  allowHalf?: boolean
}

function createRateAdapter() {
  const RateSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as RateProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
          <input
            type="number"
            min={1}
            max={10}
            value={props.count || 5}
            onChange={(e) => setProp((p: RateProps) => (p.count = Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Default Value</label>
          <input
            type="number"
            min={0}
            max={10}
            value={props.value || 3}
            onChange={(e) => setProp((p: RateProps) => (p.value = Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.allowHalf || false}
            onChange={(e) => setProp((p: RateProps) => (p.allowHalf = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Allow Half</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Rate),
    "AntDRate",
    "Rate",
    { count: 5, value: 3, allowHalf: false },
    RateSettings,
  )
  return { component, settings: RateSettings }
}

// ── Card ────────────────────────────────────────────────────────────

interface CardProps {
  title: string
  bordered?: boolean
  size?: "small" | "default"
}

function createCardAdapter() {
  const CardSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as CardProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={props.title}
            onChange={(e) => setProp((p: CardProps) => (p.title = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <select
            value={props.size || "small"}
            onChange={(e) => setProp((p: CardProps) => (p.size = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.bordered !== false}
            onChange={(e) => setProp((p: CardProps) => (p.bordered = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Bordered</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Card),
    "AntDCard",
    "Card",
    { title: "Card Title", bordered: true, size: "small" },
    CardSettings,
  )
  return { component, settings: CardSettings }
}

// ── Badge ───────────────────────────────────────────────────────────

interface BadgeProps {
  text: string
  count?: number
  dot?: boolean
  status?: "default" | "success" | "processing" | "warning" | "error"
  overflowCount?: number
}

function createBadgeAdapter() {
  const BadgeSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as BadgeProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
          <input
            type="text"
            value={props.text}
            onChange={(e) => setProp((p: BadgeProps) => (p.text = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
          <input
            type="number"
            min={0}
            value={props.count ?? 5}
            onChange={(e) => setProp((p: BadgeProps) => (p.count = Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={props.status || "default"}
            onChange={(e) => setProp((p: BadgeProps) => (p.status = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="default">Default</option>
            <option value="success">Success</option>
            <option value="processing">Processing</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.dot || false}
            onChange={(e) => setProp((p: BadgeProps) => (p.dot = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Dot mode</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Badge),
    "AntDBadge",
    "Badge",
    { text: "Badge", count: 5, dot: false, status: "default", overflowCount: 99 },
    BadgeSettings,
  )
  return { component, settings: BadgeSettings }
}

// ── Avatar ──────────────────────────────────────────────────────────

interface AvatarProps {
  name: string
  size?: "large" | "default" | "small"
  shape?: "circle" | "square"
}

function createAvatarAdapter() {
  const AvatarSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as AvatarProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name (initials)</label>
          <input
            type="text"
            value={props.name}
            onChange={(e) => setProp((p: AvatarProps) => (p.name = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <select
            value={props.size || "default"}
            onChange={(e) => setProp((p: AvatarProps) => (p.size = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="large">Large</option>
            <option value="default">Default</option>
            <option value="small">Small</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Shape</label>
          <select
            value={props.shape || "circle"}
            onChange={(e) => setProp((p: AvatarProps) => (p.shape = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
          </select>
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Avatar),
    "AntDAvatar",
    "Avatar",
    { name: "User", size: "default", shape: "circle" },
    AvatarSettings,
  )
  return { component, settings: AvatarSettings }
}

// ── Progress ────────────────────────────────────────────────────────

interface ProgressProps {
  percent: number
  type?: "line" | "circle" | "dashboard"
  status?: "active" | "success" | "exception" | "normal"
  showInfo?: boolean
  strokeColor?: string
}

function createProgressAdapter() {
  const ProgressSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as ProgressProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Percent</label>
          <input
            type="number"
            min={0}
            max={100}
            value={props.percent}
            onChange={(e) => setProp((p: ProgressProps) => (p.percent = Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={props.type || "line"}
            onChange={(e) => setProp((p: ProgressProps) => (p.type = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="line">Line</option>
            <option value="circle">Circle</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stroke Color</label>
          <input
            type="color"
            value={props.strokeColor || "#1890ff"}
            onChange={(e) => setProp((p: ProgressProps) => (p.strokeColor = e.target.value))}
            className="w-full h-9 border border-gray-300 rounded-md"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.showInfo !== false}
            onChange={(e) => setProp((p: ProgressProps) => (p.showInfo = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Show Info</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Progress),
    "AntDProgress",
    "Progress",
    { percent: 60, type: "line", status: "active", showInfo: true, strokeColor: "#1890ff" },
    ProgressSettings,
  )
  return { component, settings: ProgressSettings }
}

// ── Spin ────────────────────────────────────────────────────────────

interface SpinProps {
  size?: "default" | "small" | "large"
  tip?: string
}

function createSpinAdapter() {
  const SpinSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as SpinProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <select
            value={props.size || "default"}
            onChange={(e) => setProp((p: SpinProps) => (p.size = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tip</label>
          <input
            type="text"
            value={props.tip || ""}
            onChange={(e) => setProp((p: SpinProps) => (p.tip = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Loading..."
          />
        </div>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Spin),
    "AntDSpin",
    "Spin",
    { size: "default", tip: "Loading..." },
    SpinSettings,
  )
  return { component, settings: SpinSettings }
}

// ── Alert ───────────────────────────────────────────────────────────

interface AlertProps {
  message: string
  type?: "info" | "success" | "warning" | "error"
  closable?: boolean
  showIcon?: boolean
}

function createAlertAdapter() {
  const AlertSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as AlertProps,
    }))

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
          <input
            type="text"
            value={props.message}
            onChange={(e) => setProp((p: AlertProps) => (p.message = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={props.type || "info"}
            onChange={(e) => setProp((p: AlertProps) => (p.type = e.target.value as any))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.closable || false}
            onChange={(e) => setProp((p: AlertProps) => (p.closable = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Closable</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.showIcon !== false}
            onChange={(e) => setProp((p: AlertProps) => (p.showIcon = e.target.checked))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Show Icon</span>
        </label>
      </div>
    )
  }

  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Alert),
    "AntDAlert",
    "Alert",
    { message: "Alert message", type: "info", closable: false, showIcon: true },
    AlertSettings,
  )
  return { component, settings: AlertSettings }
}

// ── Divider ─────────────────────────────────────────────────────────

interface DividerProps {
  orientation?: "left" | "center" | "right"
  dashed?: boolean
}

function createDividerAdapter() {
  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Divider),
    "AntDDivider",
    "Divider",
    { orientation: "center", dashed: false },
  )
  return { component }
}

// ── Space ───────────────────────────────────────────────────────────

interface SpaceProps {
  size?: "small" | "middle" | "large"
  direction?: "horizontal" | "vertical"
  wrap?: boolean
}

function createSpaceAdapter() {
  const component = createExternalAdapter(
    () => import("antd").then((m) => m.Space),
    "AntDSpace",
    "Space",
    { size: "small", direction: "horizontal", wrap: false },
  )
  return { component }
}

// ── Plugin Export ───────────────────────────────────────────────────

/**
 * Ant Design Plugin
 *
 * Marked as enabled: true — antd will be lazy-loaded when used.
 * If antd is not installed, the error will be caught by the adapter.
 */
export const antdPlugin: DesignSystemPlugin = {
  id: "antd",
  name: "Ant Design 5.x",
  version: "5.x",
  description: "Enterprise-class UI design system with 60+ components",
  components,
  enabled: true,
  loadAdapter,
  getImportStatements,
}
