"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useEditor, Element } from "@craftjs/core"
import type { UserComponent } from "@craftjs/core"
import {
  MousePointer2, 
  Type, 
  Image as ImageIcon, 
  Heading1, 
  TextCursorInput,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  CreditCard,
  PanelTop,
  Navigation,
  CheckSquare,
  AlignLeft,
  Minus,
  Circle,
  Tag,
  AlertTriangle,
  CircleDot,
  ToggleLeft,
  Calendar,
  LayoutTemplate,
  MessageSquare,
  Grid3X3,
  Footprints,
  List,
  Mail,
  Paintbrush,
  Loader,
  Check,
  Blocks,
  SwatchBook,
  Component,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getPluginOptions } from "@/lib/designSystems/loader"
import { designSystemRegistry } from "@/lib/designSystems/registry"
import type { DesignSystemComponent } from "@/lib/designSystems/types"
import { LayerTree } from "./LayerTree"
import { ButtonNode } from "./nodes/ButtonNode"
import { ContainerNode } from "./nodes/ContainerNode"
import { TextNode } from "./nodes/TextNode"
import { ImageNode } from "./nodes/ImageNode"
import { InputNode } from "./nodes/InputNode"
import { HeadingNode } from "./nodes/HeadingNode"
import { CardNode } from "./nodes/CardNode"
import { ModalNode } from "./nodes/ModalNode"
import { NavigationNode } from "./nodes/NavigationNode"
import { CheckboxNode } from "./nodes/CheckboxNode"
import { SelectNode } from "./nodes/SelectNode"
import { TextareaNode } from "./nodes/TextareaNode"
import { DividerNode } from "./nodes/DividerNode"
import { AvatarNode } from "./nodes/AvatarNode"
import { BadgeNode } from "./nodes/BadgeNode"
import { AlertNode } from "./nodes/AlertNode"
import { RadioNode } from "./nodes/RadioNode"
import { ToggleNode } from "./nodes/ToggleNode"
import { DatePickerNode } from "./nodes/DatePickerNode"
import { HeroTemplate } from "./templates/HeroTemplate"
import { PricingTemplate } from "./templates/PricingTemplate"
import { FooterTemplate } from "./templates/FooterTemplate"
import { FeaturesGrid } from "./templates/FeaturesGrid"
import { TestimonialTemplate } from "./templates/TestimonialTemplate"
import { LoginForm } from "./templates/LoginForm"
import { ContactForm } from "./templates/ContactForm"
import { TableOfContents } from "./templates/TableOfContents"
import { FAQSection } from "./templates/FAQSection"
import { TeamGrid } from "./templates/TeamGrid"
import { PricingTableDetailed } from "./templates/PricingTableDetailed"
import { StatsCounter } from "./templates/StatsCounter"
import { NewsletterSection } from "./templates/NewsletterSection"
import { CookieConsentBanner } from "./templates/CookieConsentBanner"
import { TimelineSection } from "./templates/TimelineSection"
import { LogoCloud } from "./templates/LogoCloud"
import { CTASection } from "./templates/CTASection"
import { PortfolioGrid } from "./templates/PortfolioGrid"

// ── Types ───────────────────────────────────────────────────────────

interface ComponentItemProps {
  label: string
  icon: React.ReactNode
  component: React.ReactElement
  description?: string
  highlight?: string
}

interface LeftPanelProps {
  activeDS?: string | null
  onSelectDS?: (dsId: string | null) => void
  dsLoading?: boolean
  dsComponentMap?: Record<string, UserComponent>
}

type TabId = "components" | "layers"

// ── Icon mapping for DS palette items ────────────────────────────────

const DS_ICONS: Record<string, React.ReactNode> = {
  MousePointer2: <MousePointer2 size={18} className="text-blue-600" />,
  Type: <Type size={18} className="text-green-600" />,
  Heading1: <Heading1 size={18} className="text-purple-600" />,
  TextCursorInput: <TextCursorInput size={18} className="text-orange-600" />,
  Calendar: <Calendar size={18} className="text-sky-600" />,
  CheckSquare: <CheckSquare size={18} className="text-teal-600" />,
  ChevronDown: <ChevronDown size={18} className="text-cyan-600" />,
  CircleDot: <CircleDot size={18} className="text-rose-600" />,
  ToggleLeft: <ToggleLeft size={18} className="text-emerald-600" />,
  Tag: <Tag size={18} className="text-pink-600" />,
  Circle: <Circle size={18} className="text-indigo-600" />,
  AlertTriangle: <AlertTriangle size={18} className="text-orange-600" />,
  Minus: <Minus size={18} className="text-gray-500" />,
  LayoutGrid: <LayoutGrid size={18} className="text-cyan-600" />,
  CreditCard: <CreditCard size={18} className="text-amber-600" />,
}

