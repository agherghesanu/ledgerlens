// Avatar — initials fallback, exact mockup spec.
// Styled with Tailwind. `font-mono` + ring from card-3/border.
interface AvatarProps {
  /** Two-character initials shown as fallback */
  initials?: string
  /** Optional image src — renders <img> instead of initials */
  src?: string
  /** Size in px. Font scales at 36% of size per mockup. Default 32. */
  size?: number
}

export function Avatar({ initials = 'JD', src, size = 32 }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) }

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        width={size}
        height={size}
        className="rounded-full border border-border object-cover"
        style={style}
      />
    )
  }

  return (
    <div
      className="rounded-full bg-card-3 border border-border inline-flex items-center justify-center font-mono font-semibold text-text select-none flex-shrink-0"
      style={style}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

// Smoke: <Avatar initials="JD" /> <Avatar initials="AB" size={24} />
