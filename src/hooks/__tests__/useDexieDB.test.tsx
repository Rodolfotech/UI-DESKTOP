import { renderHook, act, waitFor } from "@testing-library/react"
import { useDexieDB } from "@/hooks/useDexieDB"
import type { DexieProject } from "@/hooks/useDexieDB"

// ── Mock Dexie and getDexieInstance ───────────────────────────────
// All jest.fn() calls must be INSIDE the jest.mock factory to avoid
// temporal dead zone issues (jest.mock is hoisted by SWC).

jest.mock("../../lib/dexie-db", () => {
  // Create fresh jest.fn() instances inside the factory
  const mocks = {
    mockToArray: jest.fn() as jest.Mock,
    mockGet: jest.fn() as jest.Mock,
    mockAdd: jest.fn() as jest.Mock,
    mockUpdate: jest.fn() as jest.Mock,
    mockDelete: jest.fn() as jest.Mock,
    mockCount: jest.fn() as jest.Mock,
    mockOrderBy: jest.fn() as jest.Mock,
    mockWhere: jest.fn() as jest.Mock,
    mockTransaction: jest.fn() as jest.Mock,
  }

  // Set up chainable mock for orderBy → toArray
  mocks.mockOrderBy.mockReturnValue({ toArray: mocks.mockToArray })

  // Set up chainable mock for where → equals → delete / toArray
  mocks.mockWhere.mockReturnValue({
    equals: jest.fn(() => ({
      delete: jest.fn().mockResolvedValue(undefined),
      toArray: mocks.mockToArray,
    })),
  })

  // Create table mock helper
  function createTableMock() {
    return {
      orderBy: mocks.mockOrderBy,
      get: mocks.mockGet,
      add: mocks.mockAdd,
      update: mocks.mockUpdate,
      delete: mocks.mockDelete,
      count: mocks.mockCount,
      where: mocks.mockWhere,
      // toArray is on the return of orderBy
    }
  }

  return {
    getDexieInstance: jest.fn(() => ({
      open: jest.fn().mockResolvedValue(undefined),
      projects: createTableMock(),
      projectHistory: createTableMock(),
      transaction: mocks.mockTransaction.mockImplementation(
        async (_rw: string, _table: unknown, callback: () => Promise<void>) => {
          await callback()
        }
      ),
    })),
    __mocks: mocks, // Export so tests can access the mock fns
  }
})

// Access the mocks via requireMock
const mockDexieModule = jest.requireMock("../../lib/dexie-db") as {
  getDexieInstance: jest.Mock
  __mocks: {
    mockToArray: jest.Mock
    mockGet: jest.Mock
    mockAdd: jest.Mock
    mockUpdate: jest.Mock
    mockDelete: jest.Mock
    mockCount: jest.Mock
    mockOrderBy: jest.Mock
    mockWhere: jest.Mock
    mockTransaction: jest.Mock
  }
}

const {
  mockToArray,
  mockGet,
  mockAdd,
  mockUpdate,
  mockDelete,
  mockCount,
  mockOrderBy,
  mockTransaction,
} = mockDexieModule.__mocks

// ── Helpers ────────────────────────────────────────────────────────

function createMockProject(overrides: Partial<DexieProject> = {}): DexieProject {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? "Test Project",
    description: overrides.description ?? "",
    structure: overrides.structure ?? "{}",
    sort_order: overrides.sort_order ?? 0,
    tags: overrides.tags ?? "",
    created_at: overrides.created_at ?? "2026-01-01T00:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-01-01T00:00:00.000Z",
  }
}

function createMockSnapshot(overrides: Partial<{
  id: number
  project_id: number
  structure: string
  description: string
  created_at: string
}> = {}) {
  return {
    id: overrides.id ?? 1,
    project_id: overrides.project_id ?? 1,
    structure: overrides.structure ?? "{}",
    description: overrides.description ?? "Auto-save",
    created_at: overrides.created_at ?? "2026-01-01T00:00:00.000Z",
  }
}