function getIcon(name?: string): React.ReactNode {
  return name && DS_ICONS[name] ? DS_ICONS[name] : <Blocks size={18} className="text-gray-500" />
}

/** Group metadata — single source of truth for both native and DS component groups */
const GROUP_META: Record<string, { label: string; icon: React.ReactNode; defaultOpen: boolean }> = {
  basic: { label: "Basic Elements", icon: <Layers size={16} />, defaultOpen: true },
  layout: { label: "Layout", icon: <LayoutGrid size={16} />, defaultOpen: true },
  data: { label: "Data Display", icon: <CreditCard size={16} />, defaultOpen: true },
  form: { label: "Form Elements", icon: <TextCursorInput size={16} />, defaultOpen: true },
  navigation: { label: "Layout & Navigation", icon: <Navigation size={16} />, defaultOpen: true },
  feedback: { label: "Feedback", icon: <AlertTriangle size={16} />, defaultOpen: true },
  typography: { label: "Typography", icon: <Type size={16} />, defaultOpen: true },
  templates: { label: "Layout Templates", icon: <LayoutTemplate size={16} />, defaultOpen: false },
}

/** Fallback for DS categories not in GROUP_META (derived at render time if needed) */

// ── Native component definitions (for search/filter) ────────────────

interface NativeComponentDef {
  group: string
  label: string
  icon: React.ReactNode
  component: React.ReactElement
  description?: string
}

