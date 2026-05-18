'use client'

// Settings page — full port of mockup/screens/settings.jsx.
// Preferences are persisted to localStorage via useSetting().
// API Keys are stored in localStorage only (never sent to the backend).
// The page is one client component because every interaction is local.

import type { Metadata } from 'next'
import { useState } from 'react'
import { useSetting } from '@/lib/useSetting'
import { Toggle } from '@/components/ui/Toggle'
import { Seg } from '@/components/ui/Seg'
import { Chip } from '@/components/ui/Chip'
import { useAuth } from '@/lib/AuthContext'
import { createCheckoutSession, createOrganization } from '@/lib/api'
import { Sparkles } from 'lucide-react'

// ── Inline SVG icons (avoid import overhead for small icons) ─────────────────

const SlidersIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
  </svg>
)
const KeyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2 9 14M15 2l-5.5 5.5M20 3l-5.5 5.5"/>
    <circle cx="7" cy="17" r="5"/>
  </svg>
)
const BellIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const EyeIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
  </svg>
)
const AlertTriIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
)
const CheckIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="m20 6-11 11-5-5"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const LightningIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>
  </svg>
)

// ── Shared layout atoms ───────────────────────────────────────────────────────

function SettingsCard({
  title, sub, icon, children,
  danger = false,
}: {
  title: string; sub: string; icon: React.ReactNode; children: React.ReactNode; danger?: boolean
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--card)',
        borderColor: danger ? 'rgba(244,63,94,0.4)' : 'var(--border)',
      }}
    >
      {/* Head */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 border-b"
        style={{
          borderColor: danger ? 'rgba(244,63,94,0.25)' : 'var(--border)',
          background: danger
            ? 'linear-gradient(180deg, rgba(244,63,94,0.06), transparent)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)',
        }}
      >
        <div>
          <h3 className="font-display font-bold text-[17px] m-0 mb-1" style={{ color: danger ? 'var(--rose)' : 'var(--text)' }}>
            {title}
          </h3>
          <p className="text-sm m-0" style={{ color: 'var(--text-dim)' }}>{sub}</p>
        </div>
        <div style={{ color: danger ? 'var(--rose)' : 'var(--text-dim)', marginTop: 2, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      {children}
    </div>
  )
}

function SettingsRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-8 px-5 py-4"
      style={{ borderBottom: '1px solid var(--border-dim)' }}
    >
      {children}
    </div>
  )
}

function LabelBlock({ label, desc }: { label: React.ReactNode; desc: string }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-dim)' }}>{desc}</div>
    </div>
  )
}

// ── API key input row ──────────────────────────────────────────────────────────

