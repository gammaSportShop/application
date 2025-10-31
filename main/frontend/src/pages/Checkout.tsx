import { useEffect, useState } from 'react'
import { apiPost } from '../lib/api'
import Breadcrumb from '../components/ui/Breadcrumb'
import { getOrCreateCartId } from '../lib/cart'
import { useNotify } from '../components/NotificationProvider'

export default function CheckoutPage() {
    const [fullName, setFullName] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [orderId, setOrderId] = useState<number | null>(null)
    const notify = useNotify()

    useEffect(() => {}, [])

    const placingDisabled = submitting

    return (
        <div className="space-y-8">
            <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Корзина', href: '/cart' }, { label: 'Оформление' }]} />
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="card-panel p-6 rounded-box space-y-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">ДАННЫЕ ДЛЯ ЗАКАЗА</h1>
                    <label className="form-control">
                        <div className="label"><span className="label-text uppercase">Имя и фамилия</span></div>
                        <input className="input-text w-full" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Иван Иванов" />
                    </label>
                    <label className="form-control">
                        <div className="label"><span className="label-text uppercase">Адрес</span></div>
                        <input className="input-text w-full" value={address} onChange={e=>setAddress(e.target.value)} placeholder="г. Город, ул. Улица, д. 1" />
                    </label>
                    <label className="form-control">
                        <div className="label"><span className="label-text uppercase">Телефон</span></div>
                        <input className="input-text w-full" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+7 900 000-00-00" />
                    </label>
                    <label className="form-control">
                        <div className="label"><span className="label-text uppercase">Примечания</span></div>
                        <textarea className="textarea w-full" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Комментарии к заказу" />
                    </label>
                    <button className="btn btn-primary w-full" disabled={placingDisabled} onClick={async () => {
                        setSubmitting(true)
                        try {
                            const cartId = getOrCreateCartId()
                            const r = await apiPost(`/orders/demo/checkout`, {
                                cartId,
                                info: { fullName, address, phone, notes }
                            })
                            const id = (r as any)?.order?.id
                            if (id) {
                                setOrderId(id)
                                notify.success('Заказ создан')
                            }
                        } finally {
                            setSubmitting(false)
                        }
                    }}>СОЗДАТЬ ЗАКАЗ</button>
                </div>
                <div className="space-y-6">
                    <div className="card-panel p-6 rounded-box">
                        <h2 className="text-xl font-bold uppercase tracking-wide mb-2">ДАЛЬНЕЙШИЕ ДЕЙСТВИЯ</h2>
                        {orderId ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>ID заказа</span>
                                    <span>#{orderId}</span>
                                </div>
                                <a className="btn btn-secondary mt-2" href={`/order/${orderId}`}>Посмотреть отслеживание</a>
                                <a className="btn mt-2" href="/notifications">Открыть уведомления</a>
                            </div>
                        ) : (
                            <div className="opacity-70">Создайте заказ, чтобы продолжить</div>
                        )}
                    </div>
                </div>
            </div>

            
        </div>
    )
}


