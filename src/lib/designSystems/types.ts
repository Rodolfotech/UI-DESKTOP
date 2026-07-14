/**
 * Design System Plugin Architecture — Core Types
 *
 * Each Design System (Ant Design, Shadcn UI, Chakra UI, Carbon DS) is a plugin
 * that exposes component metadata, lazy-loaders, and Craft.js adapters.
 */

import type { UserComponent } from "@craftjs/core"

/**
 * Category for grouping components in the Palette
 */
export type ComponentCategory =
  | "basic"
  | "layout"
  | "form"
  | "data"
  | "navigation"
  | "feedback"
  | "display"
  | "typography"

/**
 * Metadata about a single component exposed by a Design System
 */
export interface DesignSystemComponent {
  /** Unique type identifier used in Craft.js resolver (e.g. "AntDButton") */
  type: string
  /** Human-readable display name (e.g. "Button") */
  name: string
  /** Default props for the component */
  props: Record<string, unknown>
  /** UI category for palette grouping */
  category: ComponentCategory
  /** Optional short description */
  description?: string
  /** Icon identifier (lucide icon name) */
  icon?: string
}

/**
 * A Design System plugin that provides components, loaders, and adapters
 */
export interface DesignSystemPlugin {
  /** Unique plugin identifier (e.g. "antd", "shadcn", "chakra", "carbon") */
  id: string
  /** Display name (e.g. "Ant Design 5.x") */
  name: string
  /** Plugin version */
  version: string
  /** Short description */
  description: string
  /** Component metadata list */
  components: DesignSystemComponent[]
  /**
   * Dynamically load a specific component's Craft.js adapter.
   * Returns the adapter component and optional settings panel.
   */
  loadAdapter(type: string): Promise<{
    component: UserComponent<any>
    settings?: React.ComponentType<any>
  }>
  /**
   * Return the import statement(s) needed for code generation.
   * Example: `import { Button } from "antd"`
   */
  getImportStatements(type: string): string[]
  /**
   * Whether the plugin's dependencies are installed and ready to use
   */
  enabled: boolean
}

/**
 * Registry that holds all registered DS plugins and manages the active one.
 */
export interface DesignSystemRegistry {
  /** Register a new plugin */
  register(plugin: DesignSystemPlugin): void
  /** Get a plugin by id */
  get(id: string): DesignSystemPlugin | undefined
  /** List all registered plugins */
  list(): DesignSystemPlugin[]
  /** Get the currently active plugin id */
  getActive(): string | null
  /** Set the active plugin id (null = native components only) */
  setActive(id: string | null): void
  /** Check if a plugin is the active one */
  isActive(id: string): boolean
  /** Get components for the active plugin (or empty if none) */
  getActiveComponents(): DesignSystemComponent[]
}

/**
 * Resolution of extra resolvers loaded from an active design system.
 * This is passed up to the Editor's resolver prop.
 */
export interface DSResolverMap {
  [type: string]: UserComponent<any>
}