const NATIVE_COMPONENTS: NativeComponentDef[] = [
  // Basic Elements
  { group: "basic", label: "Button", icon: <MousePointer2 size={18} className="text-blue-600" />, component: <ButtonNode />, description: "Clickable button" },
  { group: "basic", label: "Text", icon: <Type size={18} className="text-green-600" />, component: <TextNode />, description: "Text paragraph" },
  { group: "basic", label: "Heading", icon: <Heading1 size={18} className="text-purple-600" />, component: <HeadingNode />, description: "Section heading" },
  { group: "basic", label: "Input", icon: <TextCursorInput size={18} className="text-orange-600" />, component: <InputNode />, description: "Text input field" },
  { group: "basic", label: "Image", icon: <ImageIcon size={18} className="text-pink-600" />, component: <ImageNode />, description: "Image placeholder" },
  // Layout
  { group: "layout", label: "Container", icon: <Box size={18} className="text-indigo-600" />, component: <Element is={ContainerNode} canvas><ButtonNode text="Drop here" /></Element>, description: "Flex container" },
  { group: "layout", label: "Row Layout", icon: <LayoutGrid size={18} className="text-cyan-600" />, component: <Element is={ContainerNode} canvas flexDirection="row" padding={8}><ButtonNode text="Item 1" size="sm" /><ButtonNode text="Item 2" size="sm" /></Element>, description: "Horizontal layout" },
  // Data Display
  { group: "data", label: "Card", icon: <CreditCard size={18} className="text-amber-600" />, component: <CardNode />, description: "Content card" },
  { group: "data", label: "Badge", icon: <Tag size={18} className="text-pink-600" />, component: <BadgeNode />, description: "Status badge" },
  { group: "data", label: "Avatar", icon: <Circle size={18} className="text-indigo-600" />, component: <AvatarNode />, description: "User avatar" },
  { group: "data", label: "Alert", icon: <AlertTriangle size={18} className="text-orange-600" />, component: <AlertNode />, description: "Notification alert" },
  // Form Elements
  { group: "form", label: "Checkbox", icon: <CheckSquare size={18} className="text-teal-600" />, component: <CheckboxNode />, description: "Checkbox input" },
  { group: "form", label: "Select", icon: <ChevronDown size={18} className="text-cyan-600" />, component: <SelectNode />, description: "Dropdown select" },
  { group: "form", label: "Textarea", icon: <AlignLeft size={18} className="text-violet-600" />, component: <TextareaNode />, description: "Multi-line text" },
  { group: "form", label: "Radio", icon: <CircleDot size={18} className="text-rose-600" />, component: <RadioNode />, description: "Radio button group" },
  { group: "form", label: "Toggle", icon: <ToggleLeft size={18} className="text-emerald-600" />, component: <ToggleNode />, description: "Switch toggle" },
  { group: "form", label: "Date Picker", icon: <Calendar size={18} className="text-sky-600" />, component: <DatePickerNode />, description: "Date input" },
  // Layout & Navigation
  { group: "navigation", label: "Navigation", icon: <Navigation size={18} className="text-gray-700" />, component: <NavigationNode />, description: "Nav bar" },
  { group: "navigation", label: "Divider", icon: <Minus size={18} className="text-gray-500" />, component: <DividerNode />, description: "Horizontal line" },
  { group: "navigation", label: "Modal", icon: <PanelTop size={18} className="text-blue-600" />, component: <ModalNode />, description: "Dialog overlay" },
  // Layout Templates
  { group: "templates", label: "Hero Section", icon: <LayoutTemplate size={18} className="text-indigo-600" />, component: <HeroTemplate />, description: "Full-width hero with CTA" },
  { group: "templates", label: "Pricing Table", icon: <CreditCard size={18} className="text-emerald-600" />, component: <PricingTemplate />, description: "3-column pricing cards" },
  { group: "templates", label: "Features Grid", icon: <Grid3X3 size={18} className="text-amber-600" />, component: <FeaturesGrid />, description: "Feature showcase grid" },
  { group: "templates", label: "Testimonial", icon: <MessageSquare size={18} className="text-pink-600" />, component: <TestimonialTemplate />, description: "Customer testimonial card" },
  { group: "templates", label: "Footer", icon: <Footprints size={18} className="text-gray-700" />, component: <FooterTemplate />, description: "Page footer with links" },
  { group: "templates", label: "Login Form", icon: <TextCursorInput size={18} className="text-emerald-600" />, component: <LoginForm />, description: "Sign in form" },
  { group: "templates", label: "Contact Form", icon: <MessageSquare size={18} className="text-cyan-600" />, component: <ContactForm />, description: "Contact form" },
  { group: "templates", label: "Table of Contents", icon: <List size={18} className="text-violet-600" />, component: <TableOfContents />, description: "Navigation sidebar" },
  { group: "templates", label: "FAQ Section", icon: <MessageSquare size={18} className="text-rose-600" />, component: <FAQSection />, description: "Accordion FAQ" },
  { group: "templates", label: "Pricing Table Detailed", icon: <CreditCard size={18} className="text-blue-600" />, component: <PricingTableDetailed />, description: "4-tier pricing" },
  { group: "templates", label: "Stats Counter", icon: <Grid3X3 size={18} className="text-green-600" />, component: <StatsCounter />, description: "Animated stats" },
  { group: "templates", label: "Newsletter Section", icon: <Mail size={18} className="text-blue-600" />, component: <NewsletterSection />, description: "Email signup" },
  { group: "templates", label: "Timeline Section", icon: <List size={18} className="text-blue-600" />, component: <TimelineSection />, description: "Vertical timeline" },
  { group: "templates", label: "Logo Cloud", icon: <Grid3X3 size={18} className="text-purple-600" />, component: <LogoCloud />, description: "Client logos" },
  { group: "templates", label: "CTA Section", icon: <Mail size={18} className="text-orange-600" />, component: <CTASection />, description: "Call-to-action" },
  { group: "templates", label: "Portfolio Grid", icon: <LayoutTemplate size={18} className="text-rose-600" />, component: <PortfolioGrid />, description: "Project gallery" },
  { group: "templates", label: "Cookie Consent", icon: <AlertTriangle size={18} className="text-amber-600" />, component: <CookieConsentBanner />, description: "Cookie banner" },
  { group: "templates", label: "Team Grid", icon: <Circle size={18} className="text-indigo-600" />, component: <TeamGrid />, description: "Team member cards" },
]

// ── Highlight text helper ───────────────────────────────────────────

const HighlightText: React.FC<{ text: string; query: string }> = React.memo(({ text, query }) => {
  if (!query) return <>{text}</>
  const lower = text.toLowerCase()
  const qLower = query.toLowerCase()
  const idx = lower.indexOf(qLower)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
})
HighlightText.displayName = "HighlightText"

// ── Sub-components ──────────────────────────────────────────────────

/** Memoized native component drag item */
const ComponentItem: React.FC<ComponentItemProps> = React.memo(({ label, icon, component, description, highlight }) => {
  const { connectors } = useEditor()

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connectors.create(ref, component)
        }
      }}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-blue-300 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          <HighlightText text={label} query={highlight || ""} />
        </div>
        {description && (
          <div className="text-xs text-gray-500 truncate">
            <HighlightText text={description} query={highlight || ""} />
          </div>
        )}
      </div>
    </div>
  )
})
ComponentItem.displayName = 'ComponentItem'

interface ComponentGroupProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

