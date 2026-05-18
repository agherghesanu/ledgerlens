'use client'

import { StarIcon } from '@/components/icons/star'

interface StarsProps {
  /** How many stars are filled. */
  count?: number
  /** Total number of stars. Default 5. */
  total?: number
}

/**
 * Stars row — renders `total` stars, first `count` filled in amber,
 * rest in border color. Matches mockup Stars component exactly.
 */
export function Stars({ count = 4, total = 5 }: StarsProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{ color: i < count ? 'var(--amber)' : 'var(--border)' }}
        >
          <StarIcon size={14} filled />
        </span>
      ))}
    </div>
  )
}

// Smoke: <Stars count={4} total={5} /> <Stars count={2} />
