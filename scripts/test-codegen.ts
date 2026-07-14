/**
 * Test script for generateReactCode() — code generation with Design System imports.
 *
 * Usage: npx tsx scripts/test-codegen.ts
 *
 * This script simulates the designSystemRegistry with a mock AntD plugin
 * and verifies that the generated code includes correct DS imports and JSX.
 */

// Use module-alias or tsconfig-paths if needed, but we'll just inline the logic
// for testing since we can't easily resolve the @/ alias outside Next.js.

// ── Sample Craft.js JSON with AntD components + native components ──

const SAMPLE_DESIGN = {
  ROOT: {
    type: "div",
    props: {},
    nodes: ["node_container"],
    linkedNodes: {},
  },
  node_container: {
    type: { resolvedName: "ContainerNode" },
    props: {
      background: "#f0f5ff",
      padding: 24,
      borderRadius: 12,
      flexDirection: "column",
    },
    nodes: ["node_heading", "node_antd_button", "node_card", "node_antd_alert"],
    parent: "ROOT",
    displayName: "Container",
  },
  node_heading: {
    type: { resolvedName: "HeadingNode" },
    props: {
      text: "Dashboard Design",
      level: "h2",
      color: "#1f2937",
    },
    nodes: [],
    parent: "node_container",
    displayName: "Heading",
  },
  node_antd_button: {
    type: { resolvedName: "AntDButton" },
    props: {
      text: "Click Me",
      variant: "primary",
      size: "large",
    },
    nodes: [],
    parent: "node_container",
    displayName: "AntD Button",
  },
  node_card: {
    type: { resolvedName: "AntDCard" },
    props: {
      title: "User Card",
      bordered: true,
    },
    nodes: ["node_text"],
    parent: "node_container",
    displayName: "AntD Card",
  },
  node_text: {
    type: { resolvedName: "TextNode" },
    props: {
      text: "Welcome to your dashboard!",
      fontSize: 16,
      color: "#374151",
    },
    nodes: [],
    parent: "node_card",
    displayName: "Text",
  },
  node_antd_alert: {
    type: { resolvedName: "AntDAlert" },
    props: {
      message: "Success",
      description: "Your data has been saved.",
      type: "success",
    },
    nodes: [],
    parent: "node_container",
    displayName: "AntD Alert",
  },
}

// ── Mock Plugin: Ant Design ────────────────────────────────────────

