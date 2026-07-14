"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Editor } from "@craftjs/core"
import type { UserComponent } from "@craftjs/core"
import { TopBar } from "./TopBar"
import { Palette } from "./Palette"
import { Canvas } from "./Canvas"
import { Inspector } from "./Inspector"
import { EditorLoader } from "./EditorLoader"
import { useHistoryTracker } from "@/hooks/useHistoryTracker"
import { useClipboard } from "@/hooks/useClipboard"
import { ClipboardToast } from "@/components/editor/ClipboardToast"
import { ensureDefaultProject, saveProject, autoSaveSnapshot } from "@/lib/projectManager"
import type { ViewMode } from "./TopBar"
import { ContainerNode } from "./nodes/ContainerNode"
import { ButtonNode } from "./nodes/ButtonNode"
import { TextNode } from "./nodes/TextNode"
import { ImageNode } from "./nodes/ImageNode"
import { InputNode } from "./nodes/InputNode"
import { HeadingNode } from "./nodes/HeadingNode"
import { CardNode } from "./nodes/CardNode"
import { ModalNode } from "./nodes/ModalNode"
import { NavigationNode } from "./nodes/NavigationNode"
import { CheckboxNode } from "./nodes/CheckboxNode"
import { SelectNode } from "./nodes/SelectNode"
import { TextareaNode } from "./nodes/TextareaNode"
import { DividerNode } from "./nodes/DividerNode"
import { AvatarNode } from "./nodes/AvatarNode"
import { BadgeNode } from "./nodes/BadgeNode"
import { AlertNode } from "./nodes/AlertNode"
import { RadioNode } from "./nodes/RadioNode"
import { ToggleNode } from "./nodes/ToggleNode"
import { DatePickerNode } from "./nodes/DatePickerNode"
import { HeroTemplate } from "./templates/HeroTemplate"
import { PricingTemplate } from "./templates/PricingTemplate"
import { FooterTemplate } from "./templates/FooterTemplate"
import { FeaturesGrid } from "./templates/FeaturesGrid"
import { TestimonialTemplate } from "./templates/TestimonialTemplate"
import { LoginForm } from "./templates/LoginForm"
import { ContactForm } from "./templates/ContactForm"
import { TableOfContents } from "./templates/TableOfContents"
import { FAQSection } from "./templates/FAQSection"
import { TeamGrid } from "./templates/TeamGrid"
import { PricingTableDetailed } from "./templates/PricingTableDetailed"
import { StatsCounter } from "./templates/StatsCounter"
import { NewsletterSection } from "./templates/NewsletterSection"
import { CookieConsentBanner } from "./templates/CookieConsentBanner"
import { TimelineSection } from "./templates/TimelineSection"
import { LogoCloud } from "./templates/LogoCloud"
import { CTASection } from "./templates/CTASection"
import { PortfolioGrid } from "./templates/PortfolioGrid"
import { KeyboardShortcuts } from "./KeyboardShortcuts"
import { registerAllPlugins, loadPluginResolvers } from "@/lib/designSystems/loader"
import { designSystemRegistry } from "@/lib/designSystems/registry"

// ── Clipboard Manager (lives INSIDE <Editor> context) ───────────────

interface ClipboardAPI {
  copySelected: () => void
  pasteCopied: () => void
  duplicateSelected: () => void
}

const ClipboardManager: React.FC<{
  apiRef: React.MutableRefObject<ClipboardAPI | null>
}> = ({ apiRef }) => {
  const clipboard = useClipboard()
  const { feedback, clearFeedback } = clipboard

  // Expose clipboard functions via ref so EditorArea can pass them to Canvas
  apiRef.current = {
    copySelected: clipboard.copySelected,
    pasteCopied: clipboard.pasteCopied,
    duplicateSelected: clipboard.duplicateSelected,
  }

  return <ClipboardToast feedback={feedback} onDone={clearFeedback} />
}

// ── Native Resolvers (built-in components) ───────────────────────────

const NATIVE_RESOLVERS: Record<string, UserComponent> = {
  ButtonNode,
  ContainerNode,
  TextNode,
  ImageNode,
  InputNode,
  HeadingNode,
  CardNode,
  ModalNode,
  NavigationNode,
  CheckboxNode,
  SelectNode,
  TextareaNode,
  DividerNode,
  AvatarNode,
  BadgeNode,
  AlertNode,
  RadioNode,
  ToggleNode,
  DatePickerNode,
  HeroTemplate,
  PricingTemplate,
  FooterTemplate,
  FeaturesGrid,
  TestimonialTemplate,
  LoginForm,
  ContactForm,
  TableOfContents,
  FAQSection,
  TeamGrid,
  PricingTableDetailed,
  StatsCounter,
  NewsletterSection,
  CookieConsentBanner,
  TimelineSection,
  LogoCloud,
  CTASection,
  PortfolioGrid,
}

