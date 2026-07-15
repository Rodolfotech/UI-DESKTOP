"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentProject, renameProject } from "@/lib/projectManager"

interface UseProjectNameReturn {
  projectName: string
  loading: boolean
  updateName: (newName: string) => Promise<void>
}

/**
 * Hook for reading and updating the currently active project's name.
 * Fetches the project from the database on mount and exposes the name as state.
 */
export function useProjectName(): UseProjectNameReturn {
  const [projectName, setProjectName] = useState("Untitled Design")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const project = await getCurrentProject()
        if (!cancelled) {
          setProjectName(project?.name || "Untitled Design")
        }
      } catch {
        if (!cancelled) {
          setProjectName("Untitled Design")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    // Re-fetch when the page regains focus (user may have switched projects)
    const onFocus = () => { cancelled = false; load() }
    window.addEventListener("focus", onFocus)
    return () => {
      cancelled = true
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  const updateName = useCallback(async (newName: string) => {
    try {
      const project = await getCurrentProject()
      if (project) {
        await renameProject(project.id, newName)
        setProjectName(newName)
      }
    } catch {
      console.error("[useProjectName] Failed to rename project")
    }
  }, [])

  return { projectName, loading, updateName }
}
