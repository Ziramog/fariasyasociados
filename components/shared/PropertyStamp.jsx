'use client';
import { getStampDisplay } from '@/utils/propertyDisplay';

const STAMP_VARIANTS = {
  VENDIDO: {
    backdropClass: 'bg-black/25',
    stroke: 'rgba(255, 255, 255, 0.9)',
    innerStroke: 'rgba(255, 255, 255, 0.45)',
    fill: 'rgba(12, 12, 10, 0.24)',
    textColor: 'rgba(255, 255, 255, 0.94)',
    shadow: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.65))',
    rotation: '-14deg',
    dashed: false,
  },
  RESERVADO: {
    backdropClass: 'bg-black/15',
    stroke: 'rgba(253, 186, 116, 0.92)',
    innerStroke: 'rgba(254, 139, 1, 0.55)',
    fill: 'rgba(20, 14, 8, 0.28)',
    textColor: 'rgba(254, 215, 170, 0.96)',
    shadow: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.65))',
    rotation: '-12deg',
    dashed: true,
  },
};

const SIZE_CLASSES = {
  compact: 'w-[76%] max-w-[230px]',
  card: 'w-[74%] max-w-[290px]',
  hero: 'w-[72%] max-w-[380px]',
};

/**
 * Delicate, transparent diagonal SVG stamp overlay for VENDIDO/VENDIDA, ALQUILADO/ALQUILADA, and RESERVADO/RESERVADA.
 * Non-interactive (`pointer-events-none`) so underlying links, hover states, and gallery clicks remain active.
 */
export default function PropertyStamp({ property, status, label, size = 'card', withBackdrop = true, className = '' }) {
  const stamp = property ? getStampDisplay(property) : (status ? {
    status,
    variant: status === 'RESERVADO' ? 'RESERVADO' : 'VENDIDO',
    label: label || status,
  } : null);

  if (!stamp) return null;

  const variant = STAMP_VARIANTS[stamp.variant];
  if (!variant) return null;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.card;
  const isLongLabel = stamp.label.length >= 9;

  return (
    <div
      aria-label={`Propiedad ${stamp.label.toLowerCase()}`}
      className={`absolute inset-0 z-[15] pointer-events-none flex items-center justify-center overflow-hidden ${withBackdrop ? variant.backdropClass : ''} ${className}`}
    >
      <svg
        viewBox="0 0 360 112"
        className={`${sizeClass} h-auto select-none`}
        style={{
          transform: `rotate(${variant.rotation})`,
          filter: variant.shadow,
        }}
        role="img"
        aria-hidden="true"
      >
        {/* Outer translucent fill + crisp border */}
        <rect
          x="6"
          y="6"
          width="348"
          height="100"
          rx={variant.dashed ? 50 : 12}
          ry={variant.dashed ? 50 : 12}
          fill={variant.fill}
          stroke={variant.stroke}
          strokeWidth="2"
          strokeDasharray={variant.dashed ? '9 5' : undefined}
        />

        {/* Inner delicate hairline frame */}
        <rect
          x="13"
          y="13"
          width="334"
          height="86"
          rx={variant.dashed ? 43 : 7}
          ry={variant.dashed ? 43 : 7}
          fill="none"
          stroke={variant.innerStroke}
          strokeWidth="1"
        />

        {/* Minimalist corner accents for VENDIDO / ALQUILADO */}
        {!variant.dashed && (
          <g stroke={variant.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75">
            <path d="M 22 30 L 22 21 L 31 21" />
            <path d="M 329 21 L 338 21 L 338 30" />
            <path d="M 22 82 L 22 91 L 31 91" />
            <path d="M 329 91 L 338 91 L 338 82" />
          </g>
        )}

        {/* Centered clean uppercase typography */}
        <text
          x="180"
          y="58"
          textAnchor="middle"
          dominantBaseline="central"
          fill={variant.textColor}
          fontFamily="var(--font-heading), system-ui, -apple-system, sans-serif"
          fontSize={isLongLabel ? '33' : '38'}
          fontWeight="500"
          letterSpacing={isLongLabel ? '7' : '9'}
        >
          {stamp.label}
        </text>
      </svg>
    </div>
  );
}
