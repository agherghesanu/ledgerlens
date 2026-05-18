'use client'

// AudioPlayer — feature-flagged behind NEXT_PUBLIC_ENABLE_VOICE.
// When the flag is false (default), renders a scaffolded "coming soon" card.
// Phase 12: wire to ElevenLabs TTS API when flag is true.
//
// Usage: <AudioPlayer text={score.expert_would_do} />

const VOICE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true'

interface AudioPlayerProps {
  /** The text to synthesise (expert_would_do field). Unused until Phase 12. */
  text: string
}

export function AudioPlayer({ text: _text }: AudioPlayerProps) {
  if (!VOICE_ENABLED) {
    return <AudioPlayerDisabled />
  }

  // Phase 12: mount ElevenLabs player here.
  // Will need: elevenLabsApiKey (from settings), voiceId, text prop.
  return <AudioPlayerActive />
}

// ── Disabled state ─────────────────────────────────────────────────────────────

function AudioPlayerDisabled() {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b border-border"
        style={{ padding: '14px 16px' }}
      >
        <h3
          className="font-display font-bold m-0"
          style={{ fontSize: 15, color: 'var(--text)' }}
        >
          Listen to Expert Feedback
        </h3>
        <span
          className="cap"
          style={{ fontSize: 10, color: 'var(--text-mute)' }}
        >
          COMING SOON
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Waveform placeholder — matches mockup audio-card visually */}
        <div
          className="flex items-center gap-3 rounded-[10px] border border-border"
          style={{
            background: 'var(--card-2)',
            padding: '14px 16px',
          }}
        >
          {/* Play button (disabled) */}
          <button
            disabled
            aria-label="Voice feedback coming soon"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 opacity-40 cursor-not-allowed border-none"
            style={{ background: 'var(--indigo)', color: 'var(--indigo-dark)' }}
          >
            {/* Play icon */}
            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          {/* Static decorative waveform bars */}
          <div className="flex-1 flex items-center gap-[2px]" style={{ height: 24 }}>
            {Array.from({ length: 38 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.6)) * 16
              return (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 2,
                    height: h,
                    background: 'var(--text-dim)',
                    borderRadius: 1,
                    opacity: 0.25,
                  }}
                />
              )
            })}
          </div>

          <span
            className="font-mono text-[11px] tracking-[0.04em] flex-shrink-0"
            style={{ color: 'var(--text-mute)' }}
          >
            —:—
          </span>
        </div>

        <div
          className="mt-2.5 text-xs"
          style={{ color: 'var(--text-mute)' }}
        >
          Voice narration via ElevenLabs · Enable in Settings when available.
        </div>
      </div>
    </div>
  )
}

// ── Active state (Phase 12 placeholder) ───────────────────────────────────────

function AudioPlayerActive() {
  // TODO Phase 12: implement ElevenLabs streaming player
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div className="px-4 py-3.5 border-b border-border">
        <h3 className="font-display font-bold text-sm m-0" style={{ color: 'var(--text)' }}>
          Listen to Expert Feedback
        </h3>
      </div>
      <div className="p-4">
        <p className="text-xs" style={{ color: 'var(--text-mute)' }}>
          ElevenLabs player not yet wired (Phase 12).
        </p>
      </div>
    </div>
  )
}
