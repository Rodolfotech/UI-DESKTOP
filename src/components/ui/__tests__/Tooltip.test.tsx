import { render, screen } from "@testing-library/react"
import { Tooltip } from "../Tooltip"

describe("Tooltip", () => {
  it("renders children correctly", () => {
    render(
      <Tooltip content="Hover to see info">
        <button>Click me</button>
      </Tooltip>
    )
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("renders with shortcut indicator", () => {
    render(
      <Tooltip content="Save document" shortcut="Ctrl+S">
        <button>Save</button>
      </Tooltip>
    )
    // The button should render with the text "Save"
    expect(screen.getByText("Save")).toBeInTheDocument()
    // The shortcut text should appear somewhere in the document
    expect(screen.getByText(/ctrl/i)).toBeInTheDocument()
  })
})
