import { Link } from 'react-router-dom'
import ImageWithPlaceholder from './ImageWithPlaceholder'
import Chip from './ui/Chip'
import { Heart, ShoppingCart, Eye as ViewIcon, Plus, Minus, Star } from 'lucide-react'
import { useMetaTagMap } from '../lib/tags'
import { useState } from 'react'
import { useNotify } from './NotificationProvider'
import { useCart } from '../lib/CartContext'
import { useMetaUI } from '../lib/meta'

type Props = {
	product: {
		id: number
		name: string
		slug: string
		price: number
		originalPrice?: number | null
		tag?: string | null
		tags?: string[] | null
		sku?: string | null
		imageUrl?: string
		categoryName?: string
		collection?: string | null
            rating?: number | null
            reviewsCount?: number | null
    }
	isWished?: boolean
	onToggleWish?: (productId: number) => void
    variant?: 'standard' | 'wide'
}

export default function ProductCard({ product, isWished = false, onToggleWish, variant = 'standard' }: Props) {
	const wide = variant === 'wide'
    const notify = useNotify()
    const tagMap = useMetaTagMap()
	const { getItemQuantity, updateItemQuantity, isUpdating } = useCart()

	const quantity = getItemQuantity(product.id)
	const hasDiscount = typeof product.originalPrice === 'number' && (product.originalPrice as number) > product.price

	const nameWords = String(product.name || '').split(/\s+/).filter(Boolean)
	const nameFirstLine = nameWords.slice(0, 3).join(' ')
	const nameSecondLine = nameWords.slice(3).join(' ')

  const { getCategoryIcon, getCategoryChipClasses, collectionChipClasses, season1ChipClasses, season2ChipClasses } = useMetaUI()
  const categoryIcon = getCategoryIcon(product.categoryName)

	const handleUpdateQuantity = async (newQuantity: number) => {
		if (isUpdating) return
		await updateItemQuantity(product.id, newQuantity)
		if (newQuantity > quantity) {
			notify.success('Товар добавлен в корзину')
		}
	}

    return (
        <div className={`card-panel group hover:scale-[1.02] transition-transform duration-200 relative flex ${wide ? 'flex-row items-stretch' : 'flex-col'} max-h-[560px]`} data-enter>
			<figure className={`${wide ? 'w-40 sm:w-48 md:w-56 flex-shrink-0 rounded-l-lg rounded-r-none' : 'rounded-t-lg'} aspect-square bg-bg-inner overflow-hidden relative`}>
				<ImageWithPlaceholder src={product.imageUrl} />
				<button
					className={`absolute top-4 left-4 btn btn-ghost w-[35px] h-[35px] p-0 rounded-md bg-black/30 hover:bg-black/50 backdrop-blur-sm border transition-all duration-200 ${isWished ? 'border-blue-600/60 text-blue-400' : 'border-white/20 hover:border-white/30'}`}
					onClick={() => {
						if (!localStorage.getItem('auth_token')) { window.location.href = '/profile'; return }
						onToggleWish && onToggleWish(product.id)
					}}
				>
					<Heart size={20} />
				</button>
					{(Array.isArray(product.tags) && product.tags.length > 0) ? (
					<div className="absolute top-4 right-4 flex flex-col items-end gap-2">
							{product.tags!.slice(0, 3).map((t, idx) => (
								<div key={idx} className={`text-xs font-medium h-[35px] px-3 rounded-md inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm ${tagMap.getClasses(t)}`}>
									{tagMap.getIcon(t)}
								{t}
							</div>
						))}
					</div>
				) : (
						product.tag ? (
							<div className={`absolute top-4 right-4 text-xs font-medium h-[35px] px-3 rounded-md inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm ${tagMap.getClasses(product.tag)}`}>
								{tagMap.getIcon(product.tag)}
							{product.tag}
						</div>
					) : null
				)}
			</figure>
			<div className={`card-body flex flex-col flex-1 ${wide ? 'min-w-0 p-4' : 'p-6'}`}>
				<div className="marquee mb-2">
					<div className="marquee-track">
            {product.categoryName && (
						<span className="mr-2 inline-flex">
            <Chip icon={categoryIcon} isFilter={true} classes={getCategoryChipClasses(product.categoryName)}>{product.categoryName}</Chip>
						</span>
						)}
						{product.collection && (
							<span className="mr-2 inline-flex">
            <Chip classes={collectionChipClasses}>{product.collection}</Chip>
							</span>
						)}
						{product.sku && (String(product.sku).includes('S1') || String(product.sku).includes('S2')) && (
							<span className="mr-2 inline-flex">
                <Chip classes={String(product.sku).includes('S1') ? season1ChipClasses : season2ChipClasses}>{String(product.sku).includes('S1') ? 'SEASON 1' : 'SEASON 2'}</Chip>
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 mb-2 min-h-[18px]">
					{(() => {
						const ratingValue = typeof product.rating === 'number' ? product.rating : 0
						const color = ratingValue >= 4 ? 'text-green-500' : ratingValue >= 2 ? 'text-yellow-400' : ratingValue > 0 ? 'text-red-500' : 'text-gray-400'
						return (
							<>
								{Array.from({ length: 5 }).map((_, i) => {
									const filled = i < Math.round(ratingValue)
									return <Star key={i} size={14} className={`${filled ? `${color} fill-current` : 'text-gray-400'}`} />
								})}
								{ratingValue > 0 && (
									<span className="text-xs font-medium opacity-80 ml-1">{ratingValue.toFixed(1)}</span>
								)}
								<span className="text-xs opacity-70 ml-1">({typeof product.reviewsCount === 'number' ? product.reviewsCount : 0})</span>
							</>
						)
					})()}
				</div>
				<h2 className="card-title text-lg title-3lines min-h-[3rem] leading-tight">
					<Link to={`/product/${product.slug}`} className={`hover:text-primary transition block ${wide ? '' : 'max-w-[28ch]'} break-words`}>
						<span className="block">{nameFirstLine}</span>
						<span className="block">{nameSecondLine || '\u00A0'}</span>
					</Link>
				</h2>
				<div className="h-1" />
				{!wide && <div className="flex-grow" />}
				<div className="mt-auto flex items-center justify-between flex-wrap mb-3 gap-2">
							<div className="flex items-baseline gap-2">
							<p className="text-2xl font-bold text-primary">${product.price}</p>
						<span className={`text-sm ${hasDiscount ? 'line-through opacity-60' : 'opacity-0 select-none'}`}>${hasDiscount ? product.originalPrice : product.price}</span>
					</div>
					{Array.isArray((product as any).features) && (product as any).features.length > 0 && (
						<div className="flex gap-2 items-center w-full">
							{((product as any).features as string[]).slice(0, 3).map((f, idx) => (
								<Chip key={idx} classes="bg-white/5 border border-white/20 text-xs px-2 h-[28px]">
									{f}
								</Chip>
							))}
						</div>
					)}
							{hasDiscount ? (
								<span className="text-sm px-2 py-1 rounded-md border border-primary/40 text-primary bg-primary/20 font-semibold">-{Math.round((((product.originalPrice as number) - product.price) / (product.originalPrice as number)) * 100)}%</span>
					) : (
						<span className="text-sm px-2 py-1 rounded-md border border-transparent opacity-0 select-none">-0%</span>
					)}
				</div>
				<div className="card-actions justify-around flex-wrap">
					<Link className="btn btn-ghost flex-1" to={`/product/${product.slug}`}>
						<ViewIcon size={16} className="mr-2" />
						СМОТРЕТЬ
					</Link>
					{quantity > 0 ? (
						<div className="flex items-center border-primary rounded-md">
							<button onClick={() => handleUpdateQuantity(quantity - 1)} className="btn btn-ghost p-2" disabled={isUpdating}><Minus size={16} /></button>
							<span className="font-bold text-primary w-8 text-center">{quantity}</span>
							<button onClick={() => handleUpdateQuantity(quantity + 1)} className="btn btn-ghost p-2" disabled={isUpdating}><Plus size={16} /></button>
						</div>
					) : (
						<button
							className="btn btn-primary"
							onClick={() => handleUpdateQuantity(1)}
							disabled={isUpdating}
						>
							<ShoppingCart size={16} />
						</button>
					)}
				</div>
			</div>
		</div>
	)
}


