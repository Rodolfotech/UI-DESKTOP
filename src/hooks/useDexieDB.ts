"use client"

import { useState, useEffect, useCallback } from "react"
import { getDexieInstance } from "@/lib/dexie-db"

// ── Types ──────────────────────────────────────────────────────────

export interface DexieProject {
  id?: number
  name: string
  description: string
  structure: string
  sort_order: number
  tags: string
  created_at: string
  updated_at: string
}

export interface DexieSnapshot {
  id?: number
  project_id: number
  structure: string
  description: string
  created_at: string
}

// ── Hook ───────────────────────────────────────────────────────────

interface DexieDBState {
  ready: boolean
  error: string | null
}

interface UseDexieDBReturn {
  ready: boolean
  error: string | null
  // Projects
  listProjects: () => Promise<DexieProject[]>
  getProject: (id: number) => Promise<DexieProject | undefined>
  createProject: (name: string, structure: string, description?: string, tags?: string) => Promise<number>
  updateProject: (id: number, structure: string) => Promise<void>
  renameProject: (id: number, name: string, description?: string) => Promise<void>
  setProjectTags: (id: number, tags: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  reorderProjects: (orderedIds: number[]) => Promise<void>
  duplicateProject: (id: number) => Promise<number | null>
  // Snapshots
  saveSnapshot: (projectId: number, structure: string, description?: string) => Promise<number>
  getSnapshots: (projectId: number) => Promise<DexieSnapshot[]>
  deleteSnapshot: (id: number) => Promise<void>
  // Bulk
  exportProject: (id: number) => Promise<string | null>
  importProject: (jsonData: string) => Promise<number | null>
}

/**
 * React hook for Dexie.js IndexedDB access.
 *
 * Uses the same Dexie database schema as the DB layer (dexie-db.ts),
 * ensuring data consistency across both the utility API and React hooks.
 *
 * @example
 * ```tsx
 * const db = useDexieDB()
 * const projects = await db.listProjects()
 * ```
 */
export function useDexieDB(): UseDexieDBReturn {
  const [state, setState] = useState<DexieDBState>({
    ready: false,
    error: null,
  })

  // Use the shared singleton instance from dexie-db.ts
  const db = getDexieInstance()

  // Verify the database opens successfully on mount
  useEffect(() => {
    let cancelled = false

    db.open()
      .then(() => {
        if (!cancelled) setState({ ready: true, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            ready: false,
            error: err instanceof Error ? err.message : "Failed to open DexieDB",
          })
        }
      })

    return () => { cancelled = true }
  }, [db])

  const now = useCallback(() => new Date().toISOString(), [])

  // ── Projects ─────────────────────────────────────────────────────

  const listProjects = useCallback(async (): Promise<DexieProject[]> => {
    return db.projects.orderBy("sort_order").toArray()
  }, [db])

  const getProject = useCallback(async (id: number): Promise<DexieProject | undefined> => {
    return db.projects.get(id)
  }, [db])

  const createProject = useCallback(
    async (name: string, structure: string, description = "", tags = ""): Promise<number> => {
      const count = await db.projects.count()
      const id = await db.projects.add({
        name,
        description,
        structure,
        sort_order: count,
        tags,
        created_at: now(),
        updated_at: now(),
      })
      return id
    },
    [db, now]
  )

  const updateProject = useCallback(
    async (id: number, structure: string): Promise<void> => {
      await db.projects.update(id, { structure, updated_at: now() })
    },
    [db, now]
  )

  const renameProject = useCallback(
    async (id: number, name: string, description = ""): Promise<void> => {
      await db.projects.update(id, { name, description, updated_at: now() })
    },
    [db, now]
  )

  const setProjectTags = useCallback(
    async (id: number, tags: string): Promise<void> => {
      await db.projects.update(id, { tags, updated_at: now() })
    },
    [db, now]
  )

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    // Delete associated snapshots first
    await db.projectHistory.where("project_id").equals(id).delete()
    await db.projects.delete(id)
  }, [db])

  const reorderProjects = useCallback(
    async (orderedIds: number[]): Promise<void> => {
      await db.transaction("rw", db.projects, async () => {
        for (let i = 0; i < orderedIds.length; i++) {
          await db.projects.update(orderedIds[i], { sort_order: i })
        }
      })
    },
    [db]
  )

  const duplicateProject = useCallback(
    async (id: number): Promise<number | null> => {
      const original = await db.projects.get(id)
      if (!original) return null

      const count = await db.projects.count()
      const newId = await db.projects.add({
        name: `${original.name} (Copy)`,
        description: original.description,
        structure: original.structure,
        sort_order: count,
        tags: original.tags,
        created_at: now(),
        updated_at: now(),
      })
      return newId
    },
    [db, now]
  )

  // ── Snapshots ───────────────────────────────────────────────────

  const saveSnapshot = useCallback(
    async (projectId: number, structure: string, description = "Auto-save"): Promise<number> => {
      return db.projectHistory.add({
        project_id: projectId,
        structure,
        description,
        created_at: now(),
      })
    },
    [db, now]
  )

  const getSnapshots = useCallback(
    async (projectId: number): Promise<DexieSnapshot[]> => {
      const items = await db.projectHistory
        .where("project_id")
        .equals(projectId)
        .toArray()
      // Return newest-first (reverse chronological)
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    },
    [db]
  )

  const deleteSnapshot = useCallback(async (id: number): Promise<void> => {
    await db.projectHistory.delete(id)
  }, [db])

  // ── Bulk ────────────────────────────────────────────────────────

  const exportProject = useCallback(
    async (id: number): Promise<string | null> => {
      const project = await db.projects.get(id)
      if (!project) return null

      return JSON.stringify(
        {
          type: "proyect-ui-project",
          version: 1,
          exported_at: now(),
          project: {
            name: project.name,
            description: project.description,
            tags: project.tags,
            structure: project.structure,
          },
        },
        null,
        2
      )
    },
    [db, now]
  )

  const importProject = useCallback(
    async (jsonData: string): Promise<number | null> => {
      try {
        const parsed = JSON.parse(jsonData)

        if (parsed.type === "proyect-ui-project" && parsed.project) {
          const { name, description, tags, structure } = parsed.project
          return createProject(
            name || "Imported Project",
            structure || "",
            description || "",
            tags || ""
          )
        }

        if (parsed.type === "proyect-ui-collection" && Array.isArray(parsed.projects)) {
          let lastId: number | null = null
          for (const proj of parsed.projects) {
            lastId = await createProject(
              proj.name || "Imported Project",
              proj.structure || "",
              proj.description || "",
              proj.tags || ""
            )
          }
          return lastId
        }

        console.error("[useDexieDB] Invalid import format")
        return null
      } catch (err) {
        console.error("[useDexieDB] Failed to import project:", err)
        return null
      }
    },
    [createProject]
  )

  return {
    ready: state.ready,
    error: state.error,
    listProjects,
    getProject,
    createProject,
    updateProject,
    renameProject,
    setProjectTags,
    deleteProject,
    reorderProjects,
    duplicateProject,
    saveSnapshot,
    getSnapshots,
    deleteSnapshot,
    exportProject,
    importProject,
  }
}
