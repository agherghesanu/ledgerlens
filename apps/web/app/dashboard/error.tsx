'use client'
import { RouteError } from '@/components/layout/RouteError'
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} fallbackHref="/dashboard" fallbackLabel="Reload Dashboard" />
}
