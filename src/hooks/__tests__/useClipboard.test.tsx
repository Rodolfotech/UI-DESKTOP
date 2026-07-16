import { renderHook, act } from "@testing-library/react"
import { useClipboard } from "@/hooks/useClipboard"

// ── Mocks ──────────────────────────────────────────────────────────

jest.mock("@craftjs/core", () => ({
  useEditor: jest.fn(),
}))

const mockUseEditor = jest.requireMock("@craftjs/core").useEditor as jest.Mock

// Shared mock instances
let mockActions: { add: jest.Mock; addNodeTree: jest.Mock }
let mockQuery: {
  getState: jest.Mock
  node: jest.Mock
  serialize: jest.Mock
  parseReactElement: jest.Mock
}

function setupEditorMocks(selectedId: string | null = "node-1") {
  mockActions = {
    add: jest.fn(),
    addNodeTree: jest.fn(),
  }

  const mockNode = {
    get: jest.fn(() => ({
      data: {
        type: "Button",
        parent: "ROOT",
        props: { text: "Click", style: "primary" },
        nodes: [],
        linkedNodes: {},
        custom: {},
        hidden: false,
        displayName: "Button",
        is: undefined,
        canvas: undefined,
      },
    })),
  }

  mockQuery = {
    getState: jest.fn(() => ({
      events: {
        selected: new Set(selectedId ? [selectedId] : []),
      },
    })),
    node: jest.fn(() => mockNode),
    serialize: jest.fn(() => JSON.stringify({
      "node-1": {
        type: { resolvedName: "ButtonNode" },
        props: { text: "Click", style: "primary" },
        parent: "ROOT",
        nodes: [],
      },
    })),
    parseReactElement: jest.fn(() => ({
      toNodeTree: jest.fn(() => ({ rootNodeId: "new-node", nodes: {} })),
    })),
  }

  mockUseEditor.mockReturnValue({
    actions: mockActions,
    query: mockQuery,
  })
}

// ── Tests ──────────────────────────────────────────────────────────

describe("useClipboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupEditorMocks("node-1")
  })

  it("starts with no feedback", () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.feedback).toEqual({ type: null })
  })

  describe("copySelected", () => {
    it("copies when a node is selected", () => {
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.copySelected()
      })

      expect(result.current.feedback).toEqual({ type: "copied", name: "Button" })
    })

    it("does nothing when no node is selected", () => {
      setupEditorMocks(null) // No selection
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.copySelected()
      })

      expect(result.current.feedback).toEqual({ type: null })
    })

    it("does nothing when selected is ROOT", () => {
      setupEditorMocks("ROOT")
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.copySelected()
      })

      expect(result.current.feedback).toEqual({ type: null })
    })
  })

  describe("pasteCopied", () => {
    it("pastes using add() when clipboard data exists", () => {
      const { result } = renderHook(() => useClipboard())
      mockActions.add.mockReturnValue("new-node-1")

      // First copy
      act(() => {
        result.current.copySelected()
      })
      expect(result.current.feedback).toEqual({ type: "copied", name: "Button" })

      // Then paste
      act(() => {
        result.current.pasteCopied()
      })

      expect(mockActions.add).toHaveBeenCalledWith("node-1", "ROOT")
      expect(result.current.feedback).toEqual({ type: "pasted", name: "Button" })
    })

    it("falls back to parseReactElement when add() returns falsy", () => {
      const { result } = renderHook(() => useClipboard())
      mockActions.add.mockReturnValue(undefined)

      // First copy
      act(() => {
        result.current.copySelected()
      })

      // Then paste — add() returned falsy, so falls back to RESOLVER path
      // which uses parseReactElement + addNodeTree
      act(() => {
        result.current.pasteCopied()
      })

      // The RESOLVER path succeeded by creating the element via React.createElement
      // and adding the node tree
      expect(mockQuery.parseReactElement).toHaveBeenCalled()
      expect(mockActions.addNodeTree).toHaveBeenCalled()
      expect(result.current.feedback).toEqual({ type: "pasted", name: "Button" })
    })

    it("does nothing when clipboard is empty", () => {
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.pasteCopied()
      })

      expect(mockActions.add).not.toHaveBeenCalled()
      expect(result.current.feedback).toEqual({ type: null })
    })
  })

  describe("duplicateSelected", () => {
    it("duplicates the selected node", () => {
      const { result } = renderHook(() => useClipboard())
      mockActions.add.mockReturnValue("new-node-1")

      act(() => {
        result.current.duplicateSelected()
      })

      expect(mockActions.add).toHaveBeenCalledWith("node-1", "ROOT")
      expect(result.current.feedback).toEqual({ type: "duplicated", name: "Button" })
    })

    it("does nothing when no node selected", () => {
      setupEditorMocks(null)
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.duplicateSelected()
      })

      expect(mockActions.add).not.toHaveBeenCalled()
    })
  })

  describe("clearFeedback", () => {
    it("resets feedback to null", () => {
      const { result } = renderHook(() => useClipboard())

      act(() => {
        result.current.copySelected()
      })
      expect(result.current.feedback).toEqual({ type: "copied", name: "Button" })

      act(() => {
        result.current.clearFeedback()
      })
      expect(result.current.feedback).toEqual({ type: null })
    })
  })

  describe("keyboard shortcuts", () => {
    function dispatchKey(key: string, ctrl = true) {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          ctrlKey: ctrl,
          metaKey: !ctrl,
          bubbles: true,
        })
      )
    }

    it("Ctrl+C triggers copy when a node is selected", () => {
      const { result } = renderHook(() => useClipboard())

      act(() => {
        dispatchKey("c")
      })

      expect(result.current.feedback).toEqual({ type: "copied", name: "Button" })
    })

    it("Ctrl+V triggers paste", () => {
      const { result } = renderHook(() => useClipboard())
      mockActions.add.mockReturnValue("new-node-1")

      // Copy first
      act(() => {
        result.current.copySelected()
      })

      // Then keyboard paste
      act(() => {
        dispatchKey("v")
      })

      expect(mockActions.add).toHaveBeenCalledWith("node-1", "ROOT")
      expect(result.current.feedback).toEqual({ type: "pasted", name: "Button" })
    })

    it("Ctrl+D triggers duplicate", () => {
      const { result } = renderHook(() => useClipboard())
      mockActions.add.mockReturnValue("new-node-1")

      act(() => {
        dispatchKey("d")
      })

      expect(mockActions.add).toHaveBeenCalledWith("node-1", "ROOT")
      expect(result.current.feedback).toEqual({ type: "duplicated", name: "Button" })
    })

    it("ignores shortcuts when focus is in input elements", () => {
      const input = document.createElement("input")
      document.body.appendChild(input)
      input.focus()

      const { result } = renderHook(() => useClipboard())

      act(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "c",
            ctrlKey: true,
            bubbles: true,
          })
        )
      })

      expect(result.current.feedback).toEqual({ type: null })

      document.body.removeChild(input)
    })
  })
})
