/**
 * Craft.js Adapter Factory for External Design System Components
 *
 * Creates a UserComponent wrapper that:
 * 1. Lazy-imports the actual DS component
 * 2. Wraps it with Craft.js `useNode()` for drag, drop, and selection
 * 3. Provides a settings panel for prop editing
 *
 * Usage:
 *   const MyAdapter = createExternalAdapter(
 *     () => import('antd').then(m => m.Button),
 *     'AntDButton',
 *     'Button',
 *     { text: 'Button', type: 'primary' },
 *     MySettings,
 *   )
 */

import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { registerDSSettings } from "./settingsRegistry"

/**
 * Creates a lazy-loading Craft.js UserComponent adapter for an external
 * Design System component.
 *
 * @param importFn  Function that returns a promise resolving to the external component
 * @param type      Unique type identifier used in Craft.js resolver
 * @param displayName  Display name shown in the editor
 * @param defaultProps  Default props for the component
 * @param settingsComponent  Optional React component for the settings panel
 *                          (uses useNode() hook directly, like native Craft.js settings)
 */
export function createExternalAdapter<T extends Record<string, any>>(
  importFn: () => Promise<any>,
  type: string,
  displayName: string,
  defaultProps: T,
  settingsComponent?: React.ComponentType,
): UserComponent<T> {
  // Use a lazy approach: store the loaded component in a module-level cache
  // so that once loaded, all instances share the same reference.
  let cachedComponent: any = null
  let loadPromise: Promise<void> | null = null

  function load(): Promise<void> {
    if (cachedComponent) return Promise.resolve()
    if (!loadPromise) {
      loadPromise = importFn().then((mod) => {
        cachedComponent = mod
      })
    }
    return loadPromise
  }

  // Register settings panel in the DS settings registry
  if (settingsComponent) {
    registerDSSettings(type, settingsComponent)
  }

  // Pre-bind .craft properties
  const craftConfig: UserComponent<T>["craft"] = {
    displayName,
    props: defaultProps,
    ...(settingsComponent
      ? { related: { settings: settingsComponent } }
      : {}),
    custom: {
      isExternalDS: true,
      dsType: type,
    },
  }

  // The actual node component
  const NodeComponent: UserComponent<T> = (props) => {
    const {
      connectors: { connect, drag },
      selected,
      hovered,
    } = useNode((state) => ({
      selected: state.events.selected,
      hovered: state.events.hovered,
    }))

    const [Comp, setComp] = React.useState<any>(
      () => cachedComponent,
    )
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
      if (cachedComponent) {
        setComp(() => cachedComponent)
        return
      }
      let cancelled = false
      load()
        .then(() => {
          if (!cancelled && cachedComponent) {
            setComp(() => cachedComponent)
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(`[DSAdapter] Failed to load ${displayName}:`, err)
            setError(err instanceof Error ? err.message : "Failed to load")
          }
        })
      return () => {
        cancelled = true
      }
    }, [])

    // Build a ref callback that handles connect + drag
    const refCallback = React.useCallback(
      (el: HTMLDivElement | null) => {
        if (el) {
          connect(drag(el))
        }
      },
      [connect, drag],
    )

    if (error) {
      return (
        <div
          ref={refCallback}
          className={cn(
            "border-2 border-dashed border-red-300 rounded-lg p-4 text-center text-sm text-red-500",
            selected && "ring-2 ring-blue-500 ring-offset-2",
          )}
        >
          ⚠ Error: {error}
        </div>
      )
    }

    if (!Comp) {
      return (
        <div
          ref={refCallback}
          className={cn(
            "border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center",
            selected && "ring-2 ring-blue-500 ring-offset-2",
            hovered && !selected && "ring-2 ring-blue-300 ring-offset-1",
          )}
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading {displayName}...</span>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={refCallback}
        className={cn(
          selected && "ring-2 ring-blue-500 ring-offset-2",
          hovered && !selected && "ring-2 ring-blue-300 ring-offset-1",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Comp {...props} />
      </div>
    )
  }

  // Attach Craft.js static configuration
  NodeComponent.craft = craftConfig

  return NodeComponent
}

/**
 * Helper to create a default settings panel for DS components.
 * Uses useNode() hook directly to access the current node's props.
 */
export function createDefaultSettings(
  displayName: string,
): React.ComponentType {
  const DefaultSettings: React.FC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as Record<string, any>,
    }))

    const entries = Object.entries(props || {})
    if (entries.length === 0) {
      return (
        <p className="text-sm text-gray-400 text-center py-4">
          No configurable properties for {displayName}.
        </p>
      )
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            {typeof value === "string" && value.startsWith("#") ? (
              <input
                type="color"
                value={value}
                onChange={(e) =>
                  setProp((p: Record<string, any>) => {
                    p[key] = e.target.value
                  })
                }
                className="w-full h-9 border border-gray-300 rounded-md"
              />
            ) : typeof value === "boolean" ? (
              <select
                value={value ? "true" : "false"}
                onChange={(e) =>
                  setProp((p: Record<string, any>) => {
                    p[key] = e.target.value === "true"
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : typeof value === "number" ? (
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setProp((p: Record<string, any>) => {
                    p[key] = Number(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            ) : (
              <input
                type="text"
                value={String(value ?? "")}
                onChange={(e) =>
                  setProp((p: Record<string, any>) => {
                    p[key] = e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>
        ))}
      </div>
    )
  }
  return DefaultSettings
}