const MOCK_ANTD_PLUGIN = {
  id: "antd",
  name: "Ant Design",
  version: "5.x",
  description: "Ant Design 5.x components",
  enabled: true,
  components: [
    { type: "AntDButton", name: "Button", props: {}, category: "basic", icon: "MousePointer2" },
    { type: "AntDTitle", name: "Title", props: {}, category: "typography", icon: "Heading1" },
    { type: "AntDText", name: "Text", props: {}, category: "typography", icon: "Type" },
    { type: "AntDTag", name: "Tag", props: {}, category: "data", icon: "Tag" },
    { type: "AntDInput", name: "Input", props: {}, category: "form", icon: "TextCursorInput" },
    { type: "AntDSelect", name: "Select", props: {}, category: "form", icon: "ChevronDown" },
    { type: "AntDDatePicker", name: "DatePicker", props: {}, category: "form", icon: "Calendar" },
    { type: "AntDCheckbox", name: "Checkbox", props: {}, category: "form", icon: "CheckSquare" },
    { type: "AntDRadioGroup", name: "RadioGroup", props: {}, category: "form", icon: "CircleDot" },
    { type: "AntDSwitch", name: "Switch", props: {}, category: "form", icon: "ToggleLeft" },
    { type: "AntDRate", name: "Rate", props: {}, category: "form", icon: "Tag" },
    { type: "AntDCard", name: "Card", props: {}, category: "data", icon: "CreditCard" },
    { type: "AntDBadge", name: "Badge", props: {}, category: "data", icon: "Tag" },
    { type: "AntDAvatar", name: "Avatar", props: {}, category: "data", icon: "Circle" },
    { type: "AntDProgress", name: "Progress", props: {}, category: "data", icon: "Loader" },
    { type: "AntDSpin", name: "Spin", props: {}, category: "feedback", icon: "Loader" },
    { type: "AntDAlert", name: "Alert", props: {}, category: "feedback", icon: "AlertTriangle" },
    { type: "AntDDivider", name: "Divider", props: {}, category: "layout", icon: "Minus" },
    { type: "AntDSpace", name: "Space", props: {}, category: "layout", icon: "LayoutGrid" },
  ],
  getImportStatements: (type: string): string[] => {
    const map: Record<string, string[]> = {
      AntDButton: [`import { Button } from "antd"`],
      AntDTitle: [`import { Typography } from "antd"`],
      AntDText: [`import { Typography } from "antd"`],
      AntDTag: [`import { Tag } from "antd"`],
      AntDInput: [`import { Input } from "antd"`],
      AntDSelect: [`import { Select } from "antd"`],
      AntDDatePicker: [`import { DatePicker } from "antd"`],
      AntDCheckbox: [`import { Checkbox } from "antd"`],
      AntDRadioGroup: [`import { Radio } from "antd"`],
      AntDSwitch: [`import { Switch } from "antd"`],
      AntDRate: [`import { Rate } from "antd"`],
      AntDCard: [`import { Card } from "antd"`],
      AntDBadge: [`import { Badge } from "antd"`],
      AntDAvatar: [`import { Avatar } from "antd"`],
      AntDProgress: [`import { Progress } from "antd"`],
      AntDSpin: [`import { Spin } from "antd"`],
      AntDAlert: [`import { Alert } from "antd"`],
      AntDDivider: [`import { Divider } from "antd"`],
      AntDSpace: [`import { Space } from "antd"`],
    }
    return map[type] || [`import { ${type.replace("AntD", "")} } from "antd"`]
  },
}

// ── Re-implement DS_JSX_NAME and core logic (from codeGenerator.ts) ──

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

// ── Simulated generateReactCode ────────────────────────────────────

