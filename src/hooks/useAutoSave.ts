"use client"

import { useCallback, useRef, useEffect, useState } from "react"

const STORAGE_KEY = "proyect-ui-editor-state"
const DEBOUNCE_MS = 1000

/**
 * Custom hook for debounced auto-save to localStorage.
 * Exposes save status so the UI can show "unsaved changes" indicators.
 *
 * @param key - localStorage key
 * @param debounceMs - debounce delay in milliseconds
 */
export function useAutoSave(key: string = STORAGE_KEY, debounceMs: number = DEBOUNCE_MS) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>("")
  const pendingDataRef = useRef<string>("")
  const [lastSaved, setLastSaved] = useState<string>("")

  // Initial load — populate the ref so we can detect changes
  useEffect(() => {
    const existing = localStorage.getItem(key)
    if (existing) {
      lastSavedDataRef.current = existing
    }
  }, [key])

  const save = useCallback(
    (data: string) => {
      // Don't save if data hasn't changed
      if (data === lastSavedDataRef.current) {
        pendingDataRef.current = ""
        return
      }

      pendingDataRef.current = data

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        localStorage.setItem(key, data)
        lastSavedDataRef.current = data
        pendingDataRef.current = ""
        setLastSaved(new Date().toLocaleTimeString())
        console.log("[AutoSave] State saved to localStorage")
      }, debounceMs)
    },
    [key, debounceMs]
  )

  const load = useCallback((): string | null => {
    return localStorage.getItem(key)
  }, [key])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
    lastSavedDataRef.current = ""
    pendingDataRef.current = ""
    setLastSaved("")
    console.log("[AutoSave] State cleared from localStorage")
  }, [key])

  const forceSaveNow = useCallback((data: string) => {
    // Cancel any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    // Save immediately
    localStorage.setItem(key, data)
    lastSavedDataRef.current = data
    pendingDataRef.current = ""
    setLastSaved(new Date().toLocaleTimeString())
  }, [key])

  /** True when there are changes pending that haven't been persisted yet */
  const hasUnsavedChanges = pendingDataRef.current !== ""

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { save, load, clear, forceSaveNow, lastSaved, hasUnsavedChanges }
}
