import { renderHook, act, waitFor } from "@testing-library/react"
import { useProjectName } from "@/hooks/useProjectName"

// ── Mocks ──────────────────────────────────────────────────────────
// Use relative path to avoid module resolution issues with jest.mock + next/jest
jest.mock("../../lib/projectManager", () => ({
  getCurrentProject: jest.fn(),
  renameProject: jest.fn(),
}))

const mockProjectManager = jest.requireMock("../../lib/projectManager") as {
  getCurrentProject: jest.Mock
  renameProject: jest.Mock
}

// ── Helpers ────────────────────────────────────────────────────────

function createMockProject(overrides: Partial<{ id: number; name: string }> = {}) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? "My Design",
    description: "",
    structure: "{}",
    sort_order: 0,
    tags: "",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }
}

// ── Tests ──────────────────────────────────────────────────────────

describe("useProjectName", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("starts with loading=true and default name", () => {
    // Keep the promise pending so loading stays true
    mockProjectManager.getCurrentProject.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useProjectName())

    expect(result.current.loading).toBe(true)
    expect(result.current.projectName).toBe("Untitled Design")
  })

  it("fetches project name on mount and sets it", async () => {
    mockProjectManager.getCurrentProject.mockResolvedValue(createMockProject({ name: "My Design" }))

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projectName).toBe("My Design")
    expect(mockProjectManager.getCurrentProject).toHaveBeenCalledTimes(1)
  })

  it("falls back to Untitled Design when no project exists", async () => {
    mockProjectManager.getCurrentProject.mockResolvedValue(null)

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projectName).toBe("Untitled Design")
  })

  it("falls back to Untitled Design on fetch error", async () => {
    mockProjectManager.getCurrentProject.mockRejectedValue(new Error("DB error"))

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projectName).toBe("Untitled Design")
  })

  it("updates the name via updateName", async () => {
    const mockProject = createMockProject({ name: "Old Name" })
    mockProjectManager.getCurrentProject.mockResolvedValue(mockProject)
    mockProjectManager.renameProject.mockResolvedValue(true)

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateName("New Name")
    })

    expect(mockProjectManager.renameProject).toHaveBeenCalledWith(1, "New Name")
    expect(result.current.projectName).toBe("New Name")
  })

  it("does not update name if no project is active", async () => {
    mockProjectManager.getCurrentProject.mockResolvedValue(null)

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateName("New Name")
    })

    expect(mockProjectManager.renameProject).not.toHaveBeenCalled()
    expect(result.current.projectName).toBe("Untitled Design")
  })

  it("re-fetches project name on window focus", async () => {
    mockProjectManager.getCurrentProject
      .mockResolvedValueOnce(createMockProject({ name: "First" }))
      .mockResolvedValueOnce(createMockProject({ name: "After Focus" }))

    const { result } = renderHook(() => useProjectName())

    await waitFor(() => {
      expect(result.current.projectName).toBe("First")
    })

    // Simulate window focus
    await act(async () => {
      window.dispatchEvent(new Event("focus"))
    })

    await waitFor(() => {
      expect(result.current.projectName).toBe("After Focus")
    })

    expect(mockProjectManager.getCurrentProject).toHaveBeenCalledTimes(2)
  })

  it("cleanup removes the focus listener on unmount", () => {
    const addSpy = jest.spyOn(window, "addEventListener")
    const removeSpy = jest.spyOn(window, "removeEventListener")

    const { unmount } = renderHook(() => useProjectName())

    expect(addSpy).toHaveBeenCalledWith("focus", expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith("focus", expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
