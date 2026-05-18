'use client'

// useSetting — persist a value in localStorage with a typed default.
// SSR-safe: returns `defaultValue` on the first server render, then
// the real stored value after hydration.
//
// Usage:
//   const [demoMode, setDemoMode] = useSetting('demo_mode', true)
//   const [difficulty, setDifficulty] = useSetting('difficulty', 'Medium')

import { useState, useEffect, useCallback } from 'react'

const PREFIX = 'ledgerlens:'

export function useSetting<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const storageKey = `${PREFIX}${key}`

  // Initialise from localStorage if available (client only)
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === null) return defaultValue
      return JSON.parse(stored) as T
    } catch {
      return defaultValue
    }
  })

  // Sync from localStorage after hydration (handles SSR mismatch)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored !== null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const set = useCallback(
    (newValue: T) => {
      setValue(newValue)
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(newValue))
      } catch {
        /* storage quota exceeded or private mode — silently degrade */
      }
    },
    [storageKey],
  )

  return [value, set]
}
