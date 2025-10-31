import { type HTMLAttributes, type ReactNode } from 'react'

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    icon?: ReactNode
    isFilter?: boolean
    classes?: string
}

export default function Chip({ children, icon, isFilter = false, className = '', classes = '', ...props }: ChipProps) {
    const displayIcon = icon || null
    
    return (
        <div className={`inline-flex items-center gap-2 px-3 h-[35px] rounded-md text-xs font-medium uppercase tracking-wide ${classes} ${className}`} {...props}>
            {displayIcon}
            {children}
        </div>
    )
}


