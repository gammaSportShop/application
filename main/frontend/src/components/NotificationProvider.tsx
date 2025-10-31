import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type NotificationKind = 'success' | 'error' | 'info'

type NotificationItem = {
    id: number
    kind: NotificationKind
    title?: string
    message: string
    timeoutMs?: number
}

type NotifyApi = {
    notify: (n: Omit<NotificationItem, 'id'>) => void
    success: (message: string, title?: string) => void
    error: (message: string, title?: string) => void
    info: (message: string, title?: string) => void
}

const NotificationCtx = createContext<NotifyApi | null>(null)

export function useNotify(): NotifyApi {
    const ctx = useContext(NotificationCtx)
    if (!ctx) throw new Error('useNotify must be used within NotificationProvider')
    return ctx
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<NotificationItem[]>([])
    const seq = useRef(1)

    const remove = useCallback((id: number) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }, [])

    const notify = useCallback((n: Omit<NotificationItem, 'id'>) => {
        const id = seq.current++
        const item: NotificationItem = { id, ...n }
        setItems(prev => [...prev, item])
        const timeout = n.timeoutMs ?? 4000
        if (timeout > 0) {
            setTimeout(() => remove(id), timeout)
        }
    }, [remove])

    const api = useMemo<NotifyApi>(() => ({
        notify,
        success: (message, title) => notify({ kind: 'success', message, title }),
        error: (message, title) => notify({ kind: 'error', message, title }),
        info: (message, title) => notify({ kind: 'info', message, title })
    }), [notify])

    return (
        <NotificationCtx.Provider value={api}>
            {children}
            <div className="toast-container">
                        {items.map(i => (
                    <div key={i.id} className={`toast ${i.kind}`}>
                        <div className="toast-content">
                            {i.title ? <div className="toast-title uppercase tracking-wide">{i.title}</div> : null}
                            <div className={`toast-message ${i.kind==='success'?'text-green-300': i.kind==='error'?'text-red-300':'text-primary'}`}>{i.message}</div>
                        </div>
                        <button className="toast-close" onClick={() => remove(i.id)}>✕</button>
                    </div>
                ))}
            </div>
        </NotificationCtx.Provider>
    )
}
