/**
 * DexieDB Implementation
 *
 * Replaces the raw IndexedDB fallback in db.ts with a Dexie.js-backed
 * implementation that follows the same DB interface.
 *
 * Dexie provides:
 * - Cleaner API with async/await
 * - Proper indexing for faster queries
 * - Transaction support
 * - Smaller code footprint (~90 lines vs ~300 lines)
 */

import Dexie, { type Table } from "dexie"
import type { DB, ProjectRecord, SnapshotRecord } from "./db"

// ── Dexie Database Class ──────────────────────────────────────────

/** Shared Dexie database class — reused by useDexieDB.ts and other consumers */
export class ProyectUIDB extends Dexie {
  projects!: Table<ProjectRecord, number>
  projectHistory!: Table<SnapshotRecord, number>

  constructor() {
    super("ProyectUIDB")

    this.version(1).stores({
      projects: "++id, name, sort_order, updated_at, tags",
      projectHistory: "++id, project_id, created_at",
    })
  }
}

let dexieInstance: ProyectUIDB | null = null

/**
 * Shared singleton getter for the Dexie database instance.
 * Used by both the DB layer (createDexieDB) and React hooks (useDexieDB).
 */
export function getDexieInstance(): ProyectUIDB {
  if (!dexieInstance) {
    dexieInstance = new ProyectUIDB()
  }
  return dexieInstance
}

// ── Factory ───────────────────────────────────────────────────────

/**
 * Creates a DB implementation backed by Dexie.js (IndexedDB).
 * This is used as the browser fallback when Tauri SQLite is not available.
 */
export async function createDexieDB(): Promise<DB> {
  const db = getDexieInstance()

  // Open the database (idempotent — Dexie reuses the open connection)
  await db.open()

  return {
    async init(): Promise<void> {
      // Database is opened in the constructor
    },

    // ── Projects ──────────────────────────────────────────────────

    async listProjects(): Promise<ProjectRecord[]> {
      return db.projects.orderBy("sort_order").toArray()
    },

    async getProject(id: number): Promise<ProjectRecord | null> {
      const record = await db.projects.get(id)
      return record || null
    },

    async createProject(
      name: string,
      description: string,
      structure: string,
      tags: string = ""
    ): Promise<number> {
      const count = await db.projects.count()
      const now = new Date().toISOString()
      const id = await db.projects.add({
        name,
        description,
        structure,
        sort_order: count,
        tags,
        created_at: now,
        updated_at: now,
      })
      return id
    },

    async updateProject(id: number, structure: string): Promise<void> {
      await db.projects.update(id, {
        structure,
        updated_at: new Date().toISOString(),
      })
    },

    async renameProject(
      id: number,
      name: string,
      description: string
    ): Promise<void> {
      await db.projects.update(id, {
        name,
        description,
        updated_at: new Date().toISOString(),
      })
    },

    async setProjectTags(id: number, tags: string): Promise<void> {
      await db.projects.update(id, {
        tags,
        updated_at: new Date().toISOString(),
      })
    },

    async deleteProject(id: number): Promise<void> {
      // Delete associated history first
      await db.projectHistory.where("project_id").equals(id).delete()
      await db.projects.delete(id)
    },

    async reorderProjects(orderedIds: number[]): Promise<void> {
      await db.transaction("rw", db.projects, async () => {
        for (let i = 0; i < orderedIds.length; i++) {
          await db.projects.update(orderedIds[i], { sort_order: i })
        }
      })
    },

    // ── Snapshots / History ───────────────────────────────────────

    async saveSnapshot(
      projectId: number,
      structure: string,
      description: string
    ): Promise<number> {
      return db.projectHistory.add({
        project_id: projectId,
        structure,
        description,
        created_at: new Date().toISOString(),
      })
    },

    async getSnapshots(projectId: number): Promise<SnapshotRecord[]> {
      const items = await db.projectHistory
        .where("project_id")
        .equals(projectId)
        .toArray()
      // Return newest-first
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    },

    async getSnapshot(id: number): Promise<SnapshotRecord | null> {
      const record = await db.projectHistory.get(id)
      return record || null
    },

    async deleteSnapshot(id: number): Promise<void> {
      await db.projectHistory.delete(id)
    },
  }
}
