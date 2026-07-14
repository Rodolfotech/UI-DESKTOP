"use client"

import React, { useState } from "react"
import { useEditor, Element } from "@craftjs/core"
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
  Palette as PaletteIcon,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getPluginOptions } from "@/lib/designSystems/loader"
import { designSystemRegistry } from "@/lib/designSystems/registry"
import type { DesignSystemComponent } from "@/lib/designSystems/types"
import type { UserComponent } from "@craftjs/core"
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
}

interface PaletteProps {
  activeDS?: string | null
  onSelectDS?: (dsId: string | null) => void
  dsLoading?: boolean
  dsComponentMap?: Record<string, UserComponent>
}

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

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  basic: { label: "Basic Elements", icon: <Layers size={16} /> },
  layout: { label: "Layout", icon: <LayoutGrid size={16} /> },
  form: { label: "Form Elements", icon: <TextCursorInput size={16} /> },
  data: { label: "Data Display", icon: <CreditCard size={16} /> },
  navigation: { label: "Navigation", icon: <Navigation size={16} /> },
  feedback: { label: "Feedback", icon: <AlertTriangle size={16} /> },
  typography: { label: "Typography", icon: <Type size={16} /> },
}

// ── Sub-components ──────────────────────────────────────────────────

/** Memoized native component drag item — avoids re-render when parent updates */
const ComponentItem: React.FC<ComponentItemProps> = React.memo(({ label, icon, component, description }) => {
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
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 truncate">{description}</div>
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

/**
 * Collapsible group header. Uses React.memo to avoid re-rendering
 * when the Palette re-renders due to DS selection or other state changes.
 * Closed groups use CSS containment so the browser skips layout/paint.
 */
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

/**
 * Renders a drag item for a Design System component.
 * It creates a React element using the component's type from the resolver.
 */
/** Memoized DS component drag item — prevents re-render when Palette state changes */
const DSComponentItem: React.FC<{
  component: DesignSystemComponent
  componentRef?: UserComponent<any>
}> = React.memo(({ component, componentRef }) => {
  const { connectors } = useEditor()
  const typeName = component.type

  // Use the actual component ref if available, otherwise fallback
  const Comp = componentRef

  const element = React.useMemo(() => {
    if (Comp) {
      // Use the actual component reference for Craft.js
      return React.createElement(Comp, component.props as Record<string, any>)
    }
    // If component not loaded yet, use a placeholder
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

/**
 * Renders all DS components grouped by category.
 */
const DSComponents: React.FC<{
  components: DesignSystemComponent[]
  componentMap?: Record<string, UserComponent>
}> = ({ components, componentMap = {} }) => {
  // Group components by category
  const grouped = components.reduce<Record<string, DesignSystemComponent[]>>((acc, comp) => {
    const cat = comp.category || "basic"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(comp)
    return acc
  }, {})

  return (
    <>
      {Object.entries(grouped).map(([category, comps]) => {
        const catInfo = CATEGORY_LABELS[category] || {
          label: category.charAt(0).toUpperCase() + category.slice(1),
          icon: <Blocks size={16} />,
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

// ── Main Palette ────────────────────────────────────────────────────

export const Palette: React.FC<PaletteProps> = ({
  activeDS,
  onSelectDS,
  dsLoading = false,
  dsComponentMap = {},
}) => {
  const [showDSPicker, setShowDSPicker] = useState(false)

  const dsPlugins = React.useMemo(() => getPluginOptions(), [])
  const activePlugin = activeDS ? designSystemRegistry.get(activeDS) : null
  const dsComponents = activeDS ? designSystemRegistry.getActiveComponents() : []

  return (
    <div className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors">
        <div className="flex items-center gap-2">
          <PaletteIcon size={20} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">Components</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Drag components to the canvas</p>
      </div>

      {/* Design System Selector */}
      {dsPlugins.length > 0 && (
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
                  {/* Native option */}
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
                  {dsPlugins.map((plugin) => (
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
                      <Paintbrush size={16} className={activeDS === plugin.id ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="flex-1 text-left">{plugin.name}</span>
                      <span className="text-[10px] text-gray-400">{plugin.version}</span>
                      {activeDS === plugin.id && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active DS Info Bar */}
      {activePlugin && (
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
        {activeDS ? (
          <>
            {dsComponents.length > 0 ? (
              <DSComponents components={dsComponents} componentMap={dsComponentMap} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                No components available for this Design System.
              </p>
            )}
          </>
        ) : (
          <>
            {/* Native component groups — unchanged */}
            <ComponentGroup title="Basic Elements" icon={<Layers size={16} />}>
              <ComponentItem
                label="Button"
                icon={<MousePointer2 size={18} className="text-blue-600" />}
                component={<ButtonNode />}
                description="Clickable button"
              />
              <ComponentItem
                label="Text"
                icon={<Type size={18} className="text-green-600" />}
                component={<TextNode />}
                description="Text paragraph"
              />
              <ComponentItem
                label="Heading"
                icon={<Heading1 size={18} className="text-purple-600" />}
                component={<HeadingNode />}
                description="Section heading"
              />
              <ComponentItem
                label="Input"
                icon={<TextCursorInput size={18} className="text-orange-600" />}
                component={<InputNode />}
                description="Text input field"
              />
              <ComponentItem
                label="Image"
                icon={<ImageIcon size={18} className="text-pink-600" />}
                component={<ImageNode />}
                description="Image placeholder"
              />
            </ComponentGroup>

            <ComponentGroup title="Layout" icon={<LayoutGrid size={16} />}>
              <ComponentItem
                label="Container"
                icon={<Box size={18} className="text-indigo-600" />}
                component={
                  <Element is={ContainerNode} canvas>
                    <ButtonNode text="Drop here" />
                  </Element>
                }
                description="Flex container"
              />
              <ComponentItem
                label="Row Layout"
                icon={<LayoutGrid size={18} className="text-cyan-600" />}
                component={
                  <Element
                    is={ContainerNode}
                    canvas
                    flexDirection="row"
                    padding={8}
                  >
                    <ButtonNode text="Item 1" size="sm" />
                    <ButtonNode text="Item 2" size="sm" />
                  </Element>
                }
                description="Horizontal layout"
              />
            </ComponentGroup>

            <ComponentGroup title="Data Display" icon={<CreditCard size={16} />}>
              <ComponentItem
                label="Card"
                icon={<CreditCard size={18} className="text-amber-600" />}
                component={<CardNode />}
                description="Content card"
              />
              <ComponentItem
                label="Badge"
                icon={<Tag size={18} className="text-pink-600" />}
                component={<BadgeNode />}
                description="Status badge"
              />
              <ComponentItem
                label="Avatar"
                icon={<Circle size={18} className="text-indigo-600" />}
                component={<AvatarNode />}
                description="User avatar"
              />
              <ComponentItem
                label="Alert"
                icon={<AlertTriangle size={18} className="text-orange-600" />}
                component={<AlertNode />}
                description="Notification alert"
              />
            </ComponentGroup>

            <ComponentGroup title="Form Elements" icon={<TextCursorInput size={16} />}>
              <ComponentItem
                label="Checkbox"
                icon={<CheckSquare size={18} className="text-teal-600" />}
                component={<CheckboxNode />}
                description="Checkbox input"
              />
              <ComponentItem
                label="Select"
                icon={<ChevronDown size={18} className="text-cyan-600" />}
                component={<SelectNode />}
                description="Dropdown select"
              />
              <ComponentItem
                label="Textarea"
                icon={<AlignLeft size={18} className="text-violet-600" />}
                component={<TextareaNode />}
                description="Multi-line text"
              />
              <ComponentItem
                label="Radio"
                icon={<CircleDot size={18} className="text-rose-600" />}
                component={<RadioNode />}
                description="Radio button group"
              />
              <ComponentItem
                label="Toggle"
                icon={<ToggleLeft size={18} className="text-emerald-600" />}
                component={<ToggleNode />}
                description="Switch toggle"
              />
              <ComponentItem
                label="Date Picker"
                icon={<Calendar size={18} className="text-sky-600" />}
                component={<DatePickerNode />}
                description="Date input"
              />
            </ComponentGroup>

            <ComponentGroup title="Layout & Navigation" icon={<Navigation size={16} />}>
              <ComponentItem
                label="Navigation"
                icon={<Navigation size={18} className="text-gray-700" />}
                component={<NavigationNode />}
                description="Nav bar"
              />
              <ComponentItem
                label="Divider"
                icon={<Minus size={18} className="text-gray-500" />}
                component={<DividerNode />}
                description="Horizontal line"
              />
              <ComponentItem
                label="Modal"
                icon={<PanelTop size={18} className="text-blue-600" />}
                component={<ModalNode />}
                description="Dialog overlay"
              />
            </ComponentGroup>

            <ComponentGroup title="Layout Templates" icon={<LayoutTemplate size={16} />} defaultOpen={false}>
              <ComponentItem
                label="Hero Section"
                icon={<LayoutTemplate size={18} className="text-indigo-600" />}
                component={<HeroTemplate />}
                description="Full-width hero with CTA"
              />
              <ComponentItem
                label="Pricing Table"
                icon={<CreditCard size={18} className="text-emerald-600" />}
                component={<PricingTemplate />}
                description="3-column pricing cards"
              />
              <ComponentItem
                label="Features Grid"
                icon={<Grid3X3 size={18} className="text-amber-600" />}
                component={<FeaturesGrid />}
                description="Feature showcase grid"
              />
              <ComponentItem
                label="Testimonial"
                icon={<MessageSquare size={18} className="text-pink-600" />}
                component={<TestimonialTemplate />}
                description="Customer testimonial card"
              />
              <ComponentItem
                label="Footer"
                icon={<Footprints size={18} className="text-gray-700" />}
                component={<FooterTemplate />}
                description="Page footer with links"
              />
              <ComponentItem
                label="Login Form"
                icon={<TextCursorInput size={18} className="text-emerald-600" />}
                component={<LoginForm />}
                description="Sign in form with email & password"
              />
              <ComponentItem
                label="Contact Form"
                icon={<MessageSquare size={18} className="text-cyan-600" />}
                component={<ContactForm />}
                description="Contact form with name, email & message"
              />
              <ComponentItem
                label="Table of Contents"
                icon={<List size={18} className="text-violet-600" />}
                component={<TableOfContents />}
                description="Navigation sidebar with section links"
              />
              <ComponentItem
                label="FAQ Section"
                icon={<MessageSquare size={18} className="text-rose-600" />}
                component={<FAQSection />}
                description="Accordion FAQ with expandable items"
              />
              <ComponentItem
                label="Pricing Table Detailed"
                icon={<CreditCard size={18} className="text-blue-600" />}
                component={<PricingTableDetailed />}
                description="4-tier pricing with yearly toggle"
              />
              <ComponentItem
                label="Stats Counter"
                icon={<Grid3X3 size={18} className="text-green-600" />}
                component={<StatsCounter />}
                description="Animated stats with numbers & labels"
              />
              <ComponentItem
                label="Newsletter Section"
                icon={<Mail size={18} className="text-blue-600" />}
                component={<NewsletterSection />}
                description="Email signup with input & CTA"
              />
              <ComponentItem
                label="Timeline Section"
                icon={<List size={18} className="text-blue-600" />}
                component={<TimelineSection />}
                description="Vertical timeline with milestones"
              />
              <ComponentItem
                label="Logo Cloud"
                icon={<Grid3X3 size={18} className="text-purple-600" />}
                component={<LogoCloud />}
                description="Client logos grid"
              />
              <ComponentItem
                label="CTA Section"
                icon={<Mail size={18} className="text-orange-600" />}
                component={<CTASection />}
                description="Call-to-action with buttons"
              />
              <ComponentItem
                label="Portfolio Grid"
                icon={<LayoutTemplate size={18} className="text-rose-600" />}
                component={<PortfolioGrid />}
                description="Project gallery grid"
              />
              <ComponentItem
                label="Cookie Consent"
                icon={<AlertTriangle size={18} className="text-amber-600" />}
                component={<CookieConsentBanner />}
                description="Cookie banner with accept/reject"
              />
              <ComponentItem
                label="Team Grid"
                icon={<Circle size={18} className="text-indigo-600" />}
                component={<TeamGrid />}
                description="Team member cards with avatars"
              />
            </ComponentGroup>
          </>
        )}
      </div>
    </div>
  )
}
