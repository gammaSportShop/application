import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Notifications from './Notifications'
import Settings from './Settings'
import { apiGet } from '../lib/api'
import Breadcrumb from '../components/ui/Breadcrumb'

export default function AccountPage() {
    const [tab, setTab] = useState<'profile'|'notifications'|'settings'|'orders'>('profile')
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<any[]>([])

    useEffect(() => {
        const t = params.get('tab') as any
        if (t && ['profile','notifications','settings','orders'].includes(t)) setTab(t)
    }, [params])

    useEffect(() => {
        const current = params.get('tab')
        if (current !== tab) {
            const next = new URLSearchParams(params)
            if (tab === 'profile') next.delete('tab')
            else next.set('tab', tab)
            navigate(`/account?${next.toString()}`, { replace: true })
        }
    }, [tab])

    useEffect(() => {
        if (tab !== 'orders') return
        ;(async () => {
            try {
                const r = await apiGet<{ items: any[] }>(`/orders`)
                setOrders(r.items || [])
            } catch {}
        })()
    }, [tab])

    return (
        <div className="min-h-[60vh]">
            <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Дашборд' }]} />
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-4">Дашборд</h1>
            <div role="tablist" className="tabs tabs-boxed mb-6">
                <button role="tab" className={`tab ${tab==='profile'?'tab-active':''}`} onClick={()=>setTab('profile')}>Аккаунт</button>
                <button role="tab" className={`tab ${tab==='notifications'?'tab-active':''}`} onClick={()=>setTab('notifications')}>Уведомления</button>
                <button role="tab" className={`tab ${tab==='orders'?'tab-active':''}`} onClick={()=>setTab('orders')}>Заказы</button>
                <button role="tab" className={`tab ${tab==='settings'?'tab-active':''}`} onClick={()=>setTab('settings')}>Настройки</button>
            </div>

            {tab === 'profile' && (
                <div className="card-panel p-6 rounded-box">
                    <h2 className="text-xl font-bold mb-2">Профиль</h2>
                    <p className="opacity-80">Добро пожаловать в ваш дашборд. Здесь вы можете управлять аккаунтом, уведомлениями и заказами.</p>
                </div>
            )}

            {tab === 'notifications' && <Notifications />}

            {tab === 'settings' && <Settings />}

            {tab === 'orders' && (
                <div className="card-panel p-6 rounded-box">
                    <h2 className="text-xl font-bold mb-4">Мои заказы</h2>
                    {orders.length === 0 ? (
                        <div className="opacity-70">Заказы не найдены</div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(o => (
                                <a key={o.id} href={`/order/${o.id}`} className="flex items-center justify-between p-3 bg-bg-alt hover:bg-bg transition border-l-4 border-primary/60">
                                    <div className="font-medium">Заказ #{o.id}</div>
                                    <div className="text-sm opacity-70">${Number(o.total).toFixed(2)}</div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