function ApiKeyRow({
  label, storageKey, badge, badgeVariant = 'amber', placeholder = 'Enter API key',
}: {
  label: string
  storageKey: string
  badge: React.ReactNode
  badgeVariant?: 'green' | 'amber' | 'indigo'
  placeholder?: string
}) {
  const [stored, setStored] = useSetting<string>(storageKey, '')
  const [draft, setDraft] = useState(stored)
  const [show, setShow] = useState(false)
  const hasKey = stored.trim().length > 0
  const dirty = draft !== stored

  function save() {
    setStored(draft.trim())
  }

  return (
    <div
      className="px-5 py-4 flex flex-col gap-2.5"
      style={{ borderBottom: '1px solid var(--border-dim)' }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="cap">{label}</span>
        {badge}
      </div>

      {/* Input row */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: hasKey ? '1fr auto auto' : '1fr auto' }}
      >
        <div
          className="flex items-center gap-2 rounded-lg border px-3"
          style={{
            background: 'var(--card-2)',
            borderColor: 'var(--border)',
            height: 38,
          }}
        >
          <KeyIcon size={12} />
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
            style={{ color: 'var(--text)', minWidth: 0 }}
          />
        </div>

        {hasKey && (
          <button
            type="button"
            title={show ? 'Hide key' : 'Show key'}
            onClick={() => setShow((v) => !v)}
            className="h-[38px] px-3 rounded-lg border flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--card-2)', borderColor: 'var(--border)', color: 'var(--text-dim)' }}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!dirty && hasKey}
          className="h-[38px] px-4 rounded-lg font-mono text-sm font-medium border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={
            dirty
              ? { background: 'var(--indigo)', color: 'var(--indigo-dark)', borderColor: 'var(--indigo)' }
              : { background: 'var(--card-2)', color: 'var(--text-dim)', borderColor: 'var(--border)' }
          }
        >
          {hasKey && !dirty ? 'Saved' : hasKey ? 'Update' : 'Save'}
        </button>
      </div>

      <p className="text-xs m-0" style={{ color: 'var(--text-mute)' }}>
        Stored locally in your browser only — never sent to the LedgerLens backend.
      </p>
    </div>
  )
}

// ── Notification toggle card ───────────────────────────────────────────────────

type NotifKey = 'anomaly' | 'rebalance' | 'updates' | 'ingest'
const NOTIF_ITEMS: { key: NotifKey; title: string; desc: string }[] = [
  { key: 'anomaly',   title: 'Market Anomalies',       desc: 'Sudden volume or price spikes.' },
  { key: 'rebalance', title: 'Portfolio Rebalancing',  desc: 'Automated target deviations.' },
  { key: 'updates',   title: 'System Updates',          desc: 'LedgerLens version releases.' },
  { key: 'ingest',    title: 'Data Ingestion Errors',   desc: 'Failures in syncing external feeds.' },
]

function NotifGrid() {
  const [notifs, setNotifs] = useSetting<Record<NotifKey, boolean>>('notifs', {
    anomaly: true, rebalance: false, updates: true, ingest: true,
  })

  function toggle(key: NotifKey) {
    setNotifs({ ...notifs, [key]: !notifs[key] })
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: '1fr 1fr', padding: 16 }}
    >
      {NOTIF_ITEMS.map((n) => {
        const on = notifs[n.key]
        return (
          <button
            key={n.key}
            type="button"
            onClick={() => toggle(n.key)}
            className="text-left flex items-start gap-2.5 rounded-lg cursor-pointer transition-all duration-150"
            style={{
              background: on ? 'var(--card-2)' : 'transparent',
              border: `1px solid ${on ? 'var(--border)' : 'var(--border-dim)'}`,
              padding: '12px 14px',
            }}
          >
            {/* Checkbox */}
            <span
              className="flex-shrink-0 flex items-center justify-center rounded"
              style={{
                marginTop: 2,
                width: 16, height: 16,
                border: `1.5px solid ${on ? 'var(--indigo)' : 'var(--border)'}`,
                background: on ? 'var(--indigo)' : 'transparent',
                color: 'var(--indigo-dark)',
                transition: 'all .15s',
              }}
            >
              {on && <CheckIcon />}
            </span>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{n.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{n.desc}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Nav sidebar item ───────────────────────────────────────────────────────────

// ── Billing section ───────────────────────────────────────────────────────────

function BillingSection({
  subscriptionStatus,
  accountType,
  organizationId,
}: {
  subscriptionStatus: string
  accountType: string
  organizationId: string | null
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgError, setOrgError] = useState('')

  const planLabel: Record<string, string> = {
    free: 'FREE PLAN', pro: 'PRO PLAN', teams: 'TEAMS PLAN',
  }
  const planVariant: Record<string, 'amber' | 'indigo' | 'green'> = {
    free: 'amber', pro: 'indigo', teams: 'green',
  }
  const planDesc: Record<string, string> = {
    free: 'You are on the Free tier.',
    pro: 'You are on LedgerLens Pro — unlimited cases and advanced analytics.',
    teams: 'You are on the Teams plan. Create an organization to manage employees.',
  }

  async function startCheckout(tier: 'pro' | 'teams') {
    setCheckoutLoading(true)
    try {
      const { checkout_url } = await createCheckoutSession(tier)
      window.location.href = checkout_url
    } catch {
      window.alert('Failed to start checkout. Check your API connection.')
      setCheckoutLoading(false)
    }
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim()) return
    setOrgLoading(true)
    setOrgError('')
    try {
      await createOrganization(orgName.trim())
      window.location.reload()
    } catch (err) {
      setOrgError(err instanceof Error ? err.message : 'Failed to create organization')
      setOrgLoading(false)
    }
  }

  return (
    <SettingsCard
      title="Subscription & Billing"
      sub="Manage your plan and payment methods."
      icon={<Sparkles size={16} />}
    >
      {/* Current plan row */}
      <SettingsRow>
        <LabelBlock
          label="Current Plan"
          desc={planDesc[subscriptionStatus] ?? planDesc.free}
        />
        <div className="flex items-center gap-3 flex-shrink-0">
          <Chip variant={planVariant[subscriptionStatus] ?? 'amber'}>
            {planLabel[subscriptionStatus] ?? 'FREE PLAN'}
          </Chip>
          {subscriptionStatus === 'free' && (
            <button
              type="button"
              disabled={checkoutLoading}
              className="h-9 px-4 rounded-lg font-mono text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--indigo)', color: 'var(--indigo-dark)', border: 'none' }}
              onClick={() => startCheckout('pro')}
            >
              {checkoutLoading ? 'Loading…' : 'Upgrade to Pro — $15/mo'}
            </button>
          )}
          {subscriptionStatus === 'pro' && (
            <button
              type="button"
              disabled={checkoutLoading}
              className="h-9 px-4 rounded-lg font-mono text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--green)', color: '#0d0d15', border: 'none' }}
              onClick={() => startCheckout('teams')}
            >
              {checkoutLoading ? 'Loading…' : 'Upgrade to Teams — $199/mo'}
            </button>
          )}
        </div>
      </SettingsRow>

      {/* Upgrade to Teams row (shown on free plan too) */}
      {subscriptionStatus === 'free' && (
        <SettingsRow>
          <LabelBlock
            label="Teams Plan"
            desc="For institutions. Includes custom case creation, employee management, and team dashboards."
          />
          <button
            type="button"
            disabled={checkoutLoading}
            className="h-9 px-4 rounded-lg font-mono text-sm cursor-pointer disabled:opacity-50 flex-shrink-0"
            style={{ background: 'var(--card-3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            onClick={() => startCheckout('teams')}
          >
            {checkoutLoading ? 'Loading…' : 'Get Teams — $199/mo'}
          </button>
        </SettingsRow>
      )}

      {/* Create organization (teams subscribers without an org yet) */}
      {subscriptionStatus === 'teams' && !organizationId && accountType !== 'institutional_admin' && (
        <div className="px-5 py-4 flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <LabelBlock
            label="Create Your Organization"
            desc="Set up your institutional workspace to add employees and custom cases."
          />
          <form onSubmit={handleCreateOrg} className="flex gap-2">
            <input
              className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--card-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Organization name (e.g. Acme Capital)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={orgLoading || !orgName.trim()}
              className="h-9 px-4 rounded-lg font-mono text-sm font-medium cursor-pointer disabled:opacity-50 flex-shrink-0"
              style={{ background: 'var(--indigo)', color: 'var(--indigo-dark)', border: 'none' }}
            >
              {orgLoading ? 'Creating…' : 'Create Org'}
            </button>
          </form>
          {orgError && <p className="text-sm m-0" style={{ color: 'var(--rose)' }}>{orgError}</p>}
        </div>
      )}

      {/* Already an org admin */}
      {accountType === 'institutional_admin' && (
        <SettingsRow>
          <LabelBlock
            label="Organization Admin"
            desc="You manage an institutional workspace. Go to the Admin panel to create cases and invite members."
          />
          <a
            href="/admin"
            className="h-9 px-4 rounded-lg font-mono text-sm cursor-pointer flex items-center flex-shrink-0"
            style={{ background: 'var(--card-2)', color: 'var(--text)', border: '1px solid var(--border)', textDecoration: 'none' }}
          >
            Open Admin →
          </a>
        </SettingsRow>
      )}
    </SettingsCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'general', label: 'General Settings',  icon: <SlidersIcon /> },
  { id: 'billing', label: 'Billing & Plans',   icon: <Sparkles size={16} /> },
  { id: 'api',     label: 'API Keys',           icon: <KeyIcon /> },
  { id: 'notifs',  label: 'Notifications',      icon: <BellIcon /> },
  { id: 'security',label: 'Security',           icon: <EyeIcon /> },
] as const
type SectionId = typeof NAV_SECTIONS[number]['id']

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth()
  const [section, setSection] = useState<SectionId>('general')

  // Preferences wired to localStorage
  const [demoMode, setDemoMode]     = useSetting('demo_mode', true)
  useSetting('voice_enabled', false)
  const [difficulty, setDifficulty] = useSetting('difficulty', 'Medium')
  const [currency, setCurrency]     = useSetting('currency', 'USD')

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1
          className="font-display font-bold m-0 mb-1.5 tracking-[-0.01em]"
          style={{ fontSize: 32, lineHeight: 1.1, color: 'var(--text)' }}
        >
          Settings
        </h1>
        <p className="text-[15px] m-0" style={{ color: 'var(--text-dim)' }}>
          Configure system behaviors and interfaces.
        </p>
      </div>

      {/* Two-column settings grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '200px 1fr', alignItems: 'start' }}>

        {/* ── Left nav ────────────────────────────────────────────────────── */}
        <div>
          <div className="cap mb-2" style={{ padding: '0 14px 8px' }}>CONFIGURATION</div>
          <nav className="flex flex-col gap-1">
            {NAV_SECTIONS.map((s) => {
              const active = section === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className="flex items-center gap-2.5 rounded-lg text-sm font-medium cursor-pointer text-left border-none transition-colors duration-150"
                  style={{
                    padding: '8px 14px',
                    background: active ? 'var(--card-2)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-dim)',
                    boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none',
                  }}
                >
                  <span style={{ color: active ? 'var(--indigo)' : 'var(--text-mute)', flexShrink: 0 }}>
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* ── Right content ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* ── GENERAL ────────────────────────────────────────────────────── */}
          {section === 'general' && (
            <SettingsCard
              title="Application Preferences"
              sub="Manage core system behaviors and interfaces."
              icon={<SlidersIcon />}
            >
              <SettingsRow>
                <LabelBlock
                  label="Demo Mode"
                  desc="Enable synthetic data for presentations. Disables case submission to production audit log."
                />
                <Toggle on={demoMode} onChange={setDemoMode} />
              </SettingsRow>
              <SettingsRow>
                <LabelBlock
                  label={
                    <>
                      Voice Feedback{' '}
                      <span className="cap" style={{ fontSize: 9, marginLeft: 6, color: 'var(--indigo)' }}>
                        ELEVENLABS
                      </span>
                    </>
                  }
                  desc="ElevenLabs voice synthesis is coming soon. Enable this to hear expert post-mortem feedback as audio after each evaluation."
                />
                <div className="flex items-center gap-2">
                  <span className="cap text-[9px] text-amber">COMING SOON</span>
                  <Toggle on={false} onChange={() => {}} />
                </div>
              </SettingsRow>
              <SettingsRow>
                <LabelBlock
                  label="Analysis Difficulty Preference"
                  desc="Adaptive selects difficulty based on rolling accuracy. Default for new analysts is Medium."
                />
                <Seg
                  value={difficulty}
                  options={['Easy', 'Medium', 'Hard', 'Adaptive']}
                  onChange={setDifficulty}
                />
              </SettingsRow>
              <div
                className="flex items-center justify-between gap-8 px-5 py-4"
              >
                <LabelBlock
                  label="Default workspace currency"
                  desc="Used for variance summaries and tabular formatting."
                />
                <Seg
                  value={currency}
                  options={['USD', 'EUR', 'GBP', 'JPY']}
                  onChange={setCurrency}
                />
              </div>
            </SettingsCard>
          )}

          {/* ── BILLING ─────────────────────────────────────────────────────── */}
          {section === 'billing' && (
            <BillingSection
              subscriptionStatus={user?.subscription_status ?? 'free'}
              accountType={user?.account_type ?? 'individual'}
              organizationId={user?.organization_id ?? null}
            />
          )}

          {/* ── API KEYS ───────────────────────────────────────────────────── */}
          {section === 'api' && (
            <SettingsCard
              title="API Management"
              sub="Configure external integrations and access tokens."
              icon={<KeyIcon />}
            >
              <ApiKeyRow
                label="OPENAI API KEY"
                storageKey="openai_api_key"
                badge={
                  <Chip variant="green">
                    <CheckIcon size={10} /> CONNECTED
                  </Chip>
                }
                badgeVariant="green"
                placeholder="sk-proj-…"
              />
              <div className="opacity-50 pointer-events-none">
                <ApiKeyRow
                  label="ELEVENLABS API KEY"
                  storageKey="elevenlabs_api_key"
                  badge={
                    <span className="flex items-center gap-1.5">
                      <Chip variant="amber">COMING SOON</Chip>
                    </span>
                  }
                  placeholder="Enter API key"
                />
              </div>
            </SettingsCard>
          )}

          {/* ── NOTIFICATIONS ───────────────────────────────────────────────── */}
          {section === 'notifs' && (
            <SettingsCard
              title="Notification Routing"
              sub="Select which alerts require immediate attention."
              icon={<BellIcon />}
            >
              <NotifGrid />
            </SettingsCard>
          )}

          {/* ── SECURITY ────────────────────────────────────────────────────── */}
          {section === 'security' && (
            <SettingsCard
              title="Danger Zone"
              sub="Irreversible actions and data management."
              icon={<AlertTriIcon />}
              danger
            >
              <SettingsRow>
                <LabelBlock
                  label="Export Profile Data"
                  desc="Download a complete JSON archive of your settings, histories, and custom configurations. This action is logged for compliance."
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono text-sm border flex-shrink-0 cursor-pointer"
                  style={{ background: 'var(--card-2)', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => {
                    const data = {
                      exported_at: new Date().toISOString(),
                      settings: Object.fromEntries(
                        Object.entries(localStorage).filter(([k]) => k.startsWith('ledgerlens:'))
                      ),
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'ledgerlens-export.json'; a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <DownloadIcon /> Export Data
                </button>
              </SettingsRow>
              <SettingsRow>
                <LabelBlock
                  label="Reset Skill Profile"
                  desc="Clears all accuracy history. Your peer comparison and Over-Trust Index will be recalibrated from zero."
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono text-sm border flex-shrink-0 cursor-pointer"
                  style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.4)' }}
                  onClick={() => {
                    if (window.confirm('Reset your skill profile? This cannot be undone.')) {
                      // In production this would hit DELETE /profile/history
                      window.location.href = '/dashboard'
                    }
                  }}
                >
                  Reset Profile
                </button>
              </SettingsRow>
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  )
}
