import { renderHook, act } from "@testing-library/react"
import { useSmartGuides } from "@/hooks/useSmartGuides"

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Create a real DOM container with child elements that have the expected
 * selector pattern. By appending to document.body, the built-in DOM methods
 * (getBoundingClientRect, querySelectorAll) work naturally.
 */
/**
 * Create a real DOM container with child elements that have the expected
 * selector pattern. Uses real DOM nodes for querySelectorAll, but overrides
 * getBoundingClientRect with controlled values (jsdom returns {0,0} for all
 * positioned elements since it doesn't compute CSS layout).
 */
function setupDOM(
  children: Array<{ top: number; left: number; width: number; height: number }> = []
) {
  const container = document.createElement("div")

  // Add the craftjs-renderer frame
  const frame = document.createElement("div")
  frame.className = "craftjs-renderer"
  container.appendChild(frame)

  // Add child elements inside the frame
  children.forEach((child) => {
    const el = document.createElement("div")
    el.className = "craftjs-component"
    frame.appendChild(el)
    // Override getBoundingClientRect with controlled values
    el.getBoundingClientRect = jest.fn(() => ({
      x: child.left,
      y: child.top,
      width: child.width,
      height: child.height,
      top: child.top,
      right: child.left + child.width,
      bottom: child.top + child.height,
      left: child.left,
      toJSON: () => ({}),
    })) as unknown as () => DOMRect
  })

  document.body.appendChild(container)

  // Container's getBoundingClientRect represents the origin
  container.getBoundingClientRect = jest.fn(() => ({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    top: 0,
    right: 500,
    bottom: 500,
    left: 0,
    toJSON: () => ({}),
  })) as unknown as () => DOMRect

  return container
}

/**
 * Create a DOMRect representing the dragged node's position.
 * Uses a static object instead of real DOM since jsdom doesn't
 * compute CSS layout positions.
 */
function createDragRect(
  top: number,
  left: number,
  width: number,
  height: number
): DOMRect {
  return {
    x: left,
    y: top,
    width,
    height,
    top,
    right: left + width,
    bottom: top + height,
    left,
    toJSON: () => ({}),
  } as DOMRect
}

// ── Tests ──────────────────────────────────────────────────────────

describe("useSmartGuides", () => {
  afterEach(() => {
    // Clean up all added DOM elements
    document.body.querySelectorAll("div").forEach((el) => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el)
      }
    })
  })

  it("returns empty guides and no snap initially", () => {
    const { result } = renderHook(() => useSmartGuides())

    expect(result.current.guides).toEqual([])
    expect(result.current.snapGuide).toEqual({ x: null, y: null })
  })

  it("clears guides and returns zero snap when dragged rect is null", () => {
    const { result } = renderHook(() => useSmartGuides())
    const container = setupDOM()

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(null, container)
    })

    expect(snap).toEqual({ snapX: 0, snapY: 0 })
    expect(result.current.guides).toEqual([])
  })

  it("clears guides and returns zero snap when container is null", () => {
    const { result } = renderHook(() => useSmartGuides())
    const dragRect = createDragRect(50, 50, 80, 40)

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(dragRect, null)
    })

    expect(snap).toEqual({ snapX: 0, snapY: 0 })
    expect(result.current.guides).toEqual([])
  })

  it("detects horizontal alignment (top edges match)", () => {
    const { result } = renderHook(() => useSmartGuides())

    // Create container with one child at top=50
    const container = setupDOM([
      { top: 50, left: 0, width: 100, height: 50 },
    ])

    // Create drag element at the same top=50
    const dragRect = createDragRect(50, 200, 80, 40)

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(dragRect, container)
    })

    // Should snap vertically (top-to-top alignment)
    expect(snap!.snapY).toBe(0)

    // Should have at least one horizontal guide at position 50
    expect(result.current.guides.length).toBeGreaterThanOrEqual(1)
    const horizGuide = result.current.guides.find(
      (g: { orientation: string }) => g.orientation === "horizontal"
    )
    expect(horizGuide).toBeDefined()
  })

  it("detects vertical alignment (left edges match)", () => {
    const { result } = renderHook(() => useSmartGuides())

    const container = setupDOM([
      { top: 0, left: 100, width: 100, height: 50 },
    ])

    // Drag element at same left=100
    const dragRect = createDragRect(200, 100, 80, 40)

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(dragRect, container)
    })

    expect(snap!.snapX).toBe(0)
  })

  it("snaps within threshold (5px)", () => {
    const { result } = renderHook(() => useSmartGuides())

    const container = setupDOM([
      { top: 0, left: 200, width: 100, height: 50 },
    ])

    // Dragged element at left=203 (3px away — within threshold)
    const dragRect = createDragRect(100, 203, 80, 40)

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(dragRect, container)
    })

    // Should snap X by -3px to align to 200
    expect(snap!.snapX).toBe(-3)
  })

  it("does NOT snap beyond threshold (5px)", () => {
    const { result } = renderHook(() => useSmartGuides())

    const container = setupDOM([
      { top: 0, left: 200, width: 100, height: 50 },
    ])

    // Dragged element at left=210 (10px away — beyond threshold)
    const dragRect = createDragRect(100, 210, 80, 40)

    let snap: { snapX: number; snapY: number } | undefined
    act(() => {
      snap = result.current.calculateGuides(dragRect, container)
    })

    // Should NOT snap — 10px > 5px threshold
    expect(snap!.snapX).toBe(0)
  })

  it("clearGuides resets everything", () => {
    const { result } = renderHook(() => useSmartGuides())

    const container = setupDOM([
      { top: 50, left: 0, width: 100, height: 50 },
    ])

    // Calculate some guides first
    const dragRect = createDragRect(50, 200, 80, 40)
    act(() => {
      result.current.calculateGuides(dragRect, container)
    })

    expect(result.current.guides.length).toBeGreaterThan(0)

    // Now clear them
    act(() => {
      result.current.clearGuides()
    })

    expect(result.current.guides).toEqual([])
    expect(result.current.snapGuide).toEqual({ x: null, y: null })
  })

  it("does not add duplicate guides at the same position", () => {
    const { result } = renderHook(() => useSmartGuides())

    // Two children with same top = 50
    const container = setupDOM([
      { top: 50, left: 0, width: 100, height: 50 },
      { top: 50, left: 200, width: 80, height: 50 },
    ])

    const dragRect = createDragRect(50, 400, 80, 40)

    act(() => {
      result.current.calculateGuides(dragRect, container)
    })

    // Should have only ONE horizontal guide at position 50
    const horizGuides = result.current.guides.filter(
      (g: { orientation: string }) => g.orientation === "horizontal"
    )
    const uniquePositions = new Set(horizGuides.map((g: { position: number }) => g.position))
    expect(uniquePositions.size).toBe(horizGuides.length)
  })
})
