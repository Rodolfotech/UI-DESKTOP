"use client"

import React, { useEffect, useState, useRef } from "react"
import { Editor, Frame, useEditor } from "@craftjs/core"
import { X, Maximize2, Monitor, Smartphone, Tablet, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

type PreviewDevice = "desktop" | "tablet" | "mobile"

const DEVICE_CONFIG: Record<PreviewDevice, { width: number; icon: React.FC<{ size?: number; className?: string }>; label: string }> = {
  desktop: { width: 1280, icon: Monitor, label: "Desktop" },
  tablet: { width: 768, icon: Tablet, label: "Tablet" },
  mobile: { width: 375, icon: Smartphone, label: "Mobile" },
}

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  jsonData: string
}

/**
 * Internal loader that deserializes the JSON state once the editor is mounted.
 */
const PreviewLoader: React.FC<{ jsonData: string; onLoaded: () => void }> = ({ jsonData, onLoaded }) => {
  const { actions } = useEditor()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    try {
      actions.deserialize(jsonData)
      console.log("[Preview] State deserialized")
    } catch (err) {
      console.error("[Preview] Failed to deserialize:", err)
    }
    onLoaded()
  }, [actions, jsonData, onLoaded])

  return null
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, jsonData }) => {
  const [device, setDevice] = useState<PreviewDevice>("desktop")
  const [isLoaded, setIsLoaded] = useState(false)
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens and handle keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      setIsLoaded(false)
      setDevice("desktop")

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const deviceConfig = DEVICE_CONFIG[device]
  const DeviceIcon = deviceConfig.icon

  // Calculate max width to fit in viewport
  const scaledWidth = Math.min(deviceConfig.width * (zoom / 100), typeof window !== 'undefined' ? window.innerWidth - 80 : deviceConfig.width)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Preview Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Maximize2 size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-200">Preview</span>
          </div>
          <div className="w-px h-5 bg-gray-700" />
          {!isLoaded ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              <span>Loading preview...</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">
              Interactive preview — components are disabled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(Object.entries(DEVICE_CONFIG) as [PreviewDevice, typeof DEVICE_CONFIG['desktop']][]).map(([key, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={key}
                  onClick={() => setDevice(key)}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    device === key
                      ? "bg-gray-700 text-white shadow"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                  title={config.label}
                >
                  <Icon size={15} />
                </button>
              )
            })}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-xs font-medium">-</span>
            </button>
            <span className="text-xs text-gray-300 w-10 text-center tabular-nums">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 25))}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-xs font-medium">+</span>
            </button>
          </div>

          <div className="w-px h-5 bg-gray-700" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-colors"
          >
            <X size={15} />
            <span>Close Preview</span>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-8"
        style={{
          backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className={cn(
            "bg-white rounded-xl shadow-2xl shadow-black/40 transition-all duration-300",
            !isLoaded && "opacity-0 scale-95"
          )}
          style={{
            width: scaledWidth,
            minHeight: 400,
            transformOrigin: "top center",
          }}
        >
          {/* Device header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <DeviceIcon size={13} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {deviceConfig.label}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 tabular-nums">
              {deviceConfig.width}px
            </span>
          </div>

          {/* Rendered design */}
          <div className="min-h-[400px]">
            <Editor
              resolver={{
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
              }}
              enabled={false}
            >
              <Frame>
                {/* Content will be deserialized by PreviewLoader */}
              </Frame>
              <PreviewLoader jsonData={jsonData} onLoaded={() => setIsLoaded(true)} />
            </Editor>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-500">
          Components are in read-only mode
        </div>
        <div className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