interface EditorAreaProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  save: (json: string) => void
  onExportCode?: () => void
  onSave?: () => void
  onClear?: () => void
  onProjectsClick?: () => void
  onPreviewClick?: () => void
  onDeployClick?: () => void
  onBackupClick?: () => void
  lastSaved?: string
  hasUnsavedChanges?: boolean
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  viewMode,
  onViewModeChange,
  save,
  onExportCode,
  onSave: onSaveClick,
  onClear,
  onProjectsClick,
  onPreviewClick,
  onDeployClick,
  onBackupClick,
  lastSaved,
  hasUnsavedChanges,
}) => {
  const projectIdRef = useRef<number | null>(null)
  const initializedRef = useRef(false)
  const lastSnapshotRef = useRef<string>('')
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    entries: historyEntries,
    currentIndex: historyCurrentIndex,
    isOpen: historyIsOpen,
    toggleOpen: onHistoryToggle,
    close: onHistoryClose,
    navigateTo: onHistoryNavigate,
    saveSnapshot,
  } = useHistoryTracker()

  // Clipboard API ref — populated by ClipboardManager inside <Editor>
  const clipboardApiRef = useRef<ClipboardAPI | null>(null)
  const copySelected = useCallback(() => clipboardApiRef.current?.copySelected(), [])
  const pasteCopied = useCallback(() => clipboardApiRef.current?.pasteCopied(), [])
  const duplicateSelected = useCallback(() => clipboardApiRef.current?.duplicateSelected(), [])

  // ── Design System State ──────────────────────────────────────────

  // ── Draft Auto-save (5s debounce) ─────────────────────────────
  const [draftStatus, setDraftStatus] = useState<"saving" | "saved" | null>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedDraftSave = useCallback(async (json: string) => {
    const pid = projectIdRef.current
    if (!pid) return

    setDraftStatus("saving")
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)

    // Debounce 5s — reset on each call
    draftTimerRef.current = setTimeout(async () => {
      try {
        await saveProject(pid, json)
        setDraftStatus("saved")
        // Clear "Draft saved" after 2s
        if (draftSavedTimerRef.current) clearTimeout(draftSavedTimerRef.current)
        draftSavedTimerRef.current = setTimeout(() => setDraftStatus(null), 2000)
      } catch {
        setDraftStatus(null)
      }
    }, 5000)
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
      if (draftSavedTimerRef.current) clearTimeout(draftSavedTimerRef.current)
    }
  }, [])

  const [dsResolvers, setDsResolvers] = useState<Record<string, UserComponent>>({})
  const [activeDS, setActiveDSState] = useState<string | null>(null)
  const [dsLoading, setDsLoading] = useState(false)

  // Register all DS plugins on mount
  useEffect(() => {
    registerAllPlugins().catch((err) =>
      console.error("[EditorArea] Failed to register DS plugins:", err)
    )
  }, [])

  // Handle DS selection: load adapters and update resolvers
  const handleSelectDS = useCallback(async (dsId: string | null) => {
    // If same DS selected, deselect it (toggle off)
    if (dsId === activeDS) {
      dsId = null
    }

    setDsLoading(true)
    designSystemRegistry.setActive(dsId)
    setActiveDSState(dsId)

    try {
      const resolvers = await loadPluginResolvers(dsId)
      setDsResolvers(resolvers)
    } catch (err) {
      console.error("[EditorArea] Failed to load DS resolvers:", err)
      setDsResolvers({})
    } finally {
      setDsLoading(false)
    }
  }, [activeDS])

  // Combine native resolvers with DS resolvers
  const allResolvers = useMemo(
    () => ({
      ...NATIVE_RESOLVERS,
      ...dsResolvers,
    }),
    [dsResolvers],
  )

  // ── History State ────────────────────────────────────────────────

  // Initialize the project in the database on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const savedState = localStorage.getItem('proyect-ui-editor-state')
    const initialJson = savedState || ''

    ensureDefaultProject(initialJson).then((id) => {
      if (id > 0) {
        projectIdRef.current = id
      }
    })
  }, [])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 transition-colors">
      <Editor
        resolver={allResolvers}
        onNodesChange={(query) => {
          const json = query.serialize()
          save(json)
          saveSnapshot(json)

          // Also save to the database (debounced 5s) if a project is active
          if (projectIdRef.current) {
            debouncedDraftSave(json)
            // Auto-save snapshot for history tracking (max every 10 seconds)
            if (lastSnapshotRef.current !== json) {
              if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current)
              snapshotTimerRef.current = setTimeout(() => {
                lastSnapshotRef.current = json
                autoSaveSnapshot(projectIdRef.current!, json)
              }, 10000)
            }
          }
        }}
      >
        <TopBar
          onExportCode={onExportCode}
          onSave={onSaveClick}
          onClear={onClear}
          onProjectsClick={onProjectsClick}
          onDeployClick={onDeployClick}
          onBackupClick={onBackupClick}
          onPreviewClick={onPreviewClick}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          draftStatus={draftStatus}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <div className="flex-1 flex overflow-hidden">
          <Palette
            activeDS={activeDS}
            onSelectDS={handleSelectDS}
            dsLoading={dsLoading}
            dsComponentMap={dsResolvers}
          />
          <Canvas
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onCopy={copySelected}
            onPaste={pasteCopied}
            onDuplicate={duplicateSelected}
            historyEntries={historyEntries}
            historyCurrentIndex={historyCurrentIndex}
            historyIsOpen={historyIsOpen}
            onHistoryToggle={onHistoryToggle}
            onHistoryClose={onHistoryClose}
            onHistoryNavigate={onHistoryNavigate}
          />
          <Inspector />
          <KeyboardShortcuts onHistoryToggle={onHistoryToggle} />
        </div>
        <ClipboardManager apiRef={clipboardApiRef} />
      </Editor>
    </div>
  )
}
