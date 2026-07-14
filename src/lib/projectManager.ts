/**
 * Project Manager for Proyect-UI
 *
 * Higher-level CRUD operations for managing visual editor projects.
 * Uses the database layer (db.ts) for persistence.
 */

import { getDB, type ProjectRecord, type SnapshotRecord } from './db'

export interface ProjectSummary {
  id: number
  name: string
  description: string
  sort_order: number
  tags: string
  updated_at: string
  created_at: string
}

export interface Project {
  id: number
  name: string
  description: string
  structure: string
  sort_order: number
  tags: string
  updated_at: string
  created_at: string
}

export interface ProjectSnapshot {
  id: number
  project_id: number
  structure: string
  description: string
  created_at: string
}

const DEFAULT_PROJECT_NAME = 'Untitled Design'
const AUTO_SAVE_KEY = 'proyect-ui-current-project-id'

/**
 * Get the ID of the currently active project from session storage.
 */
function getCurrentProjectId(): number | null {
  if (typeof window === 'undefined') return null
  const id = sessionStorage.getItem(AUTO_SAVE_KEY)
  return id ? parseInt(id, 10) : null
}

/**
 * Store the current project ID in session storage.
 */
function setCurrentProjectId(id: number): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(AUTO_SAVE_KEY, String(id))
  }
}

/**
 * Clear the current project ID from session storage.
 */
function clearCurrentProjectId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTO_SAVE_KEY)
  }
}

/**
 * List all saved projects, ordered by most recently updated.
 */
export async function listProjects(): Promise<ProjectSummary[]> {
  try {
    const db = await getDB()
    const records = await db.listProjects()
    return records.map((r: ProjectRecord) => ({
      id: r.id!,
      name: r.name,
      description: r.description,
      sort_order: r.sort_order ?? 0,
      tags: r.tags ?? '',
      updated_at: r.updated_at,
      created_at: r.created_at,
    }))
  } catch (error) {
    console.error('[ProjectManager] Failed to list projects:', error)
    return []
  }
}

/**
 * Get a project by its ID, including the full structure JSON.
 */
export async function getProject(id: number): Promise<Project | null> {
  try {
    const db = await getDB()
    const record = await db.getProject(id)
    if (!record) return null
    return {
      id: record.id!,
      name: record.name,
      description: record.description,
      structure: record.structure,
      sort_order: record.sort_order ?? 0,
      tags: record.tags ?? '',
      updated_at: record.updated_at,
      created_at: record.created_at,
    }
  } catch (error) {
    console.error(`[ProjectManager] Failed to get project ${id}:`, error)
    return null
  }
}

/**
 * Create a new project with the given name and structure.
 * Returns the new project's ID.
 * If no name is provided, uses "Untitled Design".
 */
export async function createProject(
  structure: string,
  name?: string,
  description?: string,
  tags?: string
): Promise<number | null> {
  try {
    const db = await getDB()
    const id = await db.createProject(
      name || DEFAULT_PROJECT_NAME,
      description || '',
      structure,
      tags || ''
    )
    setCurrentProjectId(id)
    return id
  } catch (error) {
    console.error('[ProjectManager] Failed to create project:', error)
    return null
  }
}

/**
 * Save the current state of a project.
 * Updates the structure JSON and updated_at timestamp.
 */
export async function saveProject(id: number, structure: string): Promise<boolean> {
  try {
    const db = await getDB()
    await db.updateProject(id, structure)
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to save project ${id}:`, error)
    return false
  }
}

/**
 * Rename a project and/or update its description.
 */
export async function renameProject(
  id: number,
  name: string,
  description?: string
): Promise<boolean> {
  try {
    const db = await getDB()
    await db.renameProject(id, name, description || '')
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to rename project ${id}:`, error)
    return false
  }
}

/**
 * Reorder projects by setting their sort_order based on the ordered list of IDs.
 */
export async function reorderProjects(orderedIds: number[]): Promise<boolean> {
  try {
    const db = await getDB()
    await db.reorderProjects(orderedIds)
    return true
  } catch (error) {
    console.error('[ProjectManager] Failed to reorder projects:', error)
    return false
  }
}

/**
 * Duplicate a project by its ID, appending "(Copy)" to the name.
 * Returns the new project's ID.
 */
export async function duplicateProject(id: number): Promise<number | null> {
  try {
    const original = await getProject(id)
    if (!original) {
      console.error(`[ProjectManager] Cannot duplicate: project ${id} not found`)
      return null
    }

    const newId = await createProject(
      original.structure,
      `${original.name} (Copy)`,
      original.description
    )
    return newId
  } catch (error) {
    console.error(`[ProjectManager] Failed to duplicate project ${id}:`, error)
    return null
  }
}

/**
 * Delete a project by its ID.
 */
export async function deleteProject(id: number): Promise<boolean> {
  try {
    const db = await getDB()
    await db.deleteProject(id)

    const currentId = getCurrentProjectId()
    if (currentId === id) {
      clearCurrentProjectId()
    }
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to delete project ${id}:`, error)
    return false
  }
}

/**
 * Get the currently active project (from session).
 * Returns null if no project is active.
 */
export async function getCurrentProject(): Promise<Project | null> {
  const id = getCurrentProjectId()
  if (!id) return null
  return getProject(id)
}

/**
 * Set a project's tags.
 */
export async function setProjectTags(id: number, tags: string[]): Promise<boolean> {
  try {
    const db = await getDB()
    await db.setProjectTags(id, tags.join(','))
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to set tags for project ${id}:`, error)
    return false
  }
}

/**
 * Export a project as a JSON string for download.
 */
