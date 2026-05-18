import type { Metadata } from 'next'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard — LedgerLens',
  description: 'Overview of your recent financial review activity, accuracy trends, and active cases.',
}

/**
 * Dashboard page — server component shell.
 * DashboardClient handles data fetching (React Query) and renders
 * skeleton states while loading, then the real content.
 */
export default function DashboardPage() {
  return <DashboardClient />
}
