'use client'
import { RouteError } from '@/components/layout/RouteError'
export default function EvaluationError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} fallbackHref="/dashboard" fallbackLabel="Back to Dashboard" />
}
