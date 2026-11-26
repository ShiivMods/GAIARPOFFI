import { useId } from 'react'
import { assetUrl } from '../../utils/assets'

type Props = { x?: number; y?: number; radius: number; color: string; muted?: boolean }

// Shared star artwork for the sector and system layers. The source texture
// was extracted from the approved visual mockup; existing lore colors are retained.
const texture = assetUrl('/map-star-surface.webp')
function tintTable(channel: number, muted: boolean) {
  return [channel * .09, channel * .48, channel * .88, muted ? channel : 1]
    .map(value => value.toFixed(4)).join(' ')
}

export function StellarVisual({ x = 0, y = 0, radius, color, muted = false }: Props) {
  const id = 'stellar-' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const hex = /^#[0-9a-f]{6}$/i.test(color) ? color : '#f2d692'
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
  const clip = id + '-disc'
  const glow = id + '-corona'
  const tint = id + '-tint'
  const disc = id + '-base'
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none" aria-hidden="true">
      <defs>
        <clipPath id={clip}><circle r={radius} /></clipPath>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor={hex} stopOpacity=".22" />
          <stop offset="48%" stopColor={hex} stopOpacity={muted ? .15 : .6} />
          <stop offset="59%" stopColor={hex} stopOpacity={muted ? .07 : .26} />
          <stop offset="76%" stopColor={hex} stopOpacity=".07" />
          <stop offset="100%" stopColor={hex} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={disc}>
          <stop offset="0%" stopColor={muted ? hex : '#fff9eb'} />
          <stop offset="72%" stopColor={hex} />
          <stop offset="100%" stopColor={hex} stopOpacity=".8" />
        </radialGradient>
        <filter id={tint} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={tintTable(r, muted)} />
            <feFuncG type="table" tableValues={tintTable(g, muted)} />
            <feFuncB type="table" tableValues={tintTable(b, muted)} />
          </feComponentTransfer>
        </filter>
      </defs>
      <circle r={radius * 1.95} fill={`url(#${glow})`} />
      <circle r={radius} fill={`url(#${disc})`} />
      <g clipPath={`url(#${clip})`}>
        <image href={texture} x={-radius} y={-radius} width={radius * 2} height={radius * 2}
          preserveAspectRatio="xMidYMid slice" filter={`url(#${tint})`} />
      </g>
      <circle r={radius * .98} fill="none" stroke={hex} strokeWidth={radius * .045} opacity={muted ? .3 : .78} />
    </g>
  )
}
