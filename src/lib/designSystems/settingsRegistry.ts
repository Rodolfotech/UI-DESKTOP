/**
 * DS Settings Registry
 *
 * Maps Design System component type identifiers (e.g., "AntDButton")
 * to their Craft.js settings panels. The Inspector uses this to show
 * the correct settings for any dynamically loaded DS component.
 */

import type React from "react"

/** Global map: type -> settings component */
const settingsMap = new Map<string, React.ComponentType<any>>()

/**
 * Register a settings panel for a DS component type.
 * Called from createExternalAdapter when a settings component is provided.
 */
export function registerDSSettings(
  type: string,
  settings: React.ComponentType<any>,
): void {
  settingsMap.set(type, settings)
}

/**
 * Retrieve the settings panel for a DS component type.
 */
export function getDSSettings(type: string): React.ComponentType<any> | undefined {
  return settingsMap.get(type)
}

/**
 * Check if a type has registered DS settings.
 */
export function hasDSSettings(type: string): boolean {
  return settingsMap.has(type)
}

/** Clear all registrations (useful for testing) */
export function clearDSSettings(): void {
  settingsMap.clear()
}
