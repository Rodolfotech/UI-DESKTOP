"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@craftjs/core"
import { getCurrentProject } from "@/lib/projectManager"

interface EditorLoaderProps {
  storageKey?: string
}

/**
 * Component that restores editor state on mount.
 * Tries the project manager (SQLite/IndexedDB) first,
 * then falls back to localStorage.
 * Must be used inside an Editor component.
 */
export const EditorLoader: React.FC<EditorLoaderProps> = ({
  storageKey = "proyect-ui-editor-state",
}) => {
  const { actions } = useEditor()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (isLoaded) return

    const restore = async () => {
      // Try project manager first
      try {
        const project = await getCurrentProject()
        if (project && project.structure) {
          actions.deserialize(project.structure)
          console.log("[EditorLoader] State restored from project manager")
          setIsLoaded(true)
          return
        }
      } catch {
        // Project manager not available, fall through to localStorage
      }

      // Fall back to localStorage
      const savedState = localStorage.getItem(storageKey)
      if (savedState) {
        actions.deserialize(savedState)
        console.log("[EditorLoader] State restored from localStorage")
      }
      setIsLoaded(true)
    }

    restore()
  }, [actions, storageKey, isLoaded])

  return null
}
