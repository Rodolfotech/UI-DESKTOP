# Proyect-UI — Visual Drag & Drop Editor

A web-based visual editor built with **Next.js**, **Craft.js**, and **Tailwind CSS**. Users can drag-and-drop UI components onto a canvas, arrange them visually, edit their properties in real-time via an inspector panel, and export the resulting design as clean React JSX code.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [File Structure](#file-structure)
4. [Core Editor Layout](#core-editor-layout)
5. [Component System](#component-system)
   - [Basic Nodes (19)](#basic-nodes)
   - [Layout Templates (5)](#layout-templates)
6. [Editor Modules](#editor-modules)
   - [Palette (Left Sidebar)](#palette)
   - [Canvas (Center)](#canvas)
   - [Inspector (Right Sidebar)](#inspector)
   - [TopBar](#topbar)
7. [History System](#history-system)
8. [Auto-Save System](#auto-save-system)
9. [Code Generation & Export](#code-generation--export)
10. [Responsive Preview Modes](#responsive-preview-modes)
11. [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

```
                    ┌────────────────────────────────────────────────┐
                    │                   page.tsx                     │
                    │  (State: viewMode, history, export, auto-save) │
                    └────┬────────┬────────┬────────┬───────────────┘
                         │        │        │        │
              ┌──────────┘        │        │        └──────────┐
              ▼                   ▼        ▼                   ▼
       ┌───────────┐     ┌────────────┐ ┌──────────┐   ┌─────────────┐
       │  TopBar   │     │   Palette  │ │  Canvas  │   │  Inspector  │
       │(Undo/Redo,│     │ (Component │ │(Editor   │   │(Properties  │
       │ viewport, │     │  palette)  │ │  frame)  │   │  & actions) │
       │ save/     │     └────────────┘ └──────────┘   └─────────────┘
       │ export)   │                       │
       └───────────┘                       │
                                           ▼
                                  ┌─────────────────┐
                                  │   Craft.js       │
                                  │  Editor Engine   │
                                  │ (Frame, Element, │
                                  │  useEditor,      │
                                  │  useNode)        │
                                  └─────────────────┘
```

All editor components are children of Craft.js's `<Editor>` component in `page.tsx`. The `Editor` provides the core engine: drag-and-drop, selection, serialization/deserialization, undo/redo, and node management.

**Data flow:**
- User interactions → Craft.js internal state → `onNodesChange` callback → `saveSnapshot()` (history) + `save()` (auto-save)
- History navigation → `navigateTo()` → calls `undo()`/`redo()` loop → Craft.js restores state → `onNodesChange` fires again
- Export → `load()` from localStorage → `generateReactCode()` → shows in ExportModal

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Editor Engine** | @craftjs/core |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Utilities** | clsx, tailwind-merge |
| **Variants** | class-variance-authority (CVA) |
| **Storage** | localStorage |

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata
│   ├── page.tsx            # Main page — Editor host, state management
│   └── globals.css         # Tailwind, CSS variables, scrollbar styles
│
├── components/
│   ├── ui/                 # Reusable design-system primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   │
│   └── editor/             # Editor-specific components
│       ├── index.ts         # Barrel exports
│       │
│       ├── Palette.tsx      # Left sidebar — draggable component palette
│       ├── Canvas.tsx       # Center — Craft.js Frame + drag handles + toolbar
│       ├── Inspector.tsx    # Right sidebar — selected-node settings
│       ├── TopBar.tsx       # Top bar — history, viewport, save, export
│       ├── EditorLoader.tsx # Restores editor state from localStorage
│       ├── ExportModal.tsx  # Export code/JSON modal
│       ├── HistoryDropdown.tsx # History undo/redo timeline dropdown
│       │
│       ├── nodes/           # 19 editable component nodes
│       │   ├── index.ts
│       │   ├── ContainerNode.tsx
│       │   ├── ButtonNode.tsx
│       │   ├── TextNode.tsx
│       │   ├── HeadingNode.tsx
│       │   ├── ImageNode.tsx
│       │   ├── InputNode.tsx
│       │   ├── CardNode.tsx
│       │   ├── ModalNode.tsx
│       │   ├── NavigationNode.tsx
│       │   ├── CheckboxNode.tsx
│       │   ├── SelectNode.tsx
│       │   ├── TextareaNode.tsx
│       │   ├── DividerNode.tsx
│       │   ├── AvatarNode.tsx
│       │   ├── BadgeNode.tsx
│       │   ├── AlertNode.tsx
│       │   ├── RadioNode.tsx
│       │   ├── ToggleNode.tsx
│       │   └── DatePickerNode.tsx
│       │
│       └── templates/       # 5 pre-built layout templates
│           ├── index.ts
│           ├── HeroTemplate.tsx
│           ├── PricingTemplate.tsx
│           ├── FooterTemplate.tsx
│           ├── FeaturesGrid.tsx
│           └── TestimonialTemplate.tsx
│
├── hooks/
│   ├── useHistoryTracker.ts # Custom undo/redo history tracker
│   └── useAutoSave.ts      # Debounced localStorage auto-save
│
└── lib/
    ├── utils.ts             # cn() helper (clsx + twMerge)
    └── codeGenerator.ts     # Converts Craft.js JSON → React JSX
```

---

## Core Editor Layout

The editor is a three-panel layout managed in `page.tsx`:

```
┌─────────────────────────────────────────────────────────────────┐
│                         TopBar                                   │
├──────────┬─────────────────────────────────────┬────────────────┤
│          │                                     │                │
│ Palette  │            Canvas                    │   Inspector    │
│ (w-72)   │      (flex-1, scrollable)           │    (w-80)      │
│          │                                     │                │
│  Drag    │    ┌──────────────────────┐          │  Edit props    │
│  comps   │    │   Craft.js Frame     │          │  for selected  │
│  to      │    │                      │          │  component     │
│  canvas  │    │   ┌────────────────┐ │          │                │
│          │    │   │  <Container>   │ │          │                │
│          │    │   │  + Children    │ │          │                │
│          │    │   └────────────────┘ │          │                │
│          │    └──────────────────────┘          │                │
├──────────┴─────────────────────────────────────┴────────────────┤
│                     (scroll area)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component System

Every draggable component is a **Craft.js UserComponent** following this pattern:

```tsx
// 1. Component definition
export const MyNode: UserComponent<MyNodeProps> = ({ prop1, ... }) => {
  const { connectors: { connect, drag }, selected } = useNode(...);
  return (
    <div ref={ref => ref && connect(drag(ref))} className={...}>
      ...
    </div>
  );
};

// 2. Settings panel (shown in Inspector)
export const MyNodeSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as MyNodeProps,
  }));
  return <div>...controls...</div>;
};

// 3. Craft configuration
MyNode.craft = {
  displayName: "MyComponent",
  props: { ... } as MyNodeProps,
  related: { settings: MyNodeSettings },
  rules: { canDrag: () => true },
};
```

### Basic Nodes (19)

| # | Component | Props | Inspector Settings |
|---|-----------|-------|-------------------|
| 1 | **Container** | background, padding, margin, borderRadius, flexDirection | Color picker, padding slider, border radius slider, flex direction select |
| 2 | **Button** | text, variant, size | Text input, variant select (6 options), size select (4 options) |
| 3 | **Text** | text, fontSize, fontWeight, color, textAlign | Textarea, font size slider, color picker, text alignment select |
| 4 | **Heading** | text, level (h1-h4), color | Text input, level select, color picker |
| 5 | **Image** | src, alt, width, height, borderRadius | Image URL input, alt text input, width/height number inputs, border radius slider |
| 6 | **Input** | label, placeholder, type (text/email/password/number), width | Label input, placeholder input, type select, width slider |
| 7 | **Card** | background, borderRadius, shadow (bool), padding, border (bool) | Color picker, padding slider, border radius slider, shadow toggle, border toggle |
| 8 | **Modal** | title, showClose (bool), background, borderRadius, width | Title input, width slider, border radius slider, show close toggle |
| 9 | **Navigation** | logo, background, textColor, height, items (string[]) | Logo input, color pickers, height slider, comma-separated items input |
| 10 | **Checkbox** | label, checked (bool), disabled (bool) | Label input, checked toggle, disabled toggle |
| 11 | **Select** | label, placeholder, options (string[]), width | Label input, placeholder input, comma-separated options input, width slider |
| 12 | **Textarea** | label, placeholder, rows (2-10), width | Label input, placeholder input, rows slider, width slider |
| 13 | **Divider** | color, thickness, style (solid/dashed/dotted), width (percentage) | Color picker, thickness slider, style select, width percentage slider |
| 14 | **Avatar** | src, alt, size (sm/md/lg/xl), shape (circle/square), name (fallback) | Image URL input, name input, size select, shape select |
| 15 | **Badge** | text, variant (default/success/warning/danger/info/gray) | Text input, variant select (6 color options) |
| 16 | **Alert** | title, message, variant (info/success/warning/error), showIcon (bool), showClose (bool) | Title input, message textarea, variant select, show icon toggle, show close toggle |
| 17 | **Radio** | label, name, options (string[]), selected (string) | Label input, group name input, comma-separated options input, default selection select |
| 18 | **Toggle** | label, checked (bool), disabled (bool) | Label input, enabled toggle, disabled toggle |
| 19 | **DatePicker** | label, placeholder, width | Label input, placeholder input, width slider |

### Layout Templates (5)

| # | Component | Props | Description |
|---|-----------|-------|-------------|
| 1 | **Hero Section** | title, subtitle, buttonText, background, textColor | Full-width hero with heading, text, CTA button, and image. Uses `linear-gradient` background. |
| 2 | **Pricing Table** | title, plans (name/price/features/highlighted array) | 3-column pricing cards with highlighted "Pro" plan. Each card has features list and CTA button. |
| 3 | **Features Grid** | title, subtitle, features (icon/title/description array), columns (2/3/4) | Feature showcase grid with emoji icons and hover effects. |
| 4 | **Testimonial** | quote, author, role, avatar, rating (1-5) | Customer testimonial card with star rating, quote, author info, and avatar. |
| 5 | **Footer** | companyName, tagline, background, textColor, columns (title/links array) | Full page footer with brand info, social icons, link columns, and copyright. |

---

## Editor Modules

### Palette

**File:** `src/components/editor/Palette.tsx`

The left sidebar that displays draggable component items organized in collapsible groups.

**Features:**
- **Collapsible groups:** Basic Elements, Layout, Data Display, Form Elements, Layout & Navigation, Layout Templates
- **Component items:** Each shows an icon, label, and description. Uses `connectors.drag()` to make them draggable
- **Row Layout helper:** Pre-configured Container with `flexDirection: "row"` for quick horizontal layouts
- **Templates group:** Starts collapsed by default (`defaultOpen={false}`)

### Canvas

**File:** `src/components/editor/Canvas.tsx`

The central editing area containing the Craft.js `<Frame>` and all canvas controls.

**Features:**
- **Craft.js Frame:** Renders the visual editor with drag-and-drop, selection, and hover states
- **Canvas Toolbar:** Undo/Redo buttons, Grid toggle, Zoom controls (50%-200%), History dropdown
- **Drag Handles:** Left and right resize handles with `cursor-col-resize`. Fade-in on hover, always visible during drag
- **Width Indicator:** Shows current width in px plus device mode label. Bottom fixed tooltip during drag
- **Snap Indicators:** 3 dots on the right of the canvas title bar showing breakpoint positions. During drag, shows "mobile"/"tablet"/"desktop" labels that highlight when near a breakpoint
- **Touch Support:** `touchAction: "none"` on drag handles, `touchmove`/`touchend` listeners
- **Zoom:** Scales the canvas frame via CSS `transform: scale()`. Range 50%–200%

**Drag Resize Logic:**
- Uses `useRef` for mutable drag state (avoids stale closures)
- On drag start: captures `startX` and `startWidth`
- On move: calculates `newWidth = startWidth + delta` (clamped between 320-1400px)
- On end: snaps to nearest breakpoint (375, 768, 1200) with 60px threshold, shows snap briefly (150ms), then resets `customWidth`

### Inspector

**File:** `src/components/editor/Inspector.tsx`

The right sidebar that shows settings for the currently selected component.

**Features:**
- **Selected Node Header:** Shows component name and ID (last 8 chars). Buttons: Move Up, Move Down, Duplicate, Delete
- **Properties Panel:** Renders the component's `Settings` component (from `.craft.related.settings`)
- **Quick Actions:** Undo Last Change, Delete Component
- **Empty State:** Shows "No selection" message when nothing is selected

### TopBar

**File:** `src/components/editor/TopBar.tsx`

The top navigation bar with application controls.

**Features:**
- **Logo & Title:** Proyect-UI brand with gradient icon
- **History Controls:** Undo/Redo buttons (center group, inside a rounded container)
- **Viewport Mode:** Desktop (Monitor icon), Tablet (Tablet icon), Mobile (Smartphone icon) — toggles canvas width
- **Actions:** Code button, Preview button (placeholder), Save button, Clear button (resets localStorage), Export button (opens ExportModal)
- **Last Saved:** Shows timestamp when design was saved

---

## History System

### Hook: `useHistoryTracker`

**File:** `src/hooks/useHistoryTracker.ts`

A custom hook that tracks editor state changes and maintains a navigable history timeline.

**Core concepts:**
- **Entries:** Array of `{ id, description, timestamp, isCurrent }` — up to 50 entries
- **Current Index:** Pointer to the current position in the history timeline
- **Debounce:** Changes are debounced at 500ms to avoid flooding history during rapid edits
- **JSON Diffing:** Compares serialized Craft.js JSON snapshots to auto-generate human-readable descriptions

**Description generation (`generateDescription`):**
- Detects **added** components (present in new state but not in old)
- Detects **removed** components (present in old state but not in new)
- Detects **modified** components (props changed via `JSON.stringify` comparison)
- Detects **reordered** components (children order changed within a parent)
- Falls back to "Modified design" if no specific change can be identified
- Component names are mapped via `COMPONENT_TYPE_LABELS` (e.g., `ButtonNode` → "Button", `HeroTemplate` → "Hero Section")

**Navigation (`navigateTo`):**
- Computes the difference in indices
- Calls `undo()` or `redo()` in a loop to reach the target state
- Uses `currentIndexRef` (a `useRef`) to avoid stale closures

**Key design details:**
- All mutable state uses `useRef` (not `useState`) inside callbacks to prevent stale closures
- `recordChange` has empty deps `[]` — purely ref-based
- `saveSnapshot` debounces calls and delegates to `recordChange`

### Component: `HistoryDropdown`

**File:** `src/components/editor/HistoryDropdown.tsx`

A dropdown panel that visualizes the history timeline with search and filter capabilities.

**Features:**
- **Trigger Button:** Shows History icon, text, and current index (e.g., "3/15")
- **Timeline UI:** Vertical timeline with dots (blue = current, gray = past, lighter = future) and connector lines
- **Navigation:** Each entry is clickable to jump to that point. Undo/Redo buttons with tooltip hints for keyboard shortcuts
- **Search:** Input field filters entries by description text. Matching text is highlighted in yellow
- **Action Type Filters:** 6 filter chips — All, Added, Modified, Deleted, Reordered, Initial — each with color coding and count
- **Reset Button:** Clears all active filters
- **Action Badges:** Each entry shows a colored badge indicating the action type (Added/Modified/Deleted/Reordered/Initial)
- **Status Legend:** Footer shows colored dots for Current, Past, and Future entries with counts
- **Auto-scroll:** Scrolls to the current entry when opened
- **Close triggers:** Click outside, Escape key

---

## Auto-Save System

**File:** `src/hooks/useAutoSave.ts`

A debounced auto-save hook that persists the editor state to `localStorage`.

**Storage key:** `"proyect-ui-editor-state"`

**Behavior:**
- Debounces saves at 1000ms (configurable)
- Skips saves if the data hasn't changed (compares against `lastSavedRef`)
- Provides `save(data)`, `load() → string | null`, and `clear()` methods
- Cleanup on unmount clears any pending timeout

**EditorLoader** (`src/components/editor/EditorLoader.tsx`) restores saved state on mount:
- Uses `actions.deserialize()` to restore Craft.js state
- Fires only once (guarded by `isLoaded` state)

---

## Code Generation & Export

**File:** `src/lib/codeGenerator.ts`

Converts Craft.js serialized JSON into clean React JSX component code.

**How it works:**
1. Parses the Craft.js JSON
2. Finds the ROOT node
3. Recursively walks the node tree
4. For each node, calls the appropriate `generator` function
5. Collects all unique imports
6. Assembles the final component file

**Generator system (`componentGenerators`):**
- Each component has an `import` string and a `generate(props, children) → JSX string` function
- 24 generators total: 19 basic nodes + 5 templates
- Internal Craft.js props are filtered out before generating
- Output is indented properly for readability

**ExportModal** (`src/components/editor/ExportModal.tsx`):
- **Two tabs:** JSON Structure (raw serialized state) and React Component (generated code)
- **Syntax highlighting:** Dark monospace code block
- **Copy to Clipboard:** With "Copied!" confirmation
- **Download as file:** Saves as `.json` or `.tsx` depending on active tab

---

## Responsive Preview Modes

Implemented across `TopBar.tsx`, `Canvas.tsx`, and `page.tsx`.

**Breakpoints:**

| Mode | Canvas Width | Icon |
|------|------------|------|
| Desktop | 1200px | Monitor |
| Tablet | 768px | Tablet |
| Mobile | 375px | Smartphone |

**Behavior:**
- Clicking a viewport button in the TopBar updates the `viewMode` state in `page.tsx`
- The Canvas adjusts its `activeWidth` to match the selected breakpoint
- Canvas shows a device label like "desktop • 1200px" in the title bar
- CSS `transition-all duration-300` animates the width change smoothly
- Drag handles allow manual resizing between breakpoints with snap-to-breakpoint logic

---

## Key Design Decisions

1. **Ref-based callbacks in `useHistoryTracker`:** Using `useRef` instead of `useState` inside callbacks to prevent stale closures, eliminating the need for dependency arrays in `useCallback`.

2. **Debounced auto-save + history:** Two separate debounced systems:
   - Auto-save: 1000ms debounce, persists to localStorage
   - History: 500ms debounce, maintains in-memory timeline
   Both fire from the same `onNodesChange` callback.

3. **Custom history vs Craft.js native:** Craft.js has built-in undo/redo via `query.history`, but it doesn't expose entry descriptions or allow jumping to arbitrary points in the timeline. `useHistoryTracker` builds on top by recording snapshots and auto-generating descriptions through JSON diffing.

4. **Component modularity:** Each node component is self-contained with its own:
   - TypeScript interface (props)
   - JSX rendering
   - Settings panel
   - Craft.js configuration (`.craft` static property)
   This makes adding new components straightforward (just add a file to `nodes/`, export from `index.ts`, and register in `page.tsx`'s resolver).

5. **Drag handles with refs:** The canvas resize logic uses `useRef` for mutable drag state (`dragRef.current`) attached to global event listeners, which avoids stale closure bugs and eliminates the need for callback refs that change on every render.

6. **Filtered history navigation:** When navigating to a historical entry via the dropdown, the `navigateTo` function calls `undo()` or `redo()` in a loop rather than `deserialize()`. This ensures Craft.js's internal state tree stays consistent and all listeners fire properly.
