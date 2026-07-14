"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { 
  Settings, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Layers,
  Info,
  Component,
  Blocks
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getDSSettings } from "@/lib/designSystems/settingsRegistry"
import { ButtonNodeSettings } from "./nodes/ButtonNode"
import { ContainerNodeSettings } from "./nodes/ContainerNode"
import { TextNodeSettings } from "./nodes/TextNode"
import { ImageNodeSettings } from "./nodes/ImageNode"
import { InputNodeSettings } from "./nodes/InputNode"
import { HeadingNodeSettings } from "./nodes/HeadingNode"
import { CardNodeSettings } from "./nodes/CardNode"
import { ModalNodeSettings } from "./nodes/ModalNode"
import { NavigationNodeSettings } from "./nodes/NavigationNode"
import { CheckboxNodeSettings } from "./nodes/CheckboxNode"
import { SelectNodeSettings } from "./nodes/SelectNode"
import { TextareaNodeSettings } from "./nodes/TextareaNode"
import { DividerNodeSettings } from "./nodes/DividerNode"
import { AvatarNodeSettings } from "./nodes/AvatarNode"
import { BadgeNodeSettings } from "./nodes/BadgeNode"
import { AlertNodeSettings } from "./nodes/AlertNode"
import { RadioNodeSettings } from "./nodes/RadioNode"
import { ToggleNodeSettings } from "./nodes/ToggleNode"
import { DatePickerNodeSettings } from "./nodes/DatePickerNode"
import { HeroTemplateSettings } from "./templates/HeroTemplate"
import { PricingTemplateSettings } from "./templates/PricingTemplate"
import { PricingTableDetailedSettings } from "./templates/PricingTableDetailed"
import { FooterTemplateSettings } from "./templates/FooterTemplate"
import { FeaturesGridSettings } from "./templates/FeaturesGrid"
import { TestimonialTemplateSettings } from "./templates/TestimonialTemplate"
import { StatsCounterSettings } from "./templates/StatsCounter"
import { NewsletterSectionSettings } from "./templates/NewsletterSection"
import { CookieConsentBannerSettings } from "./templates/CookieConsentBanner"
import { TimelineSectionSettings } from "./templates/TimelineSection"
import { LogoCloudSettings } from "./templates/LogoCloud"
import { CTASectionSettings } from "./templates/CTASection"
import { PortfolioGridSettings } from "./templates/PortfolioGrid"

interface SelectedNodeProps {
  nodeId: string
}

