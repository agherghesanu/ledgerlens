// Shared icons + small components for LedgerLens
// Stroke-based, 18px nominal, currentColor

const Icon = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 1.7, viewBox = "0 0 24 24", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d && <path d={d} />}
    {children}
  </svg>
);

const Icons = {
  Dashboard: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>,
  Cases: (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 11h18"/></Icon>,
  Profile: (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  History: (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v5l3 2"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.13 16.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.84a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.08 4.08l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  ArrowRight: (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></Icon>,
  TrendUp: (p) => <Icon {...p}><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></Icon>,
  Folder: (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></Icon>,
  Flame: (p) => <Icon {...p}><path d="M8 14a4 4 0 0 0 8 0c0-1.5-1-3-2-4 0 0-1 2-3 2 0 0 0-3 2-5-3 1-7 4-7 9 0 4 3 7 7 7 4 0 6-3 6-6"/></Icon>,
  Check: (p) => <Icon {...p}><path d="m20 6-11 11-5-5"/></Icon>,
  X: (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Star: ({size=14, filled=true}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2.3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.1l-5.8 3.1 1.1-6.5L2.6 9.1l6.5-.9z"/>
    </svg>
  ),
  AlertTri: (p) => <Icon {...p}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Icon>,
  Lines: (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h10"/></Icon>,
  Sliders: (p) => <Icon {...p}><path d="M4 6h10M16 6h4M4 12h4M10 12h10M4 18h13M19 18h1"/><circle cx="14" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>,
  EyeOff: (p) => <Icon {...p}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A11 11 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></Icon>,
  Key: (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2"/><path d="m18 5 3 3"/><path d="m15 8 3 3"/></Icon>,
  Download: (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></Icon>,
  Bot: (p) => <Icon {...p}><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 5v3"/><circle cx="12" cy="3" r="1"/><circle cx="8.5" cy="14" r="1" fill="currentColor"/><circle cx="15.5" cy="14" r="1" fill="currentColor"/></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></Icon>,
  Play: ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>,
  ChevronRight: (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 6h18M6 12h12M10 18h4"/></Icon>,
  Lightning: (p) => <Icon {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></Icon>,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>,
  Sparkles: (p) => <Icon {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  Volume: (p) => <Icon {...p}><path d="M11 5 6 9H2v6h4l5 4V5ZM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/></Icon>,
  Copy: (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
};

// Avatar fallback (initials)
const Avatar = ({ initials = "JD", size = 32 }) => (
  <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
    {initials}
  </div>
);

// Stars row
const Stars = ({ count = 4, total = 5 }) => (
  <div className="stars">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{ color: i < count ? 'var(--amber)' : 'var(--border)' }}>
        <Icons.Star filled />
      </span>
    ))}
  </div>
);

window.Icons = Icons;
window.Avatar = Avatar;
window.Stars = Stars;
