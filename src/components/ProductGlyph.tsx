import { slugFor } from '@/lib/productVisual'

const STROKE = '#334155'
const ACCENT = '#f97316' // 橙色调，呼应 1688/售卖主题

function Art({ slug }: { slug: string }) {
  const s = { stroke: STROKE, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (slug) {
    case 'heater':
      return (
        <g {...s}>
          <rect x="20" y="14" width="24" height="34" rx="3" />
          <line x1="20" y1="22" x2="44" y2="22" />
          <line x1="20" y1="28" x2="44" y2="28" />
          <line x1="20" y1="34" x2="44" y2="34" />
          <line x1="20" y1="40" x2="44" y2="40" />
          <line x1="26" y1="48" x2="26" y2="52" />
          <line x1="38" y1="48" x2="38" y2="52" />
        </g>
      )
    case 'electric-blanket':
      return (
        <g {...s}>
          <rect x="14" y="18" width="36" height="28" rx="6" />
          <path d="M20 26 q6 -5 12 0 t12 0" />
          <path d="M20 34 q6 -5 12 0 t12 0" />
          <path d="M20 42 q6 -5 12 0 t12 0" />
        </g>
      )
    case 'hand-warmer':
      return (
        <g {...s}>
          <rect x="20" y="16" width="24" height="32" rx="8" />
          <circle cx="32" cy="28" r="4" />
          <line x1="32" y1="38" x2="32" y2="42" />
        </g>
      )
    case 'air-fryer':
      return (
        <g {...s}>
          <rect x="20" y="14" width="24" height="36" rx="5" />
          <rect x="24" y="18" width="16" height="8" rx="2" />
          <line x1="20" y1="34" x2="44" y2="34" />
          <circle cx="32" cy="42" r="3" />
        </g>
      )
    case 'humidifier':
      return (
        <g {...s}>
          <rect x="20" y="20" width="24" height="28" rx="5" />
          <path d="M26 20 q3 -6 0 -10" />
          <path d="M32 20 q3 -6 0 -10" />
          <path d="M38 20 q3 -6 0 -10" />
          <line x1="26" y1="30" x2="38" y2="30" />
        </g>
      )
    case 'air-purifier':
      return (
        <g {...s}>
          <rect x="21" y="12" width="22" height="40" rx="6" />
          <circle cx="32" cy="32" r="9" />
          <circle cx="32" cy="32" r="4" />
        </g>
      )
    case 'robot-vacuum':
      return (
        <g {...s}>
          <ellipse cx="32" cy="34" rx="20" ry="13" />
          <circle cx="32" cy="34" r="4" />
          <line x1="12" y1="34" x2="16" y2="34" />
          <line x1="48" y1="34" x2="52" y2="34" />
        </g>
      )
    case 'smart-plug':
      return (
        <g {...s}>
          <rect x="21" y="20" width="22" height="26" rx="4" />
          <line x1="27" y1="20" x2="27" y2="13" />
          <line x1="37" y1="20" x2="37" y2="13" />
          <circle cx="32" cy="33" r="3" />
        </g>
      )
    case 'thermostat':
      return (
        <g {...s}>
          <circle cx="32" cy="32" r="18" />
          <path d="M32 32 V22" stroke={ACCENT} />
          <circle cx="32" cy="32" r="2.5" fill={ACCENT} stroke="none" />
          <line x1="32" y1="48" x2="32" y2="52" />
        </g>
      )
    case 'led-strip':
      return (
        <g {...s}>
          <path d="M12 40 q8 -14 16 0 t16 0 t8 0" />
          <circle cx="20" cy="33" r="2.5" fill={ACCENT} stroke="none" />
          <circle cx="36" cy="33" r="2.5" fill={ACCENT} stroke="none" />
          <circle cx="50" cy="33" r="2.5" fill={ACCENT} stroke="none" />
        </g>
      )
    case 'night-light':
      return (
        <g {...s}>
          <circle cx="32" cy="32" r="11" fill="#fde68a" stroke={ACCENT} />
          <circle cx="32" cy="32" r="5" fill="#fff" stroke="none" />
          <line x1="32" y1="43" x2="32" y2="50" />
        </g>
      )
    case 'power-bank':
      return (
        <g {...s}>
          <rect x="20" y="14" width="24" height="36" rx="4" />
          <rect x="27" y="18" width="10" height="4" rx="1" />
          <path d="M33 30 l-5 8 h5 l-3 8" stroke={ACCENT} />
        </g>
      )
    case 'tracker':
      return (
        <g {...s}>
          <rect x="22" y="20" width="20" height="26" rx="5" />
          <circle cx="32" cy="16" r="5" />
          <circle cx="32" cy="33" r="4" />
        </g>
      )
    case 'laptop-stand':
      return (
        <g {...s}>
          <path d="M18 22 h28 l-4 6 h-20 z" />
          <path d="M22 28 l-3 14 h26 l-3 -14" />
          <line x1="14" y1="42" x2="50" y2="42" />
        </g>
      )
    case 'label-maker':
      return (
        <g {...s}>
          <rect x="22" y="18" width="20" height="16" rx="3" />
          <rect x="26" y="34" width="12" height="8" />
          <line x1="26" y1="42" x2="26" y2="48" />
          <line x1="38" y1="42" x2="38" y2="48" />
        </g>
      )
    case 'storage-box':
      return (
        <g {...s}>
          <path d="M16 28 h32 l-4 20 h-24 z" />
          <path d="M14 24 h36 l-2 4 h-32 z" />
          <line x1="24" y1="28" x2="22" y2="48" />
          <line x1="40" y1="28" x2="42" y2="48" />
        </g>
      )
    case 'bag-sealer':
      return (
        <g {...s}>
          <rect x="26" y="14" width="12" height="26" rx="4" />
          <circle cx="32" cy="22" r="3" />
          <line x1="26" y1="40" x2="38" y2="40" stroke={ACCENT} />
          <line x1="22" y1="46" x2="42" y2="46" />
        </g>
      )
    case 'nail-stickers':
      return (
        <g {...s}>
          <path d="M24 16 q8 0 8 10 q0 10 -8 10 q-8 0 -8 -10 q0 -10 8 -10 z" />
          <path d="M40 24 q8 0 8 10 q0 10 -8 10 q-8 0 -8 -10 q0 -10 8 -10 z" />
          <path d="M24 26 q8 4 0 8" />
        </g>
      )
    case 'collagen':
      return (
        <g {...s}>
          <rect x="26" y="24" width="12" height="22" rx="3" />
          <rect x="28" y="16" width="8" height="8" rx="2" />
          <path d="M32 16 v-4" />
          <line x1="29" y1="32" x2="35" y2="32" />
        </g>
      )
    case 'pet-feeder':
      return (
        <g {...s}>
          <path d="M20 18 h24 l-3 12 h-18 z" />
          <path d="M22 30 q10 6 20 0" />
          <path d="M18 38 q14 10 28 0 z" />
        </g>
      )
    case 'fitness':
      return (
        <g {...s}>
          <rect x="16" y="34" width="32" height="8" rx="4" />
          <line x1="22" y1="34" x2="22" y2="24" />
          <line x1="42" y1="34" x2="42" y2="24" />
          <circle cx="32" cy="18" r="4" />
          <path d="M28 22 h8 v8 h-8 z" />
        </g>
      )
    case 'umbrella':
      return (
        <g {...s}>
          <path d="M14 30 a18 18 0 0 1 36 0 z" />
          <line x1="32" y1="30" x2="32" y2="48" />
          <path d="M32 48 q0 4 -5 4" />
        </g>
      )
    case 'earbuds':
      return (
        <g {...s}>
          <circle cx="24" cy="26" r="6" />
          <path d="M24 32 v8 q0 4 -4 4" />
          <circle cx="40" cy="26" r="6" />
          <path d="M40 32 v8 q0 4 4 4" />
          <rect x="26" y="44" width="12" height="6" rx="3" />
        </g>
      )
    case 'coffee-maker':
      return (
        <g {...s}>
          <rect x="20" y="14" width="24" height="22" rx="3" />
          <path d="M24 36 h16 l-3 12 h-10 z" />
          <line x1="26" y1="20" x2="38" y2="20" />
          <circle cx="32" cy="26" r="2.5" fill={ACCENT} stroke="none" />
        </g>
      )
    case 'blender':
      return (
        <g {...s}>
          <path d="M24 14 h16 l-2 22 h-12 z" />
          <rect x="22" y="36" width="20" height="10" rx="3" />
          <line x1="26" y1="44" x2="38" y2="44" stroke={ACCENT} />
        </g>
      )
    case 'security-camera':
      return (
        <g {...s}>
          <path d="M18 24 a14 10 0 0 1 28 0 z" />
          <circle cx="32" cy="26" r="4" />
          <line x1="26" y1="34" x2="26" y2="44" />
          <line x1="38" y1="34" x2="38" y2="44" />
        </g>
      )
    default:
      return (
        <g {...s}>
          <rect x="18" y="18" width="28" height="28" rx="4" />
          <text x="32" y="38" textAnchor="middle" fontSize="16" fill={STROKE} stroke="none">?</text>
        </g>
      )
  }
}

export function ProductGlyph({ name, imageUrl, className }: { name: string; imageUrl?: string; className?: string }) {
  const slug = slugFor(name)
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={className} loading="lazy" />
  }
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={name}>
      <rect x="2" y="2" width="60" height="60" rx="12" fill="#f8fafc" />
      <Art slug={slug} />
    </svg>
  )
}
