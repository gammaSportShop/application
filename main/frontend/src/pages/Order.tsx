import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api'
import Chip from '../components/ui/Chip'
import Breadcrumb from '../components/ui/Breadcrumb'
import { useNotify } from '../components/NotificationProvider'

type DemoState = {
    phase?: string
    progress?: string
}

export default function OrderPage() {
    const { id } = useParams()
    const [state, setState] = useState<DemoState | null>(null)
    const [schedule, setSchedule] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<Array<{ ts: number; type: string; message: string }>>([])
    const [teleporting, setTeleporting] = useState(false)
    const [showTeleportModal, setShowTeleportModal] = useState(false)
    const notify = useNotify()

    useEffect(() => {
        let t: any
        async function poll() {
            if (!id) return
            try {
                const r = await apiGet<{ state: DemoState; schedule: Record<string, string>; events: any[] }>(`/orders/${id}/tracking`)
                setState(r.state)
                setSchedule(r.schedule)
                setEvents(Array.isArray(r.events) ? r.events.slice().reverse() : [])
                setLoading(false)
            } catch {
                setLoading(false)
            }
        }
        poll()
        t = setInterval(poll, 2000)
        return () => { if (t) clearInterval(t) }
    }, [id])

    if (loading) return <div className="page-center"><span className="loading loading-spinner loading-lg" /></div>

    const phase = state?.phase || 'assembling'
    const hasDelay = events.some(e => e.type === 'delay')
    
    // Calculate step status
    const steps = [
        { 
            id: 'assembling', 
            name: 'Сборка заказа', 
            number: '1', 
            status: phase === 'assembling' ? 'active' : 'completed',
            description: 'Ваш заказ собирается на нашем складе'
        },
        { 
            id: 'to_distributor', 
            name: 'Доставка в центр логистики', 
            number: '2', 
            status: phase === 'to_distributor' ? 'active' : 
                    (phase === 'distributor_shipping' || phase === 'delivered') ? 'completed' : 'pending',
            description: 'Заказ в пути к центру логистики'
        },
        { 
            id: 'distributor_shipping', 
            name: 'Доставка', 
            number: '3', 
            status: phase === 'distributor_shipping' ? (hasDelay ? 'warning' : 'active') : 
                    phase === 'delivered' ? 'completed' : 'pending',
            description: 'Курьер доставляет заказ по указанному адресу'
        },
        { 
            id: 'delivered', 
            name: 'Получено', 
            number: '4', 
            status: phase === 'delivered' ? 'completed' : 'pending',
            description: 'Заказ успешно доставлен'
        }
    ]
    
    // Format date nicely
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ', ' + 
               date.toLocaleDateString([], {day: 'numeric', month: 'long'});
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Заказы', href: '/account' }, { label: `Заказ #${id}` }]} />
            <div className="card-panel p-8 rounded-box">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Заказ #{id}</h1>
                    <button 
                        className="btn btn-primary" 
                        disabled={teleporting || phase === 'delivered'} 
                        onClick={() => setShowTeleportModal(true)}
                    >
                        Телепортировать заказ
                    </button>
                </div>
                
                <div className="bg-bg-alt rounded-lg mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">Статус доставки</h2>
                        <Chip classes={phase==='delivered'?'bg-green-500/20 text-green-400 border border-green-500/40': hasDelay?'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40':'bg-primary/20 text-primary border border-primary/40'}>
                            {phase === 'assembling' ? 'СБОРКА' : 
                             phase === 'to_distributor' ? 'В ПУТИ' : 
                             phase === 'distributor_shipping' ? (hasDelay ? 'ЗАДЕРЖКА' : 'ДОСТАВКА') : 
                             'ДОСТАВЛЕН'}
                        </Chip>
                    </div>
                    
                    <div className="mt-8">
                        <div className="relative h-12">
                            <div className="absolute top-1/2 step-line step-line-inactive" style={{ left: '12.5%', width: '25%' }}></div>
                            <div className="absolute top-1/2 step-line step-line-inactive" style={{ left: '37.5%', width: '25%' }}></div>
                            <div className="absolute top-1/2 step-line step-line-inactive" style={{ left: '62.5%', width: '25%' }}></div>
                            <div className={`absolute top-1/2 step-line ${phase==='assembling'?'':'step-line-completed'}`} style={{ left: '12.5%', width: phase==='assembling'?'0%':'25%' }}></div>
                            <div className={`absolute top-1/2 step-line ${(phase==='to_distributor'||phase==='distributor_shipping'||phase==='delivered')?'step-line-completed':''}`} style={{ left: '37.5%', width: (phase==='distributor_shipping'||phase==='delivered')?'25%': (phase==='to_distributor'?'0%':'0%') }}></div>
                            <div className={`absolute top-1/2 step-line ${phase==='delivered'?'step-line-completed':''}`} style={{ left: '62.5%', width: phase==='delivered'?'25%':'0%' }}></div>
                            {phase!=='delivered' && (
                                <div className="absolute top-1/2 step-line step-line-active" style={{ left: phase==='assembling'?'12.5%': phase==='to_distributor'?'37.5%':'62.5%', width: '25%' }}></div>
                            )}
                            <div className="absolute inset-0 grid grid-cols-4 place-items-center z-10">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex flex-col items-center">
                                        <div className={`step-circle ${
                                            step.status === 'active' ? 'step-circle-active' : 
                                            step.status === 'completed' ? 'step-circle-completed' : 
                                            step.status === 'warning' ? 'step-circle-warning' :
                                            'step-circle-inactive'
                                        }`}>
                                            {step.number}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-4 text-center">
                            {steps.map((step) => (
                                <div key={step.id}>
                                    <div className={`text-sm font-medium ${step.status === 'pending' ? 'opacity-50' : ''}`}>{step.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-sm opacity-80 text-center mt-6">
                        {phase === 'assembling' ? 'Ваш заказ готовится к отправке' :
                         phase === 'to_distributor' ? 'Заказ в пути к центру логистики' :
                         phase === 'distributor_shipping' ? (hasDelay ? 'Возникла задержка при доставке' : 'Курьер доставляет ваш заказ') :
                         'Заказ успешно доставлен'}
                    </div>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">История заказа</h2>
                    <div className="space-y-4">
                        {events.map((event, idx) => (
                            <div key={idx} className="flex border-l-2 border-primary pl-4 py-1">
                                <div className="w-full">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{event.message}</span>
                                        <span className="text-sm opacity-70">{formatDate(event.ts)}</span>
                                    </div>
                                    {event.type === 'delay' && (
                                        <div className="text-sm text-yellow-400 mt-1">
                                            Ожидаемая задержка: 5-10 минут
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-bg-alt p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Информация о доставке</h3>
                    <div className="text-sm opacity-80">
                        <div>Примерное время сборки: {schedule.assemble || '—'} мин</div>
                        <div>Доставка в центр логистики: {schedule.toDist || '—'} мин</div>
                        <div>Доставка курьером: {schedule.ship || '—'} мин</div>
                        {hasDelay && <div className="text-yellow-400 mt-1">Обнаружена задержка в доставке</div>}
                    </div>
                </div>
            </div>
            
            {/* Teleport Modal */}
            {showTeleportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-bg-alt p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Телепортация заказа</h3>
                        <p className="mb-6">Мгновенная доставка вашего заказа с использованием нашей экспериментальной технологии телепортации.</p>
                        
                        <div className="bg-bg p-4 rounded-lg mb-6">
                            <div className="flex justify-between mb-2">
                                <span>Стоимость телепортации:</span>
                                <span className="font-bold">${Number(schedule.fee || 0).toFixed(2)}</span>
                            </div>
                            <div className="text-sm opacity-70">
                                Телепортация мгновенно доставит ваш заказ, минуя все этапы доставки.
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                className="btn" 
                                onClick={() => setShowTeleportModal(false)}
                            >
                                Отмена
                            </button>
                            <button 
                                className="btn btn-primary" 
                                disabled={teleporting} 
                                onClick={async () => {
                                    if (!id) return;
                                    setTeleporting(true);
                                    try {
                                        await apiPost(`/orders/${id}/teleport`, { feeConfirmed: true });
                                        notify.success('Заказ успешно телепортирован!');
                                        setShowTeleportModal(false);
                                    } catch (err) {
                                        notify.error('Ошибка телепортации');
                                    } finally {
                                        setTeleporting(false);
                                    }
                                }}
                            >
                                {teleporting ? 'Телепортация...' : 'Оплатить и телепортировать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


