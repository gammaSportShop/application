import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { apiGet } from '../lib/api'
import { isInWishlist, toggleWishlist } from '../lib/wishlist'
import ImageWithPlaceholder from '../components/ImageWithPlaceholder'
import ProductCard from '../components/ProductCard.tsx'
import { ShoppingCart, Heart, Share2, Star, Plus, Minus } from 'lucide-react'
import { getWishlistIds, toggleWishlist as toggleWishlistLib } from '../lib/wishlist.ts'
import { useNotify } from '../components/NotificationProvider'
import { useCart } from '../lib/CartContext.tsx'

export default function ProductPage() {
	const { slug } = useParams()
	const [product, setProduct] = useState<any>(null)
	const [selectedSize, setSelectedSize] = useState('')
	const [selectedColor, setSelectedColor] = useState('')
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
    const [randomProducts, setRandomProducts] = useState<any[]>([])
    const [randomProductsPage, setRandomProductsPage] = useState(1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [wish, setWish] = useState(false)
    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '' })
    const [hasUserReviewed, setHasUserReviewed] = useState(false)
    const loadMoreRef = useRef(null)
    const notify = useNotify()
    const { getItemQuantity, updateItemQuantity, isUpdating } = useCart()

    const quantityInCart = product ? getItemQuantity(product.id) : 0
    const [qty, setQty] = useState(1)
	
    useEffect(() => {
		if (!slug) return
		window.scrollTo({ top: 0, behavior: 'smooth' })
		apiGet<{ product: any }>(`/catalog/products/${slug}`).then((r) => setProduct(r.product)).catch(() => {})
		apiGet<{ items: any[] }>(`/catalog/products`).then((r) => {
			const shuffled = r.items.sort(() => Math.random() - 0.5)
			setRecommendedProducts(shuffled.slice(0, 6))
		}).catch(() => {})
        apiGet<{ items: any[] }>(`/catalog/products?page=1&pageSize=6`).then(r => setRandomProducts(r.items)).catch(() => {})
        setWishlistIds(getWishlistIds())
	}, [slug])

    useEffect(() => {
        if (product?.id) setWish(isInWishlist(product.id))
    }, [product])

    useEffect(() => {
        if (!slug) return
        apiGet<{ product: any }>(`/catalog/products/${slug}`).then(r => {
            const rv = Array.isArray(r.product?.reviews) ? r.product.reviews : []
            setReviews(rv)
            
            const authToken = localStorage.getItem('auth_token')
            if (authToken) {
                const userHasReviewed = rv.some((review: any) => review.userId === JSON.parse(atob(authToken.split('.')[1])).id)
                setHasUserReviewed(userHasReviewed)
            }
        }).catch(()=>{})
    }, [slug])

    const fetchMoreProducts = () => {
        if (isLoadingMore) return
        setIsLoadingMore(true)
        apiGet<{ items: any[] }>(`/catalog/products?page=${randomProductsPage + 1}&pageSize=6`)
            .then(r => {
                const shuffled = r.items.sort(() => Math.random() - 0.5)
                setRandomProducts(prev => [...prev, ...shuffled])
                setRandomProductsPage(prev => prev + 1)
            })
            .finally(() => setIsLoadingMore(false))
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    fetchMoreProducts()
                }
            },
            { threshold: 1.0 }
        )

        const currentRef = loadMoreRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [loadMoreRef, fetchMoreProducts])
	
	if (!product) return <div className="loading loading-spinner loading-lg" />
	
	const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
	const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray']
	
	return (
		<>
			<div className="max-w-6xl mx-auto">
			<Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/catalog' }, { label: product?.name || 'Товар' }]} />
			<div className="grid md:grid-cols-2 gap-8 items-start">
				<div className="flex justify-center">
					<div className="aspect-square bg-bg-inner rounded-box overflow-hidden max-h-[90vh] w-full max-w-xl">
						<ImageWithPlaceholder src={product.images?.[0]?.url} />
					</div>
				</div>
				
				<div className="space-y-6">
					<div>
					<h1 className="text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
						{product.tag && (
							<span className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow ${
								product.tag === 'СКИДКА' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
								product.tag === 'СУПЕР СКИДКА' ? 'bg-red-600/20 text-red-400 border border-red-600/40' :
								product.tag === 'НОВИНКА' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
								product.tag === 'ПРЕМИУМ' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
								'bg-primary/20 text-primary border border-primary/40'
							}`}>{product.tag}</span>
						)}
						<span>{product.name}</span>
					</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        {typeof product.originalPrice === 'number' && product.originalPrice > product.price && (
                            <>
                                <span className="text-sm line-through opacity-60">${product.originalPrice}</span>
                                <span className="text-sm px-2 py-1 rounded-md border border-primary/40 text-primary bg-primary/10 font-semibold">-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                            </>
                        )}
                    </div>
					{typeof product.rating === 'number' && product.rating > 0 && (
						<div className="flex items-center gap-2 mt-2">
							<div className="flex items-center gap-1">
								{Array.from({ length: 5 }).map((_, i) => {
									const r = product.rating || 0
									const color = r >= 4 ? 'text-green-500' : r >= 2 ? 'text-yellow-400' : 'text-red-500'
									const filled = i < Math.round(r)
									return (
										<Star key={i} size={16} className={`${filled ? `${color} fill-current` : 'text-gray-400'}`} />
									)
								})}
							</div>
							<span className="text-lg font-semibold">{product.rating.toFixed(1)}</span>
							<span className="text-sm opacity-70">({Array.isArray(product.reviews) ? product.reviews.length : product.reviewsCount || 0} отзывов)</span>
						</div>
					)}
					</div>
                    <div className="space-y-4">
						<h3 className="text-lg font-semibold uppercase">ОПИСАНИЕ</h3>
						<p className="opacity-80">{product.description}</p>
					</div>
					
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-semibold uppercase mb-3">РАЗМЕР</h3>
							<div className="flex gap-2">
								{sizes.map(size => (
									<button
										key={size}
										onClick={() => setSelectedSize(size)}
										className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-ghost'}`}
									>
										{size}
									</button>
								))}
							</div>
						</div>
						
						<div>
							<h3 className="text-lg font-semibold uppercase mb-3">ЦВЕТ</h3>
							<div className="flex gap-2">
								{colors.map(color => (
									<button
										key={color}
										onClick={() => setSelectedColor(color)}
										className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-ghost'}`}
									>
										{color}
									</button>
								))}
							</div>
						</div>
						
						<div className="flex gap-4">
							{quantityInCart > 0 ? (
								<div className="flex items-center border-primary rounded-md flex-1">
									<button
										onClick={() => updateItemQuantity(product.id, quantityInCart - 1)}
										className="btn btn-ghost p-3"
										disabled={isUpdating}
									>
										<Minus size={16} />
									</button>
									<span className="font-bold text-primary w-12 text-center">{quantityInCart}</span>
									<button
										onClick={() => updateItemQuantity(product.id, quantityInCart + 1)}
										className="btn btn-ghost p-3"
										disabled={isUpdating}
									>
										<Plus size={16} />
									</button>
								</div>
							) : (
								<>
									<div className="flex items-center rounded-md">
										<button
											onClick={() => setQty(Math.max(1, qty - 1))}
											className="btn btn-ghost p-3"
											disabled={isUpdating}
										>
											<Minus size={16} />
										</button>
										<span className="font-bold w-12 text-center">{qty}</span>
										<button
											onClick={() => setQty(qty + 1)}
											className="btn btn-ghost p-3"
											disabled={isUpdating}
										>
											<Plus size={16} />
										</button>
									</div>
									<button
										onClick={async () => {
											if (!localStorage.getItem('auth_token')) {
												window.location.href = '/profile'
												return
											}
											await updateItemQuantity(product.id, qty)
											notify.success('Товар добавлен в корзину')
										}}
										className={`btn btn-primary flex-1 ${isUpdating ? 'opacity-80' : ''}`}
										disabled={isUpdating}
									>
										<ShoppingCart size={16} className="mr-2" />
										{isUpdating ? 'ДОБАВЛЕНИЕ…' : 'ДОБАВИТЬ В КОРЗИНУ'}
									</button>
								</>
							)}
							<button
								className={`btn btn-ghost p-3 ${wish ? 'text-primary border-primary' : ''}`}
								onClick={() => {
									if (!product?.id) return
									const next = toggleWishlist(product.id)
									setWish(next.includes(product.id))
								}}
							>
								<Heart size={16} />
							</button>
							<button className="btn btn-ghost p-3">
								<Share2 size={16} />
							</button>
						</div>

                        {Array.isArray(product.attributes) && product.attributes.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold uppercase mb-3 opacity-70">Теги</h3>
								<div className="flex flex-wrap gap-2">
									{product.attributes.map((a: any, idx: number) => (
										<span key={`${a.name}-${idx}`} className="badge badge-outline text-xs opacity-70">
											{a.name}: {a.value}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
					
					
				</div>
			</div>
			</div>
			
            <div className="mt-12 space-y-6">
                <h3 className="text-2xl font-bold uppercase tracking-wide">ОТЗЫВЫ</h3>
                {reviews.length > 0 ? (
					<div className="space-y-4">
                        {reviews.map((r: any, idx: number) => (
							<div key={idx} className="inner-panel p-4 rounded-md">
						<div className="flex items-center gap-2 mb-1">
							{Array.from({ length: 5 }).map((_, i) => {
								const rating = r.rating || 0
								const color = rating >= 4 ? 'text-green-500' : rating >= 2 ? 'text-yellow-400' : rating > 0 ? 'text-red-500' : 'text-gray-500'
								return (
									<Star key={i} size={16} className={i < rating ? `${color} fill-current` : 'text-gray-500'} />
								)
							})}
							<span className="text-sm opacity-80">{new Date(r.createdAt).toLocaleDateString()}</span>
						</div>
								{r.title && <div className="font-semibold">{r.title}</div>}
								{r.body && <div className="opacity-80">{r.body}</div>}
							</div>
						))}
					</div>
				) : (
					<div className="alert"><span>Пока нет отзывов.</span></div>
				)}
                <div className="card-panel p-4 rounded-md">
                    {hasUserReviewed ? (
                        <div className="text-center py-4">
                            <h4 className="font-semibold mb-2 text-green-400">Вы уже оставили отзыв для этого товара</h4>
                            <p className="text-sm opacity-70">Спасибо за ваш отзыв!</p>
                        </div>
                    ) : (
                        <>
                            <h4 className="font-semibold mb-2">Добавить отзыв</h4>
                    <div className="flex items-center gap-2 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const rating = i + 1
                            const color = reviewForm.rating >= 4 ? 'text-green-500' : reviewForm.rating >= 2 ? 'text-yellow-400' : 'text-red-500'
                            const isSelected = i < reviewForm.rating
                            return (
                                <button key={i} onClick={() => setReviewForm({ ...reviewForm, rating: rating })} className="btn btn-ghost p-1">
                                    <Star size={18} className={isSelected ? `${color} fill-current` : 'text-gray-500'} />
                                </button>
                            )
                        })}
                    </div>
                    <input
                        className="input-text w-full mb-2"
                        placeholder="Заголовок (необязательно)"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    />
                    <textarea
                        className="input-text w-full h-24 mb-3"
                        placeholder="Текст отзыва"
                        value={reviewForm.body}
                        onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={async () => {
                            if (!localStorage.getItem('auth_token')) { window.location.href = '/profile'; return }
                            try {
                                const res = await fetch(`/api/catalog/products/${slug}/reviews`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                                    },
                                    body: JSON.stringify({ rating: reviewForm.rating, title: reviewForm.title || undefined, body: reviewForm.body })
                                })
                                if (!res.ok) throw new Error('failed')
                                const data = await res.json()
                                setReviews(prev => [data.review, ...prev])
                                setReviewForm({ rating: 0, title: '', body: '' })
                                setHasUserReviewed(true)
                                notify.success('Спасибо за отзыв')
                            } catch {
                                notify.error('Не удалось отправить отзыв')
                            }
                        }}
                    >ОТПРАВИТЬ</button>
                        </>
                    )}
                </div>
			</div>

			{recommendedProducts.length > 0 && (
				<div className="mt-16 max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold uppercase tracking-wide mb-8">РЕКОМЕНДУЕМЫЕ ТОВАРЫ</h2>
				<div className="grid-products">
						{recommendedProducts.slice(0, 3).map((p: any) => (
							<ProductCard
								key={p.id}
								variant="wide"
								product={{
									id: p.id,
									name: p.name,
									slug: p.slug,
									price: p.price,
									originalPrice: p.originalPrice,
									tag: p.tag,
									sku: p.sku,
									imageUrl: p.images?.[0]?.url,
									categoryName: p.category?.name,
									collection: p.collection || null,
									rating: (p as any).rating || null,
									reviewsCount: Array.isArray((p as any).reviews) ? (p as any).reviews.length : (p as any).reviewsCount || 0
								}}
                                isWished={wishlistIds.includes(p.id)}
                                onToggleWish={(id) => setWishlistIds(toggleWishlistLib(id))}
							/>
						))}
					</div>
				</div>
			)}

            <div className="mt-16 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold uppercase tracking-wide mb-8">ДРУГИЕ ТОВАРЫ</h2>
                <div className="grid-products">
                    {randomProducts.map((p: any) => (
                        <ProductCard
                            key={p.id}
                            product={{
                                id: p.id,
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                originalPrice: p.originalPrice,
                                tag: p.tag,
                                sku: p.sku,
                                imageUrl: p.images?.[0]?.url,
                                categoryName: p.category?.name,
                                collection: p.collection || null,
                                rating: (p as any).rating || null,
                                reviewsCount: Array.isArray((p as any).reviews) ? (p as any).reviews.length : (p as any).reviewsCount || 0
                            }}
                            isWished={wishlistIds.includes(p.id)}
                            onToggleWish={(id) => setWishlistIds(toggleWishlistLib(id))}
                        />
                    ))}
                </div>
                <div ref={loadMoreRef} className="text-center p-4">
                    {isLoadingMore && <div className="loading loading-spinner" />}
                </div>
            </div>
		</>
	)
}