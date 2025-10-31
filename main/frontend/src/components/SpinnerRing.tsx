import { useId, type CSSProperties } from 'react'

type SpinnerRingProps = {
    size?: number
    thickness?: number
    color?: 'primary' | 'warning'
    className?: string
    speedSec?: number
}

export default function SpinnerRing({ size = 48, thickness = 4, color = 'primary', className = '', speedSec = 1.1 }: SpinnerRingProps) {
    const id = useId().replace(/[:]/g, '')
    const r = (size - thickness) / 2
    const circumference = 2 * Math.PI * r
    const dash = Math.max(20, Math.min(circumference * 0.32, circumference - 12))
    const gap = circumference - dash
    const g1 = color === 'warning' ? '#fde047' : '#93c5fd'
    const g2 = color === 'warning' ? '#facc15' : '#60a5fa'
    const g3 = color === 'warning' ? '#f59e0b' : '#3b82f6'
    const filterShadow = color === 'warning' ? 'drop-shadow(0 0 6px rgba(234,179,8,0.45))' : 'drop-shadow(0 0 6px rgba(59,130,246,0.45))'
    const style: CSSProperties = { animation: `spin-rotate ${speedSec}s linear infinite`, filter: filterShadow }

    return (
        <svg
            className={className}
            style={style}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            aria-hidden="true"
            shapeRendering="geometricPrecision"
        >
            <defs>
                <linearGradient id={`grad${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={g1} stopOpacity="0" />
                    <stop offset="70%" stopColor={g2} stopOpacity="1" />
                    <stop offset="100%" stopColor={g3} stopOpacity="1" />
                </linearGradient>
            </defs>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={`url(#grad${id})`}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}


