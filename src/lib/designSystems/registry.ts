/**
 * Design System Plugin Registry
 *
 * Singleton that manages registration of Design System plugins
 * and tracks which one is currently active.
 */

import type { DesignSystemPlugin, DesignSystemRegistry, DesignSystemComponent } from "./types"

class DSRegistry implements DesignSystemRegistry {
  private plugins = new Map<string, DesignSystemPlugin>()
  private activeId: string | null = null

  register(plugin: DesignSystemPlugin): void {
    this.plugins.set(plugin.id, plugin)
  }

  get(id: string): DesignSystemPlugin | undefined {
    return this.plugins.get(id)
  }

  list(): DesignSystemPlugin[] {
    return Array.from(this.plugins.values())
  }

  getActive(): string | null {
    return this.activeId
  }

  setActive(id: string | null): void {
    if (id === null) {
      this.activeId = null
      return
    }
    const plugin = this.plugins.get(id)
    if (!plugin) {
      console.warn(`[DSRegistry] Plugin "${id}" not found`)
      return
    }
    if (!plugin.enabled) {
      console.warn(`[DSRegistry] Plugin "${id}" is not enabled (dependencies not installed?)`)
    }
    this.activeId = id
  }

  isActive(id: string): boolean {
    return this.activeId === id
  }

  getActiveComponents(): DesignSystemComponent[] {
    if (!this.activeId) return []
    const plugin = this.plugins.get(this.activeId)
    return plugin?.components ?? []
  }

  /** Reset to default state (useful for testing) */
  reset(): void {
    this.plugins.clear()
    this.activeId = null
  }
}

/** Singleton instance */
export const designSystemRegistry = new DSRegistry()
