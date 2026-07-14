/**
 * Database Wrapper for Proyect-UI
 *
 * Uses Tauri SQLite plugin when running as a desktop app.
 * Falls back to IndexedDB (via a simple wrapper) during browser development.
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface ProjectRecord {
  id?: number
  name: string
  description: string
  structure: string // JSON string of Craft.js state
  sort_order: number // For drag-and-drop reordering
  tags: string // Comma-separated tags
  created_at: string
  updated_at: string
}

export interface SnapshotRecord {
  id?: number
  project_id: number
  structure: string
  description: string
  created_at: string
}

export interface DB {
  init(): Promise<void>
  listProjects(): Promise<ProjectRecord[]>
  getProject(id: number): Promise<ProjectRecord | null>
  createProject(name: string, description: string, structure: string, tags?: string): Promise<number>
  updateProject(id: number, structure: string): Promise<void>
  renameProject(id: number, name: string, description: string): Promise<void>
  setProjectTags(id: number, tags: string): Promise<void>
  deleteProject(id: number): Promise<void>
  reorderProjects(orderedIds: number[]): Promise<void>
  // Snapshots / History
  saveSnapshot(projectId: number, structure: string, description: string): Promise<number>
  getSnapshots(projectId: number): Promise<SnapshotRecord[]>
  getSnapshot(id: number): Promise<SnapshotRecord | null>
  deleteSnapshot(id: number): Promise<void>
}

// ── Platform Detection ─────────────────────────────────────────────────

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// ── Tauri SQLite Implementation ────────────────────────────────────────

async function createTauriDB(): Promise<DB> {
  const { default: Database } = await import('@tauri-apps/plugin-sql')

  const db = await Database.load('sqlite:proyect-ui.db')

  // Create tables if they don't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      structure TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      tags TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      structure TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

  return {
    async init() {
      // Table already created in constructor
    },

    async listProjects(): Promise<ProjectRecord[]> {
      return db.select<ProjectRecord[]>(
        'SELECT * FROM projects ORDER BY sort_order ASC, updated_at DESC'
      )
    },

    async getProject(id: number): Promise<ProjectRecord | null> {
      const results = await db.select<ProjectRecord[]>(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      )
      return results[0] || null
    },

    async createProject(name: string, description: string, structure: string, tags: string = ''): Promise<number> {
      // Get the max sort_order to place new project at the end
      const maxResult = await db.select<[{ max_order: number | null }]>(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as max_order FROM projects'
      )
      const nextOrder = maxResult[0]?.max_order ?? 1

      const result = await db.execute(
        'INSERT INTO projects (name, description, structure, sort_order, tags) VALUES ($1, $2, $3, $4, $5)',
        [name, description, structure, nextOrder, tags]
      )
      return result.lastInsertId as number
    },

    async updateProject(id: number, structure: string): Promise<void> {
      await db.execute(
        "UPDATE projects SET structure = $1, updated_at = datetime('now') WHERE id = $2",
        [structure, id]
      )
    },

    async renameProject(id: number, name: string, description: string): Promise<void> {
      await db.execute(
        "UPDATE projects SET name = $1, description = $2, updated_at = datetime('now') WHERE id = $3",
        [name, description, id]
      )
    },

    async setProjectTags(id: number, tags: string): Promise<void> {
      await db.execute(
        "UPDATE projects SET tags = $1, updated_at = datetime('now') WHERE id = $2",
        [tags, id]
      )
    },

    async deleteProject(id: number): Promise<void> {
      // Delete history first (foreign key might enforce cascade)
      await db.execute('DELETE FROM project_history WHERE project_id = $1', [id])
      await db.execute('DELETE FROM projects WHERE id = $1', [id])
    },

    async reorderProjects(orderedIds: number[]): Promise<void> {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.execute(
          'UPDATE projects SET sort_order = $1 WHERE id = $2',
          [i, orderedIds[i]]
        )
      }
    },

    // ── Snapshots / History ───────────────────────────────────────────

    async saveSnapshot(projectId: number, structure: string, description: string): Promise<number> {
      const result = await db.execute(
        "INSERT INTO project_history (project_id, structure, description) VALUES ($1, $2, $3)",
        [projectId, structure, description]
      )
      return result.lastInsertId as number
    },

    async getSnapshots(projectId: number): Promise<SnapshotRecord[]> {
      return db.select<SnapshotRecord[]>(
        'SELECT * FROM project_history WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      )
    },

    async getSnapshot(id: number): Promise<SnapshotRecord | null> {
      const results = await db.select<SnapshotRecord[]>(
        'SELECT * FROM project_history WHERE id = $1',
        [id]
      )
      return results[0] || null
    },

    async deleteSnapshot(id: number): Promise<void> {
      await db.execute('DELETE FROM project_history WHERE id = $1', [id])
    },
  }
}

// ── IndexedDB Fallback (via Dexie.js) ─────────────────────────────────

/** Helper: lazily import dexie-db and initialize the singleton */
async function ensureDexieDB(): Promise<DB> {
  const { createDexieDB } = await import("./dexie-db")
  return createDexieDB()
}

function createIndexedDB(): DB {
  let instance: DB | null = null

  async function dexie(): Promise<DB> {
    if (!instance) instance = await ensureDexieDB()
    return instance
  }

  return {
    init: () => dexie().then(() => {}),
    listProjects: () => dexie().then((db) => db.listProjects()),
    getProject: (id) => dexie().then((db) => db.getProject(id)),
    createProject: (name, description, structure, tags) =>
      dexie().then((db) => db.createProject(name, description, structure, tags)),
    updateProject: (id, structure) =>
      dexie().then((db) => db.updateProject(id, structure)),
    renameProject: (id, name, description) =>
      dexie().then((db) => db.renameProject(id, name, description)),
    setProjectTags: (id, tags) =>
      dexie().then((db) => db.setProjectTags(id, tags)),
    deleteProject: (id) => dexie().then((db) => db.deleteProject(id)),
    reorderProjects: (orderedIds) =>
      dexie().then((db) => db.reorderProjects(orderedIds)),
    saveSnapshot: (projectId, structure, description) =>
      dexie().then((db) => db.saveSnapshot(projectId, structure, description)),
    getSnapshots: (projectId) =>
      dexie().then((db) => db.getSnapshots(projectId)),
    getSnapshot: (id) => dexie().then((db) => db.getSnapshot(id)),
    deleteSnapshot: (id) => dexie().then((db) => db.deleteSnapshot(id)),
  }
}

// ── Singleton ──────────────────────────────────────────────────────────

let dbInstance: DB | null = null

export async function getDB(): Promise<DB> {
  if (dbInstance) return dbInstance

  dbInstance = isTauri() ? await createTauriDB() : createIndexedDB()
  await dbInstance.init()
  return dbInstance
}
