import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'subtle'
    size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
    const base = 'btn'
    const v = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : ''
    const s = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'px-6 py-3' : ''
    return <button className={[base, v, s, className].filter(Boolean).join(' ')} {...rest} />
}


