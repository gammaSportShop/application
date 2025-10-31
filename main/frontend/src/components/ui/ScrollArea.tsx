import { forwardRef } from 'react'
import type { ReactNode } from 'react'

interface ScrollAreaProps {
    children: ReactNode
    className?: string
    maxHeight?: string
    variant?: 'default' | 'filters' | 'catalog'
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ children, className = '', maxHeight, variant = 'default' }, ref) => {
        const getVariantClasses = () => {
            switch (variant) {
                case 'filters':
                    return 'scroll-area-filters'
                case 'catalog':
                    return 'scroll-area-catalog'
                default:
                    return 'scroll-area'
            }
        }

        return (
            <div
                ref={ref}
                className={`${getVariantClasses()} ${className}`}
                style={{ maxHeight }}
            >
                {children}
            </div>
        )
    }
)

ScrollArea.displayName = 'ScrollArea'

export default ScrollArea
