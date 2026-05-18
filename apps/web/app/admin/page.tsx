'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrganization,
  getCustomCases,
  createCustomCase,
  inviteMember,
  getOrgMemberScores,
  type CustomCaseCreate,
  type MemberScore,
} from '@/lib/api'

export default function AdminPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const orgId = user?.organization_id ?? ''

  const { data: org } = useQuery({
    queryKey: ['org', orgId],
    queryFn: () => getOrganization(orgId),
    enabled: Boolean(orgId),
  })

  const { data: customCases = [] } = useQuery({
    queryKey: ['custom-cases', orgId],
    queryFn: () => getCustomCases(orgId),
    enabled: Boolean(orgId),
  })

  const { data: memberScores = [] } = useQuery<MemberScore[]>({
    queryKey: ['member-scores', orgId],
    queryFn: () => getOrgMemberScores(orgId),
    enabled: Boolean(orgId),
  })

  const createCase = useMutation({
    mutationFn: (payload: CustomCaseCreate) => createCustomCase(orgId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-cases', orgId] }),
  })

  const invite = useMutation({
    mutationFn: (email: string) => inviteMember(orgId, email),
  })

  const [caseForm, setCaseForm] = useState<CustomCaseCreate>({
    title: '',
    category: 'Custom',
    difficulty: 'medium',
    scenario_text: '',
    correct_decision: 'escalate',
    correct_issue_summary: '',
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')

  if (!user || user.account_type !== 'institutional_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-dim text-sm">Access restricted to institutional admins.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Header */}
      <div>
        <p className="cap text-[10px] text-indigo mb-1">INSTITUTIONAL ADMIN</p>
        <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-[-0.01em] text-text m-0 mb-1.5">
          {org?.name ?? 'Your Organization'}
        </h1>
        <p className="text-[15px] text-text-dim m-0">
          Manage custom cases and team members.
        </p>
      </div>

      {/* Stats */}
      {org && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Custom Cases', value: customCases.length },
            { label: 'Max Members', value: org.max_members },
            { label: 'Plan', value: org.subscription_status.toUpperCase() },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="cap text-[10px] text-text-mute m-0 mb-1">{s.label}</p>
              <p className="font-display font-bold text-[24px] text-text m-0">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create custom case */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-[17px] text-text m-0">Add Custom Case</h3>
          <p className="text-sm text-text-dim m-0 mt-0.5">Create a scenario for your employees to review.</p>
        </div>
        <form
          className="flex flex-col gap-4 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            createCase.mutate(caseForm)
            setCaseForm({ title: '', category: 'Custom', difficulty: 'medium', scenario_text: '', correct_decision: 'escalate', correct_issue_summary: '' })
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="cap text-[10px] text-text-mute">TITLE</label>
              <input
                className="h-9 px-3 rounded-lg border border-border bg-card-2 text-sm text-text outline-none focus:border-indigo/60"
                value={caseForm.title}
                onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                placeholder="Q2 Revenue Recognition Review"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="cap text-[10px] text-text-mute">DIFFICULTY</label>
              <select
                className="h-9 px-3 rounded-lg border border-border bg-card-2 text-sm text-text outline-none font-mono"
                value={caseForm.difficulty}
                onChange={(e) => setCaseForm({ ...caseForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="cap text-[10px] text-text-mute">SCENARIO TEXT (shown to analysts)</label>
            <textarea
              className="px-3 py-2.5 rounded-lg border border-border bg-card-2 text-sm text-text outline-none focus:border-indigo/60 resize-none"
              rows={5}
              value={caseForm.scenario_text}
              onChange={(e) => setCaseForm({ ...caseForm, scenario_text: e.target.value })}
              placeholder="Describe the financial scenario, including any AI-generated analysis the analyst should review..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="cap text-[10px] text-text-mute">CORRECT ISSUE (hidden from analysts)</label>
            <textarea
              className="px-3 py-2.5 rounded-lg border border-border bg-card-2 text-sm text-text outline-none focus:border-indigo/60 resize-none"
              rows={3}
              value={caseForm.correct_issue_summary}
              onChange={(e) => setCaseForm({ ...caseForm, correct_issue_summary: e.target.value })}
              placeholder="What is the actual issue the AI got wrong? This is revealed after submission."
            />
          </div>

          <button
            type="submit"
            disabled={createCase.isPending}
            className="self-start h-9 px-5 rounded-lg bg-indigo text-[#0d0d15] font-mono text-sm font-semibold disabled:opacity-50"
          >
            {createCase.isPending ? 'Creating…' : 'Create Case'}
          </button>
          {createCase.isSuccess && (
            <p className="text-green text-sm m-0">Case created successfully.</p>
          )}
          {createCase.isError && (
            <p className="text-rose text-sm m-0">Failed to create case.</p>
          )}
        </form>
      </div>

      {/* Custom cases list */}
      {customCases.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display font-bold text-[17px] text-text m-0">Custom Cases ({customCases.length})</h3>
          </div>
          <div className="divide-y divide-border-dim">
            {customCases.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text m-0">{c.title}</p>
                  <p className="text-xs text-text-mute m-0">{c.category} · {c.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team performance */}
      {memberScores.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display font-bold text-[17px] text-text m-0">Team Performance</h3>
            <p className="text-sm text-text-dim m-0 mt-0.5">Member accuracy across all reviewed cases.</p>
          </div>
          <div className="divide-y divide-border-dim">
            {memberScores
              .sort((a, b) => (b.average_score ?? -1) - (a.average_score ?? -1))
              .map((m) => (
                <div key={m.user_id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text m-0">{m.full_name ?? m.email}</p>
                    <p className="text-xs text-text-mute m-0">{m.email} · {m.cases_reviewed} case{m.cases_reviewed !== 1 ? 's' : ''}</p>
                  </div>
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{
                      color: m.average_score === null ? 'var(--text-mute)'
                        : m.average_score >= 75 ? 'var(--green)'
                        : m.average_score >= 55 ? 'var(--amber)'
                        : 'var(--rose)',
                    }}
                  >
                    {m.average_score !== null ? `${m.average_score}%` : '—'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Invite member */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-[17px] text-text m-0">Invite Team Member</h3>
          <p className="text-sm text-text-dim m-0 mt-0.5">Members must already have a LedgerLens account.</p>
        </div>
        <div className="p-5 flex gap-3">
          <input
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-card-2 text-sm text-text outline-none focus:border-indigo/60"
            type="email"
            placeholder="analyst@yourfirm.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <button
            type="button"
            disabled={invite.isPending || !inviteEmail}
            className="h-9 px-4 rounded-lg border border-border bg-card-2 font-mono text-sm text-text-dim disabled:opacity-50"
            onClick={() => {
              invite.mutate(inviteEmail, {
                onSuccess: () => { setInviteMsg('Member added.'); setInviteEmail('') },
                onError: (e: unknown) => setInviteMsg(e instanceof Error ? e.message : 'Failed'),
              })
            }}
          >
            {invite.isPending ? 'Adding…' : 'Add Member'}
          </button>
        </div>
        {inviteMsg && <p className="px-5 pb-4 text-sm text-text-dim m-0">{inviteMsg}</p>}
      </div>
    </div>
  )
}