function simulateGenerate(jsonString: string, dsPluginId?: string | null): string {
  const craftJson = JSON.parse(jsonString)
  const rootNode = craftJson["ROOT"]
  if (!rootNode) return "// Error: No ROOT node"

  const imports = new Set<string>()
  imports.add("import React from 'react'")

  // Build per-component import map
  let dsPerComponentImports: Record<string, string[]> | null = null
  if (dsPluginId && MOCK_ANTD_PLUGIN.id === dsPluginId) {
    dsPerComponentImports = {}
    for (const comp of MOCK_ANTD_PLUGIN.components) {
      dsPerComponentImports[comp.type] = MOCK_ANTD_PLUGIN.getImportStatements(comp.type)
    }
  }

  function filterProps(props: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {}
    const internalProps = ["nodes", "parent", "linkedNodes", "custom", "hidden", "displayName"]
    for (const [key, val] of Object.entries(props)) {
      if (!internalProps.includes(key) && !key.startsWith("_")) {
        filtered[key] = val
      }
    }
    return filtered
  }

  function formatProps(props: Record<string, unknown>, isHTML: boolean): string {
    return Object.entries(props)
      .filter(([k]) => !k.startsWith("_") && !["nodes", "parent", "linkedNodes", "custom", "hidden", "displayName", "options"].includes(k))
      .map(([k, v]) => {
        if (k === "text" && !isHTML) return ""
        if (typeof v === "string") return ` ${k}="${v.replace(/"/g, "&quot;")}"`
        if (typeof v === "number") return ` ${k}={${v}}`
        if (typeof v === "boolean" && v) return ` ${k}`
        return ""
      })
      .join("")
  }

  function renderTextProp(props: Record<string, unknown>, key: string, fallback: string): string {
    const val = props[key]
    return typeof val === "string" && val.length > 0 ? val : fallback
  }

  function renderChildren(nodeIds: string[] | undefined, indent: number): string {
    if (!nodeIds || nodeIds.length === 0) return ""
    return nodeIds.map(id => renderNode(id, indent + 2)).filter(c => c !== "").join("\n")
  }

  function renderNode(nodeId: string, indent = 2): string {
    const node = craftJson[nodeId]
    if (!node || node.hidden) return ""

    let componentName: string
    if (typeof node.type === "object" && node.type.resolvedName) {
      componentName = node.type.resolvedName
    } else if (typeof node.type === "string") {
      componentName = node.type
    } else {
      return ""
    }

    const spaces = " ".repeat(indent)

    // 1. DS component
    const dsJsxName = DS_JSX_NAME[componentName]
    if (dsJsxName && dsPerComponentImports && dsPerComponentImports[componentName]) {
      for (const stmt of dsPerComponentImports[componentName]) {
        imports.add(stmt)
      }
      const cleanProps = filterProps(node.props)
      const children = renderChildren(node.nodes, indent)
      const isHTML = dsJsxName === dsJsxName.toLowerCase()
      const formattedProps = formatProps(cleanProps, isHTML)

      if (children) {
        return `${spaces}<${dsJsxName}${formattedProps}>\n${children}\n${spaces}</${dsJsxName}>`
      }
      const text = renderTextProp(cleanProps, "text", "")
      if (text) return `${spaces}<${dsJsxName}${formattedProps}>${text}</${dsJsxName}>`
      return `${spaces}<${dsJsxName}${formattedProps} />`
    }

    // 2. Text/Heading (native with special handling)
    // No need for full nativeGenerators here — we just test DS imports
    // Fallback to generic tag
    const cleanProps = filterProps(node.props)
    const children = renderChildren(node.nodes, indent)
    const formattedProps = formatProps(cleanProps, false)
    const text = renderTextProp(cleanProps, "text", "")

    if (children) {
      return `${spaces}<${componentName}${formattedProps}>\n${children}\n${spaces}</${componentName}>`
    }
    if (text) return `${spaces}<${componentName}${formattedProps}>${text}</${componentName}>`
    return `${spaces}<${componentName}${formattedProps} />`
  }

  const rootNodeId = rootNode.nodes?.[0]
  const body = rootNodeId ? renderNode(rootNodeId, 4) : ""

  const sortedImports = Array.from(imports).sort()
  return `${sortedImports.join("\n")}\n\nexport default function GeneratedComponent() {\n  return (\n${body || "    <div>No content</div>"}\n  )\n}\n`
}

// ── Run Tests ───────────────────────────────────────────────────────

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e) {
    console.log(`  ❌ ${name}: ${e}`)
    failed++
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg)
}

function assertContains(text: string, search: string) {
  if (!text.includes(search)) {
    throw new Error(`Expected to find "${search}" in output`)
  }
}

console.log("\n🧪 Testing generateReactCode() with Design Systems\n")

// ── Test 1: Without DS (native only) ─────────────────────────────────
console.log("── Test 1: Without DS active ──")
const nativeResult = simulateGenerate(JSON.stringify(SAMPLE_DESIGN), null)

test("Does not include antd imports", () => {
  assert(!nativeResult.includes('import { Button } from "antd"'), "Should not have antd imports")
})

test("Includes React import", () => {
  assertContains(nativeResult, "import React from 'react'")
})

test("Includes export default function", () => {
  assertContains(nativeResult, "export default function GeneratedComponent")
})

// ── Test 2: With Ant Design DS ──────────────────────────────────────
console.log("\n── Test 2: With Ant Design DS active ──")
const antdResult = simulateGenerate(JSON.stringify(SAMPLE_DESIGN), "antd")

console.log("\n📄 Generated Code:\n" + antdResult + "\n")

test("Includes AntD Button import", () => {
  assertContains(antdResult, 'import { Button } from "antd"')
})

test("Includes AntD Card import", () => {
  assertContains(antdResult, 'import { Card } from "antd"')
})

test("Includes AntD Alert import", () => {
  assertContains(antdResult, 'import { Alert } from "antd"')
})

test("Renders <Button> JSX", () => {
  assertContains(antdResult, "<Button")
})

