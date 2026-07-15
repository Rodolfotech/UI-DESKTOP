"use client"

import React from "react"
import { cn } from "@/lib/utils"

// ── Types ───────────────────────────────────────────────────────────

interface StyleInputProps {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  type?: "text" | "number" | "select" | "color" | "unit"
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

// ── Unit input (e.g. "16px", "1.5rem") ─────────────────────────────

const UnitInput: React.FC<{
  value: string | number
  onChange: (value: string | number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}> = ({ value, onChange, min = 0, max = 200, step = 1, unit = "px" }) => {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value
  const displayValue = isNaN(numValue) ? 0 : numValue

  return (
    <div className="relative flex items-center">
      <input
        type="number"
        value={displayValue}
        onChange={(e) => {
          const val = parseFloat(e.target.value)
          if (!isNaN(val)) onChange(`${val}${unit}`)
        }}
        min={min}
        max={max}
        step={step}
        className="w-full pl-2 pr-7 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="absolute right-2 text-[10px] text-gray-400 pointer-events-none">{unit}</span>
    </div>
  )
}

// ── Color input ─────────────────────────────────────────────────────

const ColorInput: React.FC<{
  value: string | number
  onChange: (value: string | number) => void
}> = ({ value, onChange }) => {
  const colorValue = typeof value === "string" && value.startsWith("#") ? value : "#ffffff"

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={colorValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded border border-gray-200 dark:border-gray-600 cursor-pointer p-0.5 bg-transparent"
      />
      <input
        type="text"
        value={colorValue}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        placeholder="#000000"
      />
    </div>
  )
}

// ── Select input ────────────────────────────────────────────────────

const SelectInput: React.FC<{
  value: string | number
  onChange: (value: string | number) => void
  options: { label: string; value: string }[]
}> = ({ value, onChange, options }) => {
  return (
    <select
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ── Main StyleInput ─────────────────────────────────────────────────

export const StyleInput: React.FC<StyleInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  options = [],
  min,
  max,
  step,
  unit,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between gap-2 py-1", className)}>
      <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0 min-w-[70px]">
        {label}
      </label>
      <div className="flex-1 max-w-[140px]">
        {type === "select" ? (
          <SelectInput value={value} onChange={onChange} options={options} />
        ) : type === "color" ? (
          <ColorInput value={value} onChange={onChange} />
        ) : type === "unit" ? (
          <UnitInput value={value} onChange={onChange} min={min} max={max} step={step} unit={unit} />
        ) : type === "number" ? (
          <UnitInput value={value} onChange={onChange} min={min} max={max} step={step} unit="" />
        ) : (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>
    </div>
  )
}
