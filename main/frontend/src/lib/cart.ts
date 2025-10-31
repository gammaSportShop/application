import { apiPost, apiPatch, apiGet } from './api'

export type CartItem = { productId: number; quantity: number }

export function getOrCreateCartId(): string {
	let cartId = localStorage.getItem('cart_id')
	if (!cartId) {
		cartId = crypto.randomUUID()
		localStorage.setItem('cart_id', cartId)
	}
	return cartId
}

export async function listCart(cartId: string): Promise<{ items: any[] }> {
	return await apiGet(`/cart/${cartId}`)
}

export async function addToCart(cartId: string, productId: number, quantity: number): Promise<void> {
	await apiPost(`/cart/${cartId}/items`, { productId, quantity })
	try {
		window.dispatchEvent(new Event('cart:item-added'))
	} catch {}
}

export async function setCartItemQuantity(cartId: string, productId: number, quantity: number): Promise<void> {
	await apiPatch(`/cart/${cartId}/items`, { productId, quantity })
}