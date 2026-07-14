/**
 * Code Generator for Proyect-UI
 * Converts Craft.js serialized JSON to React JSX code
 *
 * Supports native components AND Design System plugins.
 * Pass `dsPluginId` as second argument to generate correct DS imports.
 */

import { designSystemRegistry } from "@/lib/designSystems/registry"

interface CraftNode {
  type: string | { resolvedName: string }
  props: Record<string, unknown>
  nodes?: string[]
  parent?: string
  displayName?: string
  custom?: Record<string, unknown>
  hidden?: boolean
  linkedNodes?: Record<string, string>
}

interface CraftJSON {
  [nodeId: string]: CraftNode
}

/** Generator entry: import statement + JSX render function */
interface ComponentGenerator {
  import: string
  generate: (props: Record<string, unknown>, children: string[]) => string
}

// ── Native Component Generators ──────────────────────────────────────

const nativeGenerators: Record<string, ComponentGenerator> = {
  Button: {
    import: 'import { Button } from "@/components/ui/button"',
    generate: (props, children) => {
      const text = (props.text as string) || "Button"
      const variant = (props.variant as string) || "default"
      const size = (props.size as string) || "default"
      return `<Button variant="${variant}" size="${size}">${text}</Button>`
    },
  },
  Container: {
    import: "import React from 'react'",
    generate: (props, children) => {
      const background = (props.background as string) || "#ffffff"
      const padding = (props.padding as number) || 16
      const borderRadius = (props.borderRadius as number) || 8
      const flexDirection = (props.flexDirection as string) || "column"
      const style = `style={{ background: "${background}", padding: "${padding}px", borderRadius: "${borderRadius}px", display: "flex", flexDirection: "${flexDirection}", gap: "8px" }}`
      const content = children.length > 0 ? `\n${children.join("\n")}\n` : ""
      return `<div ${style}>${content}</div>`
    },
  },
  Text: {
    import: "import React from 'react'",
    generate: (props) => {
      const text = (props.text as string) || "Text"
      const fontSize = (props.fontSize as number) || 16
      const color = (props.color as string) || "#000000"
      const textAlign = (props.textAlign as string) || "left"
      return `<p style={{ fontSize: "${fontSize}px", color: "${color}", textAlign: "${textAlign}" }}>${text}</p>`
    },
  },
  Heading: {
    import: "import React from 'react'",
    generate: (props) => {
      const text = (props.text as string) || "Heading"
      const level = (props.level as string) || "h2"
      const color = (props.color as string) || "#111827"
      return `<${level} style={{ color: "${color}" }}>${text}</${level}>`
    },
  },
  Image: {
    import: "import React from 'react'",
    generate: (props) => {
      const src = (props.src as string) || ""
      const alt = (props.alt as string) || ""
      const width = (props.width as number) || 300
      const height = (props.height as number) || 200
      const borderRadius = (props.borderRadius as number) || 8
      return `<img src="${src}" alt="${alt}" style={{ width: "${width}px", height: "${height}px", borderRadius: "${borderRadius}px", objectFit: "cover" }} />`
    },
  },
  Input: {
    import: 'import { Input } from "@/components/ui/input"',
    generate: (props) => {
      const label = (props.label as string) || ""
      const placeholder = (props.placeholder as string) || ""
      const type = (props.type as string) || "text"
      if (label) {
        return `<div>\n  <label className="block text-sm font-medium text-gray-700 mb-1">${label}</label>\n  <Input type="${type}" placeholder="${placeholder}" />\n</div>`
      }
      return `<Input type="${type}" placeholder="${placeholder}" />`
    },
  },
  Card: {
    import: "import React from 'react'",
    generate: (props, children) => {
      const background = (props.background as string) || "#ffffff"
      const padding = (props.padding as number) || 24
      const borderRadius = (props.borderRadius as number) || 12
      const shadow = props.shadow !== false
      const style = `style={{ background: "${background}", padding: "${padding}px", borderRadius: "${borderRadius}px", boxShadow: ${shadow ? '"0 4px 6px -1px rgba(0,0,0,0.1)"' : '"none"'}, border: "1px solid #e5e7eb" }}`
      const content = children.length > 0 ? `\n${children.join("\n")}\n` : ""
      return `<div ${style}>${content}</div>`
    },
  },
  Modal: {
    import: "import React from 'react'",
    generate: (props, children) => {
      const title = (props.title as string) || "Modal Title"
      const borderRadius = (props.borderRadius as number) || 16
      const content = children.length > 0 ? `\n${children.join("\n")}` : "\n  <p>Modal content goes here.</p>"
      return `<div className="fixed inset-0 bg-black/50 flex items-center justify-center">\n  <div style={{ borderRadius: "${borderRadius}px" }} className="bg-white shadow-xl max-w-md w-full mx-4">\n    <div className="flex items-center justify-between px-6 py-4 border-b">\n      <h3 className="text-lg font-semibold">${title}</h3>\n      <button className="p-1 hover:bg-gray-100 rounded">×</button>\n    </div>\n    <div className="px-6 py-4">${content}\n    </div>\n    <div className="flex justify-end gap-3 px-6 py-4 border-t">\n      <button className="px-4 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>\n      <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded">Confirm</button>\n    </div>\n  </div>\n</div>`
    },
  },
  Navigation: {
    import: "import React from 'react'",
    generate: (props) => {
      const logo = (props.logo as string) || "Brand"
      const background = (props.background as string) || "#1f2937"
      const textColor = (props.textColor as string) || "#ffffff"
      const items = (props.items as string[]) || ["Home", "About", "Services", "Contact"]
      return `<nav style={{ background: "${background}", color: "${textColor}" }} className="h-16">\n  <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">\n    <span className="text-xl font-bold">${logo}</span>\n    <div className="hidden md:flex gap-8">\n      ${items.map(item => `<a href="#" className="text-sm hover:opacity-80">${item}</a>`).join("\n      ")}\n    </div>\n  </div>\n</nav>`
    },
  },
  Badge: {
    import: "import React from 'react'",
    generate: (props) => {
      const text = (props.text as string) || "Badge"
      const variant = (props.variant as string) || "default"
      const variantClasses: Record<string, string> = {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-cyan-100 text-cyan-800",
        gray: "bg-gray-100 text-gray-800",
      }
      return `<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant] || variantClasses.default}">${text}</span>`
    },
  },
  Avatar: {
    import: "import React from 'react'",
    generate: (props) => {
      const src = (props.src as string) || ""
      const name = (props.name as string) || "JD"
      const size = (props.size as string) || "md"
      const sizeClasses: Record<string, string> = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-base", xl: "w-24 h-24 text-lg" }
      if (src) {
        return `<img src="${src}" alt="Avatar" className="${sizeClasses[size] || sizeClasses.md} rounded-full object-cover" />`
      }
      return `<div className="${sizeClasses[size] || sizeClasses.md} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">${name}</div>`
    },
  },
  Alert: {
    import: "import React from 'react'",
    generate: (props) => {
      const title = (props.title as string) || "Alert"
      const message = (props.message as string) || "This is an alert message."
      const variant = (props.variant as string) || "info"
      const variantClasses: Record<string, string> = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        error: "bg-red-50 border-red-200 text-red-800",
      }
      return `<div className="rounded-lg border p-4 ${variantClasses[variant] || variantClasses.info}">\n  <h4 className="font-semibold">${title}</h4>\n  <p className="text-sm opacity-90 mt-1">${message}</p>\n</div>`
    },
  },
  Checkbox: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Checkbox"
      return `<label className="flex items-center gap-2">\n  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />\n  <span className="text-sm font-medium text-gray-700">${label}</span>\n</label>`
    },
  },
  Select: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Select"
      const placeholder = (props.placeholder as string) || "Choose an option"
      const options = (props.options as string[]) || ["Option 1", "Option 2", "Option 3"]
      return `<div>\n  <label className="block text-sm font-medium text-gray-700 mb-1">${label}</label>\n  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">\n    <option disabled>${placeholder}</option>\n    ${options.map(opt => `<option>${opt}</option>`).join("\n    ")}\n  </select>\n</div>`
    },
  },
  Textarea: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Message"
      const placeholder = (props.placeholder as string) || "Enter your message..."
      const rows = (props.rows as number) || 4
      return `<div>\n  <label className="block text-sm font-medium text-gray-700 mb-1">${label}</label>\n  <textarea placeholder="${placeholder}" rows={${rows}} className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none" />\n</div>`
    },
  },
  Divider: {
    import: "import React from 'react'",
    generate: (props) => {
      const color = (props.color as string) || "#e5e7eb"
      const thickness = (props.thickness as number) || 1
      return `<hr style={{ borderColor: "${color}", borderWidth: "${thickness}px" }} />`
    },
  },
  Radio: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Select an option"
      const options = (props.options as string[]) || ["Option 1", "Option 2", "Option 3"]
      const selected = (props.selected as string) || "Option 1"
      return `<div>\n  <p className="text-sm font-medium text-gray-700 mb-2">${label}</p>\n  <div className="space-y-2">\n    ${options.map(opt => `<label className="flex items-center gap-2">\n      <input type="radio" value="${opt}" ${opt === selected ? 'defaultChecked' : ''} className="w-4 h-4 text-blue-600" />\n      <span className="text-sm text-gray-700">${opt}</span>\n    </label>`).join("\n    ")}\n  </div>\n</div>`
    },
  },
  Toggle: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Toggle"
      const checked = props.checked === true
      return `<label className="flex items-center gap-3">\n  <button type="button" role="switch" aria-checked={${checked}} className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}">\n    <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${checked ? 'translate-x-5' : 'translate-x-0'}" />\n  </button>\n  <span className="text-sm font-medium text-gray-700">${label}</span>\n</label>`
    },
  },
  DatePicker: {
    import: "import React from 'react'",
    generate: (props) => {
      const label = (props.label as string) || "Date"
      const placeholder = (props.placeholder as string) || "Select date"
      return `<div>\n  <label className="block text-sm font-medium text-gray-700 mb-1">${label}</label>\n  <input type="date" placeholder="${placeholder}" className="w-full px-3 py-2 border border-gray-300 rounded-md" />\n</div>`
    },
  },
  "Hero Section": {
    import: "import React from 'react'",
    generate: (props) => {
      const title = (props.title as string) || "Build Something Amazing"
      return `<section className="py-20" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#ffffff" }}>\n  <div className="max-w-7xl mx-auto px-4">\n    <h1 className="text-4xl md:text-5xl font-bold">${title}</h1>\n  </div>\n</section>`
    },
  },
  "Pricing Table": {
    import: "import React from 'react'",
    generate: () => `<section className="py-16 px-4 bg-gray-50">\n  <div className="max-w-7xl mx-auto text-center">\n    <h2 className="text-3xl font-bold text-gray-900">Pricing</h2>\n  </div>\n</section>`,
  },
  "Features Grid": {
    import: "import React from 'react'",
    generate: () => `<section className="py-16 px-4 bg-white">\n  <div className="max-w-7xl mx-auto text-center">\n    <h2 className="text-3xl font-bold text-gray-900">Features</h2>\n  </div>\n</section>`,
  },
  Testimonial: {
    import: "import React from 'react'",
    generate: (props) => {
      const quote = (props.quote as string) || "Great tool!"
      return `<section className="py-12 px-4 bg-gray-50">\n  <blockquote className="text-xl">"${quote}"</blockquote>\n</section>`
    },
  },
  Footer: {
    import: "import React from 'react'",
    generate: (props) => {
      const companyName = (props.companyName as string) || "Proyect-UI"
      return `<footer className="py-12 bg-gray-800 text-white text-center">© 2024 ${companyName}</footer>`
    },
  },
}

