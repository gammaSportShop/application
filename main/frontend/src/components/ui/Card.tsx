import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
    header?: ReactNode
    footer?: ReactNode
}

export default function Card({ header, footer, className = '', children, ...rest }: Props) {
    return (
        <div className={["card", "card-panel", className].join(' ')} {...rest}>
            <div className="card-body">
                {header}
                {children}
                {footer && <div className="card-actions">{footer}</div>}
            </div>
        </div>
    )
}