const SelectedNode: React.FC<SelectedNodeProps> = ({ nodeId }) => {
  const { name, deletable } = useNode((node) => ({
    name: node.data.displayName || '',
    deletable: (node.data as unknown as { deletable?: boolean }).deletable !== false,
  }))

  const { query, actions } = useEditor()

  const handleMoveUp = () => {
    const node = query.node(nodeId).get()
    const { parent } = node.data
    if (parent) {
      const parentNode = query.node(parent).get()
      const index = parentNode.data.nodes.indexOf(nodeId)
      if (index > 0) {
        actions.move(nodeId, parent, index - 1)
      }
    }
  }

  const handleMoveDown = () => {
    const node = query.node(nodeId).get()
    const { parent } = node.data
    if (parent) {
      const parentNode = query.node(parent).get()
      const index = parentNode.data.nodes.indexOf(nodeId)
      if (index < parentNode.data.nodes.length - 1) {
        actions.move(nodeId, parent, index + 1)
      }
    }
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Layers size={14} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{nodeId.slice(-8)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMoveUp}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
            title="Move Up"
          >
            <MoveUp size={14} />
          </button>
          <button
            onClick={handleMoveDown}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
            title="Move Down"
          >
            <MoveDown size={14} />
          </button>
          {deletable && (
            <button
              onClick={() => actions.delete(nodeId)}
              className="p-1.5 hover:bg-red-100 rounded text-red-600"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface SettingsPanelProps {
  nodeName: string
  resolvedName: string
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ nodeName, resolvedName }) => {
  const settingsComponents: Record<string, React.FC> = {
    Button: ButtonNodeSettings,
    Container: ContainerNodeSettings,
    Text: TextNodeSettings,
    Image: ImageNodeSettings,
    Input: InputNodeSettings,
    Heading: HeadingNodeSettings,
    Card: CardNodeSettings,
    Modal: ModalNodeSettings,
    Navigation: NavigationNodeSettings,
    Checkbox: CheckboxNodeSettings,
    Select: SelectNodeSettings,
    Textarea: TextareaNodeSettings,
    Divider: DividerNodeSettings,
    Avatar: AvatarNodeSettings,
    Badge: BadgeNodeSettings,
    Alert: AlertNodeSettings,
    Radio: RadioNodeSettings,
    Toggle: ToggleNodeSettings,
    DatePicker: DatePickerNodeSettings,
    "Hero Section": HeroTemplateSettings,
    "Pricing Table": PricingTemplateSettings,
    "Pricing Table Detailed": PricingTableDetailedSettings,
    Footer: FooterTemplateSettings,
    "Features Grid": FeaturesGridSettings,
    Testimonial: TestimonialTemplateSettings,
    "Stats Counter": StatsCounterSettings,
    "Newsletter Section": NewsletterSectionSettings,
    "Cookie Consent Banner": CookieConsentBannerSettings,
    "Timeline Section": TimelineSectionSettings,
    "Logo Cloud": LogoCloudSettings,
    "CTA Section": CTASectionSettings,
    "Portfolio Grid": PortfolioGridSettings,
  }

  // For DS components: try settings registry by resolvedName first
  if (resolvedName) {
    const DsSettings = getDSSettings(resolvedName)
    if (DsSettings) {
      return <DsSettings />
    }
  }

  // Fall back to hardcoded lookup by displayName
  const SettingsComponent = settingsComponents[nodeName]

  if (!SettingsComponent) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Info size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No settings available</p>
      </div>
    )
  }

  return <SettingsComponent />
}

export const Inspector: React.FC = () => {
  const { selectedNodeId, actions, name, resolvedName } = useEditor((state, query) => {
    const currentNodeId = [...state.events.selected][0]
    let nodeName = ''
    let resolvedType = ''
    if (currentNodeId) {
      const node = query.node(currentNodeId).get()
      nodeName = node.data.displayName || ''
      const type = node.data.type
      resolvedType = typeof type === 'object' && type !== null
        ? (type as { resolvedName?: string }).resolvedName || ''
        : ''
    }
    return {
      selectedNodeId: currentNodeId,
      name: nodeName,
      resolvedName: resolvedType,
    }
  })

  // Separate selector for nodes so stats update when canvas changes
  const { nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }))

  // Compute canvas statistics from live node state
  const stats = React.useMemo(() => {
    const types: Record<string, number> = {}
    let total = 0
    let templateCount = 0
    for (const [id, node] of Object.entries(nodes)) {
      if (id === "ROOT") continue
      total++
      const resolvedName = node.data.displayName || (node.data.type as { resolvedName?: string })?.resolvedName || "Unknown"
      types[resolvedName] = (types[resolvedName] || 0) + 1
      if (resolvedName.includes("Section") || resolvedName.includes("Template") || resolvedName.includes("Form") || resolvedName.includes("Grid") || resolvedName.includes("Counter") || resolvedName.includes("Banner") || resolvedName.includes("TOC") || resolvedName.includes("Footer") || resolvedName.includes("Table")) {
        templateCount++
      }
    }

    // Compute max depth of component tree
    let maxDepth = 0
    function getDepth(nodeId: string, depth: number, visited: Set<string>) {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      if (depth > maxDepth) maxDepth = depth
      const node = nodes[nodeId]
      if (!node) return
      const children = node.data.nodes || []
      for (const childId of children) {
        getDepth(childId, depth + 1, visited)
      }
    }
    for (const id of Object.keys(nodes)) {
      getDepth(id, 0, new Set())
    }

    // Estimate complexity score
    const complexity = total > 0
      ? Math.round((total * 0.5 + maxDepth * 2 + templateCount * 1.5) * 10) / 10
      : 0

    return { total, types, templateCount, maxDepth, complexity }
  }, [nodes])

  const basicCount = stats.total - stats.templateCount

  // Track mount time for "design time" metric
  const mountTime = React.useRef(Date.now())
  const [elapsed, setElapsed] = React.useState('0s')
  React.useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - mountTime.current) / 1000)
      if (seconds < 60) setElapsed(`${seconds}s`)
      else if (seconds < 3600) setElapsed(`${Math.floor(seconds / 60)}m ${seconds % 60}s`)
      else setElapsed(`${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Persist metrics to localStorage — debounced to max once per 5s
  const lastSaveRef = React.useRef(0)
  const sessionIncremented = React.useRef(false)
  React.useEffect(() => {
    const now = Date.now()
    if (now - lastSaveRef.current < 5000) return
    lastSaveRef.current = now

    const elapsed = mountTime.current ? Math.floor((now - mountTime.current) / 1000) : 0
    const metrics = {
      total: stats.total,
      templateCount: stats.templateCount,
      maxDepth: stats.maxDepth,
      complexity: stats.complexity,
      elapsed,
      timestamp: now,
    }
    try {
      const stored = localStorage.getItem('proyect-ui-metrics')
      const existing = stored ? JSON.parse(stored) : { sessions: 0, max: null }
      
      // Track max values
      if (!existing.max || metrics.total > (existing.max?.total || 0)) {
        existing.max = metrics
      }
      
      // Increment session counter once per mount
      if (!sessionIncremented.current) {
        existing.sessions = (existing.sessions || 0) + 1
        sessionIncremented.current = true
      }
      
      existing.latest = metrics
      localStorage.setItem('proyect-ui-metrics', JSON.stringify(existing))
    } catch { /* ignore storage errors */ }
  }, [stats])

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Inspector</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {selectedNodeId ? "Edit selected component" : "Select a component to edit"}
        </p>
      </div>

      {/* Canvas Statistics */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Canvas Overview</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Blocks size={16} className="text-gray-400 mb-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Components</span>
          </div>
          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Component size={16} className="text-gray-400 mb-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.templateCount}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Templates</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Layers size={16} className="text-gray-400 mb-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.maxDepth}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Max Depth</span>
          </div>
          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.complexity < 10 ? 'Low' : stats.complexity < 30 ? 'Medium' : 'High'}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Complexity</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Design time</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{elapsed}</span>
        </div>

        {/* Component type breakdown */}
        {stats.total > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1 mb-2">
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Breakdown</span>
            </div>
            {Object.entries(stats.types).sort(([,a], [,b]) => b - a).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{type.replace(/Node$/, "").replace(/Template$/, "")}</span>
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{count}</span>
              </div>
            ))}
          </div>
        )}
        {stats.total === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            No components on canvas yet.
          </p>
        )}
      </div>

      {selectedNodeId ? (
        <div>
          {/* Selected Node Header */}
          <SelectedNode nodeId={selectedNodeId} />

          {/* Settings Section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Properties</h3>
            </div>
            <SettingsPanel nodeName={name} resolvedName={resolvedName} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <Layers size={20} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No selection</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click on a component in the canvas to edit its properties
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {selectedNodeId && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (selectedNodeId) {
                  actions.history.undo()
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>Undo Last Change</span>
            </button>
            <button
              onClick={() => {
                if (selectedNodeId) {
                  actions.delete(selectedNodeId)
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete Component</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
