import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'
import { Link } from 'react-router-dom'

type Notification = {
    id: number;
    kind: 'success' | 'error' | 'info';
    title?: string;
    message: string;
    meta?: {
        orderId?: number;
        [key: string]: any;
    };
    timestamp?: number;
}

export default function Notifications() {
    const [items, setItems] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let t: any
        async function load() {
            try {
                const r = await apiGet<{ items: Notification[] }>(`/auth/notifications/list`)
                if (Array.isArray(r.items)) {
                    const withTimestamps = r.items.map(item => ({
                        ...item,
                        timestamp: item.timestamp || Date.now()
                    }));
                    setItems(withTimestamps);
                }
            } finally {
                setLoading(false)
            }
        }
        load()
        t = setInterval(load, 8000)
        return () => { if (t) clearInterval(t) }
    }, [])

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ', ' + 
               date.toLocaleDateString([], {day: 'numeric', month: 'long'});
    }

    const groupedByDate = items.reduce((groups: Record<string, Notification[]>, item) => {
        const date = new Date(item.timestamp || Date.now());
        const dateKey = date.toLocaleDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
    );

    const kindClasses = (k: Notification['kind']) => {
        if (k === 'success') return 'bg-green-500/10 border border-green-500/40 text-green-300';
        if (k === 'error') return 'bg-red-500/10 border border-red-500/40 text-red-300';
        return 'bg-primary/10 border border-primary/30 text-primary';
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card-panel p-8 rounded-box">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Центр уведомлений</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 opacity-70">
                        <p className="text-lg">У вас пока нет уведомлений</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map(dateKey => (
                            <div key={dateKey}>
                                <h2 className="font-medium text-lg mb-4 border-b border-white/10 pb-2">
                                    {new Date(dateKey).toLocaleDateString([], {day: 'numeric', month: 'long', year: 'numeric'})}
                                </h2>
                                <div className="space-y-4">
                                    {groupedByDate[dateKey].map((notification) => (
                                        <div 
                                            key={notification.id} 
                                            className={`p-4 rounded-lg ${kindClasses(notification.kind)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium uppercase tracking-wide">{notification.title || 'Уведомление'}</h3>
                                                        <span className="text-xs opacity-70">
                                                            {formatDate(notification.timestamp || Date.now())}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-white/90">{notification.message}</p>
                                                    {notification.meta?.orderId && (
                                                        <div className="mt-3">
                                                            <Link 
                                                                to={`/order/${notification.meta.orderId}`}
                                                                className="inline-flex items-center gap-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary px-3 h-8 rounded-md border border-primary/40 transition-colors"
                                                            >
                                                                <span>Открыть заказ #{notification.meta.orderId}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M5 12h14"></path>
                                                                    <path d="m12 5 7 7-7 7"></path>
                                                                </svg>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}