/**
 * Maps DS resolvedName to JSX component tag name for code generation.
 * E.g., "AntDButton" → "Button" (so we render <Button>)
 */
const DS_JSX_NAME: Record<string, string> = {
  // Ant Design
  AntDButton: "Button", AntDTitle: "Typography.Title", AntDText: "Typography.Text",
  AntDTag: "Tag", AntDInput: "Input", AntDSelect: "Select", AntDDatePicker: "DatePicker",
  AntDCheckbox: "Checkbox", AntDRadioGroup: "Radio.Group", AntDSwitch: "Switch",
  AntDRate: "Rate", AntDCard: "Card", AntDBadge: "Badge", AntDAvatar: "Avatar",
  AntDProgress: "Progress", AntDSpin: "Spin", AntDAlert: "Alert",
  AntDDivider: "Divider", AntDSpace: "Space",
  // Chakra UI
  ChakraButton: "Button", ChakraHeading: "Heading", ChakraText: "Text",
  ChakraBadge: "Badge", ChakraInput: "Input", ChakraSelect: "select",
  ChakraCheckbox: "Checkbox", ChakraSwitch: "Switch", ChakraRadioGroup: "RadioGroup",
  ChakraCard: "Card", ChakraAvatar: "Avatar", ChakraProgress: "Progress",
  ChakraSpinner: "Spinner", ChakraAlert: "Alert",
  // Carbon DS
  CarbonButton: "Button", CarbonTag: "Tag", CarbonLink: "Link",
  CarbonTextInput: "TextInput", CarbonSelect: "Select", CarbonCheckbox: "Checkbox",
  CarbonRadioButton: "RadioButton", CarbonToggle: "Toggle", CarbonDatePicker: "DatePicker",
  CarbonProgressBar: "ProgressBar", CarbonLoading: "Loading", CarbonAccordion: "Accordion",
  CarbonInlineNotification: "InlineNotification", CarbonToast: "ToastNotification",
  // Radix / Shadcn
  RadixButton: "button", RadixLabel: "Label", RadixInput: "input",
  RadixSelect: "select", RadixCheckbox: "input", RadixSwitch: "input",
  RadixRadioGroup: "div", RadixSlider: "input", RadixAvatar: "div",
  RadixProgress: "progress", RadixTabs: "div", RadixDialog: "div",
  RadixToast: "div", RadixTooltip: "span",
}