export async function exportProject(id: number): Promise<string | null> {
  try {
    const project = await getProject(id)
    if (!project) return null
    return JSON.stringify({
      type: 'proyect-ui-project',
      version: 1,
      exported_at: new Date().toISOString(),
      project: {
        name: project.name,
        description: project.description,
        tags: project.tags,
        structure: project.structure,
      },
    }, null, 2)
  } catch (error) {
    console.error(`[ProjectManager] Failed to export project ${id}:`, error)
    return null
  }
}

/**
 * Export all projects as a JSON string for download/bulk export.
 */
export async function exportAllProjects(): Promise<string | null> {
  try {
    const projects = await listProjects()
    const fullProjects = await Promise.all(
      projects.map((p) => getProject(p.id))
    )
    const validProjects = fullProjects.filter((p): p is Project => p !== null)

    return JSON.stringify({
      type: 'proyect-ui-collection',
      version: 1,
      exported_at: new Date().toISOString(),
      projects: validProjects.map((p) => ({
        name: p.name,
        description: p.description,
        tags: p.tags,
        structure: p.structure,
      })),
    }, null, 2)
  } catch (error) {
    console.error('[ProjectManager] Failed to export all projects:', error)
    return null
  }
}

/**
 * Import a project from JSON data.
 */
export async function importProject(jsonData: string): Promise<number | null> {
  try {
    const parsed = JSON.parse(jsonData)

    // Validate format
    if (parsed.type === 'proyect-ui-project' && parsed.project) {
      const { name, description, tags, structure } = parsed.project
      return createProject(structure || '', name || 'Imported Project', description || '', tags || '')
    }

    if (parsed.type === 'proyect-ui-collection' && Array.isArray(parsed.projects)) {
      // Import all projects in collection, return the last one's ID
      let lastId: number | null = null
      for (const proj of parsed.projects) {
        lastId = await createProject(
          proj.structure || '',
          proj.name || 'Imported Project',
          proj.description || '',
          proj.tags || ''
        )
      }
      return lastId
    }

    console.error('[ProjectManager] Invalid import format')
    return null
  } catch (error) {
    console.error('[ProjectManager] Failed to import project:', error)
    return null
  }
}

/**
 * Save a snapshot of a project's current state to history.
 */
export async function saveProjectSnapshot(projectId: number, description: string = 'Manual save'): Promise<number | null> {
  try {
    const project = await getProject(projectId)
    if (!project) return null

    const db = await getDB()
    const id = await db.saveSnapshot(projectId, project.structure, description)
    return id
  } catch (error) {
    console.error(`[ProjectManager] Failed to save snapshot for project ${projectId}:`, error)
    return null
  }
}

/**
 * Get the history (snapshots) for a project.
 */
export async function getProjectHistory(projectId: number): Promise<ProjectSnapshot[]> {
  try {
    const db = await getDB()
    const records = await db.getSnapshots(projectId)
    return records.map((r: SnapshotRecord) => ({
      id: r.id!,
      project_id: r.project_id,
      structure: r.structure,
      description: r.description,
      created_at: r.created_at,
    }))
  } catch (error) {
    console.error(`[ProjectManager] Failed to get history for project ${projectId}:`, error)
    return []
  }
}

/**
 * Restore a project to a previous snapshot.
 */
export async function restoreProjectSnapshot(projectId: number, snapshotId: number): Promise<boolean> {
  try {
    const db = await getDB()
    const snapshot = await db.getSnapshot(snapshotId)
    if (!snapshot || snapshot.project_id !== projectId) {
      console.error(`[ProjectManager] Snapshot ${snapshotId} not found or doesn't match project ${projectId}`)
      return false
    }

    await db.updateProject(projectId, snapshot.structure)
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to restore snapshot ${snapshotId} for project ${projectId}:`, error)
    return false
  }
}

/**
 * Delete a project snapshot.
 */
export async function deleteProjectSnapshot(snapshotId: number): Promise<boolean> {
  try {
    const db = await getDB()
    await db.deleteSnapshot(snapshotId)
    return true
  } catch (error) {
    console.error(`[ProjectManager] Failed to delete snapshot ${snapshotId}:`, error)
    return false
  }
}

/**
 * Save a snapshot of the current editor state with auto-generated description.
 * This is called automatically when significant changes are detected.
 */
export async function autoSaveSnapshot(projectId: number, structure: string): Promise<void> {
  try {
    const db = await getDB()
    const snapshots = await db.getSnapshots(projectId)

    // Only auto-save if the structure changed from the last snapshot
    if (snapshots.length > 0 && snapshots[0].structure === structure) return

    const description = `Auto-save #${snapshots.length + 1}`
    await db.saveSnapshot(projectId, structure, description)

    // Keep only last 50 auto-snapshots to prevent unlimited growth
    if (snapshots.length >= 50) {
      const toDelete = snapshots.slice(49)
      for (const snap of toDelete) {
        await db.deleteSnapshot(snap.id!)
      }
    }
  } catch (error) {
    // Silently fail for auto-save
    console.debug('[ProjectManager] Auto-save snapshot failed:', error)
  }
}

/**
 * Set a project as the currently active one.
 */
export function setActiveProject(id: number): void {
  setCurrentProjectId(id)
}

/**
 * Seed the database with a default project if no projects exist.
 * Useful on first launch.
 */
export async function ensureDefaultProject(structure: string): Promise<number> {
  try {
    const projects = await listProjects()
    if (projects.length > 0) {
      // Re-activate the most recent project
      setActiveProject(projects[0].id)
      return projects[0].id
    }

    // No projects exist, create a default one
    const id = await createProject(
      structure,
      'My First Design',
      'A new project created automatically.'
    )
    return id ?? -1
  } catch (error) {
    console.error('[ProjectManager] Failed to ensure default project:', error)
    return -1
  }
}