// ── Tests ──────────────────────────────────────────────────────────

describe("useDexieDB", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes with ready=false, then becomes ready after db.open resolves", async () => {
    const { result } = renderHook(() => useDexieDB())

    expect(result.current.ready).toBe(false)
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
    })
  })

  it("sets error when db.open fails", async () => {
    // Save the default factory implementation to restore after this test.
    // Using mockImplementation leaks to other tests because clearAllMocks
    // calls mockClear (preserves custom implementations).
    const defaultImpl = mockDexieModule.getDexieInstance.getMockImplementation()

    // Override getDexieInstance to return a failing db
    mockDexieModule.getDexieInstance.mockImplementation(() => ({
      open: jest.fn().mockRejectedValue(new Error("Failed to open database")),
      projects: {},
      projectHistory: {},
      transaction: jest.fn(),
    }))

    const { result } = renderHook(() => useDexieDB())

    // Wait for the async error handler to set the error
    await waitFor(() => {
      expect(result.current.error).toBe("Failed to open database")
    })

    // Restore the default implementation for subsequent tests
    mockDexieModule.getDexieInstance.mockImplementation(defaultImpl!)
  })

  describe("Projects CRUD", () => {
    it("listProjects returns ordered projects", async () => {
      mockToArray.mockResolvedValue([
        createMockProject({ id: 1, name: "First" }),
        createMockProject({ id: 2, name: "Second" }),
      ])

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const projects = await result.current.listProjects()

      expect(projects).toHaveLength(2)
      expect(projects[0].name).toBe("First")
      expect(mockOrderBy).toHaveBeenCalledWith("sort_order")
    })

    it("getProject returns a single project by id", async () => {
      mockGet.mockResolvedValue(createMockProject({ id: 5, name: "Specific" }))

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const project = await result.current.getProject(5)

      expect(project).toBeDefined()
      expect(project!.name).toBe("Specific")
      expect(mockGet).toHaveBeenCalledWith(5)
    })

    it("getProject returns undefined for non-existent id", async () => {
      mockGet.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const project = await result.current.getProject(999)

      expect(project).toBeUndefined()
    })

    it("createProject adds a project and returns its id", async () => {
      mockCount.mockResolvedValue(2)
      mockAdd.mockResolvedValue(3)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const id = await result.current.createProject("My Project", '{"name":"test"}', "Desc", "tag1")

      expect(id).toBe(3)
      expect(mockAdd).toHaveBeenCalled()
      const addArgs = mockAdd.mock.calls[0][0]
      expect(addArgs.name).toBe("My Project")
      expect(addArgs.sort_order).toBe(2)
    })

    it("updateProject updates structure and updated_at", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.updateProject(1, '{"new":"structure"}')

      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
        structure: '{"new":"structure"}',
      }))
    })

    it("renameProject updates name", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.renameProject(1, "New Name", "New desc")

      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
        name: "New Name",
        description: "New desc",
      }))
    })

    it("deleteProject deletes associated snapshots then the project", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.deleteProject(1)

      // Should have called .delete() for the project
      expect(mockDelete).toHaveBeenCalledWith(1)
    })

    it("duplicateProject creates a copy with (Copy) suffix", async () => {
      mockGet.mockResolvedValue(createMockProject({ id: 1, name: "Original" }))
      mockCount.mockResolvedValue(3)
      mockAdd.mockResolvedValue(4)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const newId = await result.current.duplicateProject(1)

      expect(newId).toBe(4)
      const addArgs = mockAdd.mock.calls[0][0]
      expect(addArgs.name).toBe("Original (Copy)")
    })

    it("duplicateProject returns null when original not found", async () => {
      mockGet.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const newId = await result.current.duplicateProject(999)

      expect(newId).toBeNull()
    })

    it("reorderProjects updates sort_order via transaction", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.reorderProjects([3, 1, 2])

      expect(mockTransaction).toHaveBeenCalled()
      expect(mockUpdate).toHaveBeenCalledWith(3, { sort_order: 0 })
      expect(mockUpdate).toHaveBeenCalledWith(1, { sort_order: 1 })
      expect(mockUpdate).toHaveBeenCalledWith(2, { sort_order: 2 })
    })
  })

  describe("Snapshots", () => {
    it("saveSnapshot adds a history entry", async () => {
      mockAdd.mockResolvedValue(5)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const snapshotId = await result.current.saveSnapshot(1, '{"snapshot":true}', "Manual save")

      expect(snapshotId).toBe(5)
      expect(mockAdd).toHaveBeenCalled()
      const addArgs = mockAdd.mock.calls[0][0]
      expect(addArgs.project_id).toBe(1)
      expect(addArgs.description).toBe("Manual save")
    })

    it("getSnapshots returns snapshots newest-first", async () => {
      mockToArray.mockResolvedValue([
        createMockSnapshot({ id: 1, created_at: "2026-01-01T01:00:00Z" }),
        createMockSnapshot({ id: 2, created_at: "2026-01-01T02:00:00Z" }),
      ])

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const snapshots = await result.current.getSnapshots(1)

      expect(snapshots).toHaveLength(2)
      expect(snapshots[0].id).toBe(2) // Newest first
      expect(snapshots[1].id).toBe(1) // Oldest second
    })

    it("deleteSnapshot removes a history entry", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.deleteSnapshot(3)

      expect(mockDelete).toHaveBeenCalledWith(3)
    })
  })

  describe("Import / Export", () => {
    it("exportProject returns JSON for existing project", async () => {
      mockGet.mockResolvedValue(createMockProject({
        id: 1,
        name: "Export Test",
        structure: '{"test":true}',
      }))

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const json = await result.current.exportProject(1)

      expect(json).not.toBeNull()
      const parsed = JSON.parse(json!)
      expect(parsed.type).toBe("proyect-ui-project")
      expect(parsed.project.name).toBe("Export Test")
    })

    it("exportProject returns null for missing project", async () => {
      mockGet.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const json = await result.current.exportProject(999)

      expect(json).toBeNull()
    })

    it("importProject imports a valid project JSON", async () => {
      mockCount.mockResolvedValue(0)
      mockAdd.mockResolvedValue(10)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const jsonData = JSON.stringify({
        type: "proyect-ui-project",
        version: 1,
        exported_at: "2026-01-01T00:00:00Z",
        project: {
          name: "Imported Design",
          description: "From backup",
          tags: "backup,design",
          structure: '{"main":"content"}',
        },
      })

      const id = await result.current.importProject(jsonData)

      expect(id).toBe(10)
      expect(mockAdd).toHaveBeenCalled()
      const addArgs = mockAdd.mock.calls[0][0]
      expect(addArgs.name).toBe("Imported Design")
    })

    it("importProject handles collection format", async () => {
      mockCount.mockResolvedValue(0)
      mockAdd
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(21)

      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const jsonData = JSON.stringify({
        type: "proyect-ui-collection",
        version: 1,
        projects: [
          { name: "First", structure: "{}" },
          { name: "Second", structure: "{}" },
        ],
      })

      const id = await result.current.importProject(jsonData)

      expect(id).toBe(21) // Last imported
      expect(mockAdd).toHaveBeenCalledTimes(2)
    })

    it("importProject returns null for invalid format", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const id = await result.current.importProject('{"type":"unknown"}')

      expect(id).toBeNull()
    })

    it("importProject returns null for malformed JSON", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      const id = await result.current.importProject("not json at all")

      expect(id).toBeNull()
    })
  })

  describe("setProjectTags", () => {
    it("updates tags on an existing project", async () => {
      const { result } = renderHook(() => useDexieDB())

      await waitFor(() => expect(result.current.ready).toBe(true))

      await result.current.setProjectTags(1, "design,ui,test")

      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
        tags: "design,ui,test",
      }))
    })
  })
})