/**
 * Formats props as JSX attributes string.
 */
function formatProps(props: Record<string, unknown>, isHTMLTag: boolean): string {
  const entries = Object.entries(props)
    .filter(([key]) => !key.startsWith("_") && !["nodes", "parent", "linkedNodes", "custom", "hidden", "displayName", "options"].includes(key))
    .map(([key, value]) => {
      if (key === "text" && !isHTMLTag) {
        // text content is handled via children, not as attribute for React components
        return ""
      }
      if (typeof value === "string") {
        return ` ${key}="${value.replace(/"/g, "&quot;")}"`
      } else if (typeof value === "number") {
        return ` ${key}={${value}}`
      } else if (typeof value === "boolean" && value) {
        return ` ${key}`
      }
      return ""
    })
    .join("")
  return entries
}

/**
 * Filter out Craft.js internal props
 */
function filterCraftProps(props: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  const internalProps = ["nodes", "parent", "linkedNodes", "custom", "hidden", "displayName"]
  for (const [key, value] of Object.entries(props)) {
    if (!internalProps.includes(key) && !key.startsWith("_")) {
      filtered[key] = value
    }
  }
  return filtered
}

/**
 * Generates React component code from Craft.js serialized JSON.
 *
 * @param jsonString  Serialized Craft.js JSON
 * @param dsPluginId  Optional ID of active Design System plugin (e.g., "antd", "chakra")
 */
