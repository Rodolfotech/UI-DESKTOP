/**
 * Design System Dynamic Loader
 *
 * Provides utilities to:
 * - Register all available DS plugins
 * - Dynamically load adapters for the currently active DS
 * - Return a resolver map to merge into Craft.js Editor's resolver prop
 */

import { designSystemRegistry } from "./registry"
import type { DSResolverMap, DesignSystemPlugin } from "./types"
import type { UserComponent } from "@craftjs/core"

/**
 * Register all built-in Design System plugins.
 * Call this once at app startup.
 */
export async function registerAllPlugins(): Promise<void> {
  // Built-in plugins are registered here
  const { antdPlugin } = await import("./antd")
  designSystemRegistry.register(antdPlugin)

  const { shadcnPlugin } = await import("./shadcn")
  designSystemRegistry.register(shadcnPlugin)

  const { chakraPlugin } = await import("./chakra")
  designSystemRegistry.register(chakraPlugin)

  const { carbonPlugin } = await import("./carbon")
  designSystemRegistry.register(carbonPlugin)
}

/**
 * Load all adapter components for a specific DS plugin and return
 * a resolver map that can be spread into the Editor's resolver.
 */
export async function loadPluginResolvers(
  pluginId: string | null,
): Promise<DSResolverMap> {
  if (!pluginId) return {}

  const plugin = designSystemRegistry.get(pluginId)
  if (!plugin) {
    console.warn(`[DSLoader] Plugin "${pluginId}" not found`)
    return {}
  }

  const resolvers: DSResolverMap = {}
  for (const comp of plugin.components) {
    try {
      const { component } = await plugin.loadAdapter(comp.type)
      resolvers[comp.type] = component
    } catch (err) {
      console.error(
        `[DSLoader] Failed to load adapter for ${comp.type}:`,
        err,
      )
    }
  }

  return resolvers
}

/**
 * Get the list of registered plugin options for the UI selector.
 * Only returns plugins that are available (optional: filter by enabled).
 */
export function getPluginOptions(): {
  id: string
  name: string
  description: string
  version: string
  enabled: boolean
}[] {
  return designSystemRegistry.list().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    version: p.version,
    enabled: p.enabled,
  }))
}

/**
 * Get component import statements for code generation based on active DS.
 */
export function getDSImportStatements(pluginId: string | null): string[] {
  if (!pluginId) return []

  const plugin = designSystemRegistry.get(pluginId)
  if (!plugin) return []

  // Collect unique imports across all components
  const imports = new Set<string>()
  for (const comp of plugin.components) {
    const stmts = plugin.getImportStatements(comp.type)
    for (const stmt of stmts) {
      imports.add(stmt)
    }
  }

  return Array.from(imports)
}
