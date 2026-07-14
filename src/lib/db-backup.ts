/**
 * Database Backup & Restore
 *
 * Provides full export/import of the entire database (projects + snapshots)
 * as a single JSON file. This enables:
 *   - Portability between Ubuntu and Windows (Tauri contexts)
 *   - Manual backups before major changes
 *   - Transfer of all projects between environments
 *
 * Format:
 * {
 *   type: "proyect-ui-backup",
 *   version: 1,
 *   exported_at: "2024-01-01T00:00:00.000Z",
 *   source: "tauri-sqlite" | "dexie-indexeddb",
 *   projects: [ ... ],
 *   project_history: [ ... ]
 * }
 */

import { getDB, type ProjectRecord, type SnapshotRecord } from "./db"

// ── Types ──────────────────────────────────────────────────────────

export interface BackupHeader {
  type: "proyect-ui-backup"
  version: number
  exported_at: string
  source: string
}

/** Project entry in backup — includes original_id for snapshot mapping */
export interface BackupProject {
  original_id: number
  name: string
  description: string
  structure: string
  sort_order: number
  tags: string
  created_at: string
  updated_at: string
}

export interface FullBackup extends BackupHeader {
  projects: BackupProject[]
  project_history: Array<Omit<SnapshotRecord, "id">>
}

export interface BackupResult {
  success: boolean
  message: string
  projectCount?: number
  snapshotCount?: number
}

// ── Export ─────────────────────────────────────────────────────────

/**
 * Export the entire database as a downloadable JSON string.
 * Includes all projects and their history snapshots.
 */
export async function exportFullBackup(): Promise<string | null> {
  try {
    const db = await getDB()

    const projects = await db.listProjects()
    const allHistory: SnapshotRecord[] = []

    // Collect snapshots for all projects
    for (const project of projects) {
      const snapshots = await db.getSnapshots(project.id!)
      allHistory.push(...snapshots)
    }

    const backup: FullBackup = {
      type: "proyect-ui-backup",
      version: 1,
      exported_at: new Date().toISOString(),
      source: typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
        ? "tauri-sqlite"
        : "dexie-indexeddb",
      projects: projects.map((p) => ({
        original_id: p.id!,
        name: p.name,
        description: p.description,
        structure: p.structure,
        sort_order: p.sort_order,
        tags: p.tags,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      project_history: allHistory.map((s) => ({
        project_id: s.project_id,
        structure: s.structure,
        description: s.description,
        created_at: s.created_at,
      })),
    }

    return JSON.stringify(backup, null, 2)
  } catch (err) {
    console.error("[DBBackup] Export failed:", err)
    return null
  }
}

/**
 * Trigger a browser download of the backup file.
 */
export async function downloadBackup(): Promise<void> {
  const json = await exportFullBackup()
  if (!json) {
    console.error("[DBBackup] Nothing to download — export returned null")
    return
  }

  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  a.href = url
  a.download = `proyect-ui-backup-${timestamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Import ─────────────────────────────────────────────────────────

/**
 * Import a full backup JSON string, restoring all projects and their history.
 *
 * This is a full restore — existing data is NOT deleted first.
 * Projects are created fresh with new IDs, preserving the original names
 * and structure. The timestamps from the backup are preserved.
 *
 * @returns BackupResult with count of imported projects/snapshots
 */
export async function importFullBackup(jsonString: string): Promise<BackupResult> {
  try {
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonString)
    } catch {
      return { success: false, message: "Invalid JSON format" }
    }

    const backup = parsed as FullBackup

    // Validate backup format
    if (backup.type !== "proyect-ui-backup") {
      return {
        success: false,
        message: "Not a valid Proyect-UI backup file (missing type field)",
      }
    }

    if (!Array.isArray(backup.projects)) {
      return {
        success: false,
        message: "Invalid backup format: missing projects array",
      }
    }

    const db = await getDB()
    let projectCount = 0
    let snapshotCount = 0

    // Store original_id → new project ID mapping
    const idMap = new Map<number, number>()

    // Import projects
    for (const project of backup.projects) {
      const newId = await db.createProject(
        project.name,
        project.description,
        project.structure,
        project.tags
      )
      idMap.set(project.original_id, newId)
      projectCount++
    }

    // Import project history (snapshots)
    if (Array.isArray(backup.project_history) && backup.project_history.length > 0) {
      for (const snapshot of backup.project_history) {
        // Map the old project_id to new project_id
        const newProjectId = idMap.get(snapshot.project_id)
        if (newProjectId) {
          await db.saveSnapshot(
            newProjectId,
            snapshot.structure,
            snapshot.description
          )
          snapshotCount++
        }
      }
    }

    return {
      success: true,
      message: `Restored ${projectCount} project(s) and ${snapshotCount} snapshot(s)`,
      projectCount,
      snapshotCount,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error during import"
    console.error("[DBBackup] Import failed:", err)
    return { success: false, message: msg }
  }
}

/**
 * Read a File object (from an <input type="file">) and return its
 * text content. Useful for the BackupModal file picker.
 */
export function readBackupFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