export function generateReactCode(jsonString: string, dsPluginId?: string | null): string {
  try {
    const craftJson: CraftJSON = JSON.parse(jsonString)

    const rootNode = craftJson["ROOT"]
    if (!rootNode) {
      return "// Error: No ROOT node found in the design"
    }

    // Collect imports
    const imports = new Set<string>()
    imports.add("import React from 'react'")

    // Get DS imports if a DS plugin is active
    let dsPerComponentImports: Record<string, string[]> | null = null
    if (dsPluginId) {
      const plugin = designSystemRegistry.get(dsPluginId)
      if (plugin) {
        dsPerComponentImports = {}
        for (const comp of plugin.components) {
          dsPerComponentImports[comp.type] = plugin.getImportStatements(comp.type)
        }
      }
    }

    // Helper to format a string prop value for JSX
    const renderTextProp = (props: Record<string, unknown>, key: string, fallback: string): string => {
      const val = props[key]
      if (typeof val === "string" && val.length > 0) return val
      return fallback
    }

    // Render a single node
    const renderNode = (nodeId: string, indent: number = 2): string => {
      const node = craftJson[nodeId]
      if (!node) return ""
      if (node.hidden) return ""

      // Get the component resolvedName
      let componentName: string
      if (typeof node.type === "object" && node.type.resolvedName) {
        componentName = node.type.resolvedName
      } else if (typeof node.type === "string") {
        componentName = node.type
      } else {
        return ""
      }

      const spaces = " ".repeat(indent)

      // 1. Try DS component generator first (keyed by resolvedName)
      const dsJsxName = DS_JSX_NAME[componentName]
      if (dsJsxName && dsPerComponentImports && dsPerComponentImports[componentName]) {
        // Add the correct import statement
        for (const stmt of dsPerComponentImports[componentName]) {
          imports.add(stmt)
        }
        const cleanProps = filterCraftProps(node.props)
        const children = renderChildren(node.nodes, indent)

        // Is it an HTML tag?
        const isHTML = dsJsxName === dsJsxName.toLowerCase()
        const formattedProps = formatProps(cleanProps, isHTML)

        if (children) {
          return `${spaces}<${dsJsxName}${formattedProps}>\n${children}\n${spaces}</${dsJsxName}>`
        } else {
          // Check for text content
          const text = renderTextProp(cleanProps, "text", "")
          if (text) {
            return `${spaces}<${dsJsxName}${formattedProps}>${text}</${dsJsxName}>`
          }
          return `${spaces}<${dsJsxName}${formattedProps} />`
        }
      }

      // 2. Try native component generator (keyed by displayName)
      const generator = nativeGenerators[componentName]
      if (generator) {
        if (generator.import !== "import React from 'react'") {
          imports.add(generator.import)
        }
        const cleanProps = filterCraftProps(node.props)
        const children = renderChildren(node.nodes, indent)
        const jsx = generator.generate(cleanProps, children ? [children] : [])
        return jsx.split("\n").map((line, i) => (i === 0 ? line : `${spaces}${line}`)).join("\n")
      }

      // 3. Fallback: render as generic JSX tag
      const tag = componentName.replace(/^(Button|Container|Text|Image|Input|Heading|Card|Modal|Navigation|Checkbox|Select|Textarea|Divider|Avatar|Badge|Alert|Radio|Toggle|DatePicker)Node$/, "$1")
      const fallbackTag = tag.charAt(0).toUpperCase() + tag.slice(1)
      const cleanProps = filterCraftProps(node.props)
      const children = renderChildren(node.nodes, indent)
      const formattedProps = formatProps(cleanProps, false)
      const text = renderTextProp(cleanProps, "text", "")
      if (children) {
        return `${spaces}<${fallbackTag}${formattedProps}>\n${children}\n${spaces}</${fallbackTag}>`
      }
      if (text) {
        return `${spaces}<${fallbackTag}${formattedProps}>${text}</${fallbackTag}>`
      }
      return `${spaces}<${fallbackTag}${formattedProps} />`
    }

    const renderChildren = (nodeIds: string[] | undefined, indent: number): string => {
      if (!nodeIds || nodeIds.length === 0) return ""
      return nodeIds
        .map((childId) => renderNode(childId, indent + 2))
        .filter((code) => code !== "")
        .join("\n")
    }

    // Generate the component body
    const rootNodeId = rootNode.nodes?.[0]
    const body = rootNodeId ? renderNode(rootNodeId, 4) : ""

    // Build the final code
    const sortedImports = Array.from(imports).sort()
    const code = `${sortedImports.join("\n")}\n\nexport default function GeneratedComponent() {\n  return (\n${body || "    <div>No content</div>"}\n  )\n}\n`

    return code
  } catch (error) {
    return `// Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
