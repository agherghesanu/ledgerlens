'use client'
import { RouteError } from '@/components/layout/RouteError'
export default function SettingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} fallbackHref="/settings" fallbackLabel="Reload Settings" />
}
