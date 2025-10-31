import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiGet } from './api'
import { getOrCreateCartId, setCartItemQuantity, addToCart } from './cart'

export type CartItem = {
	productId: number
	quantity: number
	name?: string
	price?: number
	imageUrl?: string
}

interface CartState {
	items: CartItem[]
	totalProducts: number
	getItemQuantity: (productId: number) => number
	updateItemQuantity: (productId: number, quantity: number) => Promise<void>
	isUpdating: boolean
}

const CartContext = createContext<CartState | null>(null)

export function useCart(): CartState {
	const context = useContext(CartContext)
	if (!context) {
		throw new Error('useCart must be used within a CartProvider')
	}
	return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([])
	const [isUpdating, setIsUpdating] = useState(false)

	const fetchCart = useCallback(async () => {
		try {
			const cartId = await getOrCreateCartId()
			const data = await apiGet<{ items: CartItem[] }>(`/cart/${cartId}`)
			setItems(data.items || [])
		} catch (error) {
			console.error('Failed to fetch cart:', error)
			setItems([])
		}
	}, [])

	useEffect(() => {
		fetchCart()
	}, [fetchCart])

	const getItemQuantity = useCallback(
		(productId: number) => {
			const item = items.find(i => i.productId === productId)
			return item ? item.quantity : 0
		},
		[items]
	)

	const updateItemQuantity = useCallback(
		async (productId: number, quantity: number) => {
			setIsUpdating(true)
			try {
				const cartId = getOrCreateCartId()
				const existingItem = items.find(i => i.productId === productId)

				if (quantity === 0) {
					await setCartItemQuantity(cartId, productId, 0)
				} else if (existingItem) {
					await setCartItemQuantity(cartId, productId, quantity)
				} else {
					await addToCart(cartId, productId, quantity)
				}
				
				await fetchCart()
			} catch (error) {
				console.error('Failed to update cart:', error)
			} finally {
				setIsUpdating(false)
			}
		},
		[fetchCart, items]
	)

	const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<CartContext.Provider
			value={{
				items,
				totalProducts,
				getItemQuantity,
				updateItemQuantity,
				isUpdating
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
