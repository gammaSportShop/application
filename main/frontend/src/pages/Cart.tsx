import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { getOrCreateCartId, listCart, setCartItemQuantity, type CartItem } from '../lib/cart'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { CreditCard, Trash2 } from 'lucide-react'
import ImageWithPlaceholder from '../components/ImageWithPlaceholder'
import { useNotify } from '../components/NotificationProvider'

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<Record<number, any>>({})
    const notify = useNotify()

	useEffect(() => {
		let mounted = true
		;(async () => {
			const id = getOrCreateCartId()
			const cart = await listCart(id)
			const ids = cart.items.map((x: CartItem) => x.productId)
			let byId: Record<number, any> = {}
			if (ids.length > 0) {
				const r = await apiGet<{ items: any[] }>(`/catalog/products?pageSize=100&ids=${ids.join(',')}`)
				byId = Object.fromEntries(r.items.map((p:any)=>[p.id,p]))
			}
			if (mounted) {
				setItems(cart.items)
				setProducts(byId)
				setLoading(false)
			}
		})()
		return () => { mounted = false }
	}, [])

	const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
    const totalPrice = useMemo(() => items.reduce((s, i) => s + i.quantity * (products[i.productId]?.price || 0), 0), [items, products])

	if (loading) return <div className="page-center"><span className="loading loading-spinner loading-lg" /></div>

    return (
        <div className="space-y-8">
            <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
            <h1 className="text-3xl font-bold uppercase tracking-wide">КОРЗИНA</h1>
			{items.length === 0 ? (
				<div className="alert">
					<span>Ваша корзина пуста.</span>
				</div>
			) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((i, idx) => {
                            const p = products[i.productId]
                            return (
                                <div key={idx} className="flex items-center justify-between card-panel p-4 rounded-box">
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 bg-bg-inner rounded overflow-hidden flex-shrink-0">
                                            <ImageWithPlaceholder src={p?.images?.[0]?.url} />
                                        </div>
                                        <div>
                                            <Link to={`/product/${p?.slug}`} className="font-semibold hover:text-primary transition">{p?.name || `Product #${i.productId}`}</Link>
                                            <div className="text-sm opacity-70">${p?.price ?? '—'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-sm btn-ghost" onClick={async () => {
                                                const id = await getOrCreateCartId()
                                                const next = Math.max(0, i.quantity - 1)
                                                await setCartItemQuantity(id, i.productId, next)
                                                setItems((prev) => prev.map((x, k) => k === idx ? { ...x, quantity: next } : x).filter((x) => x.quantity > 0))
                                            }}>−</button>
                                            <input className="input-text input-sm w-16 text-center" type="number" min={0} value={i.quantity} onChange={async (e) => {
                                                const id = await getOrCreateCartId()
                                                const next = Math.max(0, Number(e.target.value))
                                                await setCartItemQuantity(id, i.productId, next)
                                                setItems((prev) => prev.map((x, k) => k === idx ? { ...x, quantity: next } : x).filter((x) => x.quantity > 0))
                                            }} />
                                            <button className="btn btn-sm btn-ghost" onClick={async () => {
                                                const id = await getOrCreateCartId()
                                                const next = i.quantity + 1
                                                await setCartItemQuantity(id, i.productId, next)
                                                setItems((prev) => prev.map((x, k) => k === idx ? { ...x, quantity: next } : x))
                                            }}>+</button>
                                        </div>
                                        <button className="btn btn-sm btn-ghost text-red-500" onClick={async () => {
                                            const id = await getOrCreateCartId()
                                            await setCartItemQuantity(id, i.productId, 0)
                                            setItems((prev) => prev.filter((_, k) => k !== idx))
                                            notify.info('Товар удален из корзины')
                                        }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="card-panel p-6 rounded-box space-y-4 lg:sticky lg:top-6">
                        <h2 className="text-xl font-bold uppercase">СУММА</h2>
                        <div className="flex justify-between">
                            <span>{totalItems} товаров</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Всего</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary w-full" onClick={async () => {
                            const id = await getOrCreateCartId()
                            try {
                                const r = await apiPost(`/orders/demo/checkout`, {
                                    cartId: id,
                                    info: { fullName: 'Demo User', address: 'Demo Address', phone: '+7 900 000-00-00', notes: 'demo' }
                                })
                                const oid = (r as any)?.order?.id
                                if (oid) {
                                    notify.success('Заказ создан')
                                    window.location.href = `/order/${oid}`
                                }
                            } catch {}
                        }}>
                            <CreditCard size={16} className="mr-2" />
                            ОФОРМИТЬ ЗАКАЗ
                        </button>
                    </div>
                </div>
			)}
		</div>
	)
}


