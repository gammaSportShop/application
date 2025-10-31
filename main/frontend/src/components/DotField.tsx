import { useMemo } from 'react'

type DotFieldProps = {
    className?: string
}

const DOT_PATTERNS = [
    { 
        spacing: 32, 
        size: 6, 
        color: 'rgba(37, 99, 235, 0.6)', 
        rotation: 0,
        background: 'radial-gradient(circle at 16px 16px, rgba(37, 99, 235, 0.6) 3px, transparent 3px)'
    },
    { 
        spacing: 28, 
        size: 5, 
        color: 'rgba(239, 68, 68, 0.5)', 
        rotation: 15,
        background: 'radial-gradient(circle at 14px 14px, rgba(239, 68, 68, 0.5) 2.5px, transparent 2.5px)'
    },
    { 
        spacing: 36, 
        size: 7, 
        color: 'rgba(59, 130, 246, 0.4)', 
        rotation: 30,
        background: 'radial-gradient(circle at 18px 18px, rgba(59, 130, 246, 0.4) 3.5px, transparent 3.5px)'
    },
    { 
        spacing: 30, 
        size: 6, 
        color: 'rgba(249, 115, 22, 0.5)', 
        rotation: 45,
        background: 'radial-gradient(circle at 15px 15px, rgba(249, 115, 22, 0.5) 3px, transparent 3px)'
    },
    { 
        spacing: 34, 
        size: 8, 
        color: 'rgba(34, 197, 94, 0.4)', 
        rotation: 60,
        background: 'radial-gradient(circle at 17px 17px, rgba(34, 197, 94, 0.4) 4px, transparent 4px)'
    },
    { 
        spacing: 26, 
        size: 9, 
        color: 'rgba(168, 85, 247, 0.3)', 
        rotation: 75,
        background: 'radial-gradient(circle at 13px 13px, rgba(168, 85, 247, 0.3) 4.5px, transparent 4.5px)'
    }
]

export default function DotField({ className = '' }: DotFieldProps) {
    const pattern = useMemo(() => {
        return DOT_PATTERNS[Math.floor(Math.random() * DOT_PATTERNS.length)]
    }, [])

    return (
        <div 
            className={className}
            style={{
                backgroundImage: pattern.background,
                backgroundSize: `${pattern.spacing}px ${pattern.spacing}px`,
                backgroundPosition: '0 0',
                backgroundRepeat: 'repeat',
                transform: `rotate(${pattern.rotation}deg)`,
                transformOrigin: 'center',
                width: '200%',
                height: '200%',
                top: '-50%',
                right: '-50%',
            }}
        />
    )
}


