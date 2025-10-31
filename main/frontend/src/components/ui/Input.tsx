import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label?: ReactNode
    hint?: ReactNode
    fieldSize?: 'sm' | 'md'
}

export default function Input({ label, hint, fieldSize = 'md', className = '', ...rest }: Props) {
    return (
        <label className="form-control w-full">
            {label && <div className="label"><span className="label-text">{label}</span></div>}
            <input className={[fieldSize === 'sm' ? 'input input-sm' : 'input', className].join(' ')} {...rest} />
            {hint && <div className="label"><span className="label-text opacity-70">{hint}</span></div>}
        </label>
    )
}


