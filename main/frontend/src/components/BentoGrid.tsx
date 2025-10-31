import type { HTMLAttributes } from 'react'

export function BentoGrid(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={["grid gap-4", props.className || '', "grid-cols-1 md:grid-cols-6"].join(' ')} />
}

export function BentoItem(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={["card-panel p-6", props.className || ''].join(' ')} />
}


