"use client"

import React, { useCallback } from "react"
import { useNode } from "@craftjs/core"
import { StyleInput } from "@/components/ui/StyleInput"
import { cn } from "@/lib/utils"

interface StyleState {
  padding: string
  margin: string
  borderRadius: string
  background: string
  color: string
  fontSize: string
  fontWeight: string
  textAlign: string
  width: string
  opacity: string
}

const defaultStyleState: StyleState = {
  padding: "16px",
  margin: "0px",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "400",
  textAlign: "left",
  width: "100%",
  opacity: "100",
}

const FONT_WEIGHT_OPTIONS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
]

const TEXT_ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
]

const OPACITY_OPTIONS = [
  { label: "100%", value: "100" },
  { label: "75%", value: "75" },
  { label: "50%", value: "50" },
  { label: "25%", value: "25" },
  { label: "0%", value: "0" },
]

export const StylePanel: React.FC = () => {
  const {
    actions: { setProp },
    padding,
    margin,
    borderRadius,
    background,
    color,
    fontSize,
    fontWeight,
    textAlign,
    width,
    opacity,
  } = useNode((node) => {
    const props = node.data.props || {}
    return {
      padding: (props.padding as string) || defaultStyleState.padding,
      margin: (props.margin as string) || defaultStyleState.margin,
      borderRadius: (props.borderRadius as string) || defaultStyleState.borderRadius,
      background: (props.background as string) || defaultStyleState.background,
      color: (props.color as string) || defaultStyleState.color,
      fontSize: (props.fontSize as string) || defaultStyleState.fontSize,
      fontWeight: (props.fontWeight as string) || defaultStyleState.fontWeight,
      textAlign: (props.textAlign as string) || defaultStyleState.textAlign,
      width: (props.width as string) || defaultStyleState.width,
      opacity: (props.opacity as string) || defaultStyleState.opacity,
    }
  })

  const updateProp = useCallback(
    (propName: string) => (value: string | number) => {
      setProp((props: Record<string, unknown>) => {
        props[propName] = value
      })
    },
    [setProp]
  )

  return (
    <div className="space-y-3">
      {/* ── Layout Section ─────────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-0.5">
          Spacing
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1">
          <StyleInput
            label="Padding"
            value={padding}
            onChange={updateProp("padding")}
            type="unit"
            min={0}
            max={100}
            step={2}
            unit="px"
          />
          <StyleInput
            label="Margin"
            value={margin}
            onChange={updateProp("margin")}
            type="unit"
            min={0}
            max={100}
            step={2}
            unit="px"
          />
          <StyleInput
            label="Border radius"
            value={borderRadius}
            onChange={updateProp("borderRadius")}
            type="unit"
            min={0}
            max={50}
            step={2}
            unit="px"
          />
        </div>
      </div>

      {/* ── Colors Section ─────────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-0.5">
          Colors
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1">
          <StyleInput
            label="Background"
            value={background}
            onChange={updateProp("background")}
            type="color"
          />
          <StyleInput
            label="Text color"
            value={color}
            onChange={updateProp("color")}
            type="color"
          />
        </div>
      </div>

      {/* ── Typography Section ─────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-0.5">
          Typography
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1">
          <StyleInput
            label="Font size"
            value={fontSize}
            onChange={updateProp("fontSize")}
            type="unit"
            min={8}
            max={72}
            step={1}
            unit="px"
          />
          <StyleInput
            label="Font weight"
            value={fontWeight}
            onChange={updateProp("fontWeight")}
            type="select"
            options={FONT_WEIGHT_OPTIONS}
          />
          <StyleInput
            label="Text align"
            value={textAlign}
            onChange={updateProp("textAlign")}
            type="select"
            options={TEXT_ALIGN_OPTIONS}
          />
        </div>
      </div>

      {/* ── Size & Effects Section ─────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-0.5">
          Size & Effects
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1">
          <StyleInput
            label="Width"
            value={width}
            onChange={updateProp("width")}
            type="select"
            options={[
              { label: "Auto", value: "auto" },
              { label: "100%", value: "100%" },
              { label: "50%", value: "50%" },
              { label: "Fit content", value: "fit-content" },
            ]}
          />
          <StyleInput
            label="Opacity"
            value={opacity}
            onChange={updateProp("opacity")}
            type="select"
            options={OPACITY_OPTIONS}
          />
        </div>
      </div>

      {/* ── Inline preview ─────────────────────── */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-1 h-3 bg-blue-500 rounded-full" />
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Live Preview
          </span>
        </div>
        <div
          className="w-full h-10 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-[9px] text-gray-400"
          style={{
            background: background,
            opacity: parseInt(opacity) / 100,
          }}
        >
          <span style={{ color, fontSize: Math.min(parseInt(fontSize), 14) + "px", fontWeight }}>Aa</span>
        </div>
      </div>
    </div>
  )
}