const ComponentGroup: React.FC<ComponentGroupProps> = React.memo(({ 
  title, 
  icon, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-4" style={{ contain: isOpen ? "layout style" : "layout style paint", contentVisibility: isOpen ? "visible" : "auto" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="text-gray-500">{icon}</div>
        <span>{title}</span>
        <div className="ml-auto text-gray-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2 px-1">
          {children}
        </div>
      )}
    </div>
  )
})
ComponentGroup.displayName = 'ComponentGroup'

// ── DS Component Items ──────────────────────────────────────────────

const DSComponentItem: React.FC<{
  component: DesignSystemComponent
  componentRef?: UserComponent<any>
}> = React.memo(({ component, componentRef }) => {
  const { connectors } = useEditor()
  const Comp = componentRef

  const element = React.useMemo(() => {
    if (Comp) {
      return React.createElement(Comp, component.props as Record<string, any>)
    }
    return React.createElement(
      "div",
      {
        style: {
          padding: "16px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          textAlign: "center" as const,
          color: "#999",
          fontSize: "12px",
        },
      },
      `${component.name} (unavailable)`,
    )
  }, [Comp, component.props, component.name])

  return (
    <div
      ref={(ref) => {
        if (ref && Comp) {
          connectors.create(ref, element)
        }
      }}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${
        Comp
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-purple-300 dark:hover:border-purple-500 cursor-grab active:cursor-grabbing'
          : 'border-gray-100 bg-gray-50 cursor-not-allowed'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 flex items-center justify-center transition-colors">
        {getIcon(component.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{component.name}</div>
        {component.description && (
          <div className="text-xs text-gray-500 truncate">{component.description}</div>
        )}
      </div>
    </div>
  )
})
DSComponentItem.displayName = 'DSComponentItem'

const DSComponents: React.FC<{
  components: DesignSystemComponent[]
  componentMap?: Record<string, UserComponent>
}> = ({ components, componentMap = {} }) => {
  const grouped = components.reduce<Record<string, DesignSystemComponent[]>>((acc, comp) => {
    const cat = comp.category || "basic"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(comp)
    return acc
  }, {})

  return (
    <>
      {Object.entries(grouped).map(([category, comps]) => {
        const catInfo = GROUP_META[category] || {
          label: category.charAt(0).toUpperCase() + category.slice(1),
          icon: <Blocks size={16} />,
          defaultOpen: true,
        }
        return (
          <ComponentGroup key={category} title={catInfo.label} icon={catInfo.icon} defaultOpen={true}>
            {comps.map((comp) => (
              <DSComponentItem
                key={comp.type}
                component={comp}
                componentRef={componentMap[comp.type]}
              />
            ))}
          </ComponentGroup>
        )
      })}
    </>
  )
}

// ── Main LeftPanel ─────────────────────────────────────────────────

export const LeftPanel: React.FC<LeftPanelProps> = ({
  activeDS,
  onSelectDS,
  dsLoading = false,
  dsComponentMap = {},
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("components")
  const [showDSPicker, setShowDSPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const dsPlugins = React.useMemo(() => getPluginOptions(), [])
  const activePlugin = useMemo(() => activeDS ? designSystemRegistry.get(activeDS) : null, [activeDS])
  const dsComponents = useMemo(() => activeDS ? designSystemRegistry.getActiveComponents() : [], [activeDS])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "components", label: "Components", icon: <Component size={15} /> },
    { id: "layers", label: "Layers", icon: <Layers size={15} /> },
  ]

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && activeTab === "components" && document.activeElement !== searchInputRef.current) {
        const isInput = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA"
        if (!isInput) {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
      // Escape clears search
      if (e.key === "Escape" && searchQuery && document.activeElement === searchInputRef.current) {
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab, searchQuery])

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery("")
  }, [activeTab])

  // Filter native components
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return NATIVE_COMPONENTS
    const q = searchQuery.toLowerCase()
    return NATIVE_COMPONENTS.filter((c) => c.label.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q))
  }, [searchQuery])

  // Group filtered components by group name
  const groupedFiltered = useMemo(() => {
    const grouped: Record<string, NativeComponentDef[]> = {}
    for (const comp of filteredComponents) {
      if (!grouped[comp.group]) grouped[comp.group] = []
      grouped[comp.group].push(comp)
    }
    return grouped
  }, [filteredComponents])

  // Filter DS components
  const filteredDSComponents = useMemo(() => {
    if (!searchQuery || !activeDS) return dsComponents
    const q = searchQuery.toLowerCase()
    return dsComponents.filter((c) => c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q))
  }, [searchQuery, activeDS, dsComponents])

  const totalFiltered = filteredComponents.length + (activeDS ? filteredDSComponents.length : 0)
  const totalAll = NATIVE_COMPONENTS.length + (activeDS ? dsComponents.length : 0)
  const hasFilter = searchQuery.length > 0
  const showNoResults = hasFilter && totalFiltered === 0 && activeTab === "components"

  // Compute tab badge count — MUST be after hasFilter/totalFiltered declarations
  const tabBadgeCount = hasFilter && activeTab === "components" ? totalFiltered : null

  return (
    <div className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-colors">
      {/* Tab Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative",
              activeTab === id
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {icon}
            <span>{label}</span>
            {/* Search results badge on Components tab when filter is active */}
            {id === "components" && tabBadgeCount !== null && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700 animate-in fade-in zoom-in duration-150">
                {tabBadgeCount}
              </span>
            )}
            {activeTab === id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "layers" ? (
          <LayerTree />
        ) : (
          <>
            {/* Search Bar (sticky) */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components... (Press '/')"
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Filter results count */}
              {hasFilter && (
                <div className="flex items-center gap-1 mt-1.5 px-0.5">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    {totalFiltered} of {totalAll} components
                  </span>
                </div>
              )}
            </div>

            {/* Design System Selector */}
            {dsPlugins.length > 0 && !hasFilter && (
              <div className="px-3 pt-3 pb-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <SwatchBook size={14} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Design System
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDSPicker(!showDSPicker)}
                    disabled={dsLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 transition-colors disabled:opacity-60"
                  >
                    {dsLoading ? (
                      <Loader size={16} className="animate-spin text-blue-500" />
                    ) : activeDS ? (
                      <Paintbrush size={16} className="text-blue-600" />
                    ) : (
                      <Blocks size={16} className="text-gray-400" />
                    )}
                    <span className={`flex-1 text-sm ${activeDS ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                      {activeDS
                        ? activePlugin?.name || "Unknown DS"
                        : "Native Components"}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {showDSPicker && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDSPicker(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 py-1 overflow-hidden">
                        <button
                          onClick={() => {
                            onSelectDS?.(null)
                            setShowDSPicker(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                            !activeDS
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Blocks size={16} />
                          <span className="flex-1 text-left">Native Components</span>
                          {!activeDS && <Check size={14} className="text-blue-600" />}
                        </button>
                        <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-700" />
                        {dsPlugins.map((plugin) => {
                          // Brand color per DS
                          const brandColors: Record<string, string> = {
                            antd: 'bg-red-500',
                            shadcn: 'bg-blue-500',
                            chakra: 'bg-teal-500',
                            carbon: 'bg-indigo-500',
                          }
                          const dotColor = brandColors[plugin.id] || 'bg-purple-500'
                          return (
                            <button
                              key={plugin.id}
                              onClick={() => {
                                onSelectDS?.(plugin.id)
                                setShowDSPicker(false)
                              }}
                              disabled={!plugin.enabled}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                                activeDS === plugin.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                  : plugin.enabled
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    : 'text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                              <Paintbrush size={14} className={activeDS === plugin.id ? 'text-blue-600' : 'text-gray-400'} />
                              <span className="flex-1 text-left">{plugin.name}</span>
                              <span className="text-[10px] text-gray-400">{plugin.version}</span>
                              {activeDS === plugin.id && <Check size={14} className="text-blue-600" />}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Active DS Info Bar */}
            {activePlugin && !hasFilter && (
              <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-2">
                  <Paintbrush size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    {activePlugin.name}
                  </span>
                </div>
                <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-0.5">
                  {activePlugin.description}
                </p>
              </div>
            )}

            {/* Component Groups */}
            <div className="p-3">
              {showNoResults ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Search size={28} className="text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No components found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : activeDS ? (
                <>
                  {filteredDSComponents.length > 0 ? (
                    <DSComponents components={filteredDSComponents} componentMap={dsComponentMap} />
                  ) : !hasFilter && (
                    <p className="text-sm text-gray-400 text-center py-8">
                      No components available for this Design System.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {Object.entries(groupedFiltered).map(([groupKey, comps]) => {
                    const meta = GROUP_META[groupKey]
                    if (!meta) return null
                    if (comps.length === 0) return null
                    return (
                      <ComponentGroup key={groupKey} title={meta.label} icon={meta.icon} defaultOpen={!!searchQuery || meta.defaultOpen}>
                        {comps.map((comp) => (
                          <ComponentItem
                            key={comp.label}
                            label={comp.label}
                            icon={comp.icon}
                            component={comp.component}
                            description={comp.description}
                            highlight={searchQuery || undefined}
                          />
                        ))}
                      </ComponentGroup>
                    )
                  })}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
