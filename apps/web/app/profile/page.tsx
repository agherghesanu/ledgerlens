import type { Metadata } from 'next'
import { ProfileClient } from '@/components/profile/ProfileClient'

export const metadata: Metadata = {
  title: 'Skill Tracking — LedgerLens',
  description:
    'Detailed breakdown of your analytical competencies, over-trust index, strength/weakness patterns, and full review history.',
}

/**
 * Profile page — server shell.
 * ProfileClient owns data fetching (GET /profile) and renders
 * skeleton states while loading, then the real content.
 */
export default function ProfilePage() {
  return <ProfileClient />
}