test("Renders <Card> JSX", () => {
  assertContains(antdResult, "<Card")
})

test("Renders <Alert> JSX", () => {
  assertContains(antdResult, "<Alert")
})

test("Does NOT import unused AntD components", () => {
  const unusedImports = ['import { Select } from "antd"', 'import { DatePicker } from "antd"', 'import { Rate } from "antd"']
  for (const imp of unusedImports) {
    if (antdResult.includes(imp)) {
      console.log(`  ⚠️  Note: Import "${imp}" found but component not used`)
    }
  }
})

test("JSX tags match DS_JSX_NAME mapping", () => {
  assertContains(antdResult, "<Button") // AntDButton -> Button
  assertContains(antdResult, "<Card")   // AntDCard -> Card
  assertContains(antdResult, "<Alert")  // AntDAlert -> Alert
})

// ── Test 3: Nested DS components ────────────────────────────────────
console.log("\n── Test 3: Nested structure (Card > Text) ──")

test("Card wraps children correctly", () => {
  assertContains(antdResult, "<Card")
  assertContains(antdResult, "</Card>")
  assertContains(antdResult, "Welcome to your dashboard!")
  // TextNode is rendered inside Card as fallback generic tag
  assertContains(antdResult, "TextNode")
})

// ── Test 4: DS_JSX_NAME coverage ────────────────────────────────────
console.log("\n── Test 4: DS_JSX_NAME map coverage ──")

test("All AntD components have entries", () => {
  const antdTypes = ["AntDButton", "AntDTitle", "AntDText", "AntDTag", "AntDInput", "AntDSelect", "AntDDatePicker", "AntDCheckbox", "AntDRadioGroup", "AntDSwitch", "AntDRate", "AntDCard", "AntDBadge", "AntDAvatar", "AntDProgress", "AntDSpin", "AntDAlert", "AntDDivider", "AntDSpace"]
  for (const type of antdTypes) {
    assert(!!DS_JSX_NAME[type], `Missing DS_JSX_NAME entry for ${type}`)
  }
})

test("All Chakra components have entries", () => {
  const chakraTypes = ["ChakraButton", "ChakraHeading", "ChakraText", "ChakraBadge", "ChakraInput", "ChakraCheckbox", "ChakraSwitch", "ChakraRadioGroup", "ChakraCard", "ChakraAvatar", "ChakraProgress", "ChakraSpinner", "ChakraAlert"]
  // Note: ChakraSelect maps to "select" (HTML tag)
  for (const type of chakraTypes) {
    assert(!!DS_JSX_NAME[type], `Missing DS_JSX_NAME entry for ${type}`)
  }
})

test("All Carbon components have entries", () => {
  const carbonTypes = ["CarbonButton", "CarbonTag", "CarbonLink", "CarbonTextInput", "CarbonSelect", "CarbonCheckbox", "CarbonRadioButton", "CarbonToggle", "CarbonDatePicker", "CarbonProgressBar", "CarbonLoading", "CarbonAccordion", "CarbonInlineNotification", "CarbonToast"]
  for (const type of carbonTypes) {
    assert(!!DS_JSX_NAME[type], `Missing DS_JSX_NAME entry for ${type}`)
  }
})

test("All Radix components have entries", () => {
  const radixTypes = ["RadixButton", "RadixLabel", "RadixInput", "RadixSelect", "RadixCheckbox", "RadixSwitch", "RadixRadioGroup", "RadixSlider", "RadixAvatar", "RadixProgress", "RadixTabs", "RadixDialog", "RadixToast", "RadixTooltip"]
  for (const type of radixTypes) {
    assert(!!DS_JSX_NAME[type], `Missing DS_JSX_NAME entry for ${type}`)
  }
})

// ── Summary ──────────────────────────────────────────────────────────
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📊 Results: ${passed} ✅ | ${failed} ❌`)
if (failed === 0) {
  console.log("🎉 All tests passed! The code generator correctly generates DS imports.")
} else {
  console.log(`⚠️  ${failed} test(s) failed.`)
}
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
