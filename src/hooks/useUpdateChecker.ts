"use client"

import { useState, useEffect, useCallback } from "react"

export interface UpdateInfo {
  available: boolean
  version?: string
  date?: string
  body?: string
  downloading?: boolean
}

/**
 * Hook to check for Tauri desktop app updates.
 * In the browser (non-Tauri), it returns no update available.
 */
export function useUpdateChecker() {
  const [update, setUpdate] = useState<UpdateInfo>({ available: false })
  const [checking, setChecking] = useState(false)

  const checkForUpdates = useCallback(async () => {
    // Check if we're in a Tauri environment
    if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
      return { available: false }
    }

    try {
      setChecking(true)
      const { check } = await import("@tauri-apps/plugin-updater")
      const result = await check()

      if (result) {
        setUpdate({
          available: true,
          version: result.version,
          date: result.date,
          body: result.body,
        })
        return { available: true, version: result.version }
      }

      setUpdate({ available: false })
      return { available: false }
    } catch (err) {
      console.warn("[Updater] Check failed:", err)
      setUpdate({ available: false })
      return { available: false }
    } finally {
      setChecking(false)
    }
  }, [])

  const installUpdate = useCallback(async () => {
    try {
      setUpdate((prev) => ({ ...prev, downloading: true }))
      const { check } = await import("@tauri-apps/plugin-updater")
      const { relaunch } = await import("@tauri-apps/plugin-process")

      const result = await check()
      if (result) {
        await result.downloadAndInstall()
        await relaunch()
      }
    } catch (err) {
      console.warn("[Updater] Install failed:", err)
      setUpdate((prev) => ({ ...prev, downloading: false }))
    }
  }, [])

  // Check for updates on mount (only in Tauri)
  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      const timer = setTimeout(() => checkForUpdates(), 3000) // delay 3s after app start
      return () => clearTimeout(timer)
    }
  }, [checkForUpdates])

  return {
    update,
    checking,
    checkForUpdates,
    installUpdate,
  }
}
