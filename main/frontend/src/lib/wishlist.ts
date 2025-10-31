export function getWishlistIds(): number[] {
    try {
        const raw = localStorage.getItem('wishlist')
        if (!raw) return []
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) return arr.filter((id) => typeof id === 'number')
        return []
    } catch {
        return []
    }
}

export function isInWishlist(productId: number): boolean {
    return getWishlistIds().includes(productId)
}

export function toggleWishlist(productId: number): number[] {
    const current = new Set(getWishlistIds())
    if (current.has(productId)) current.delete(productId)
    else current.add(productId)
    const next = Array.from(current)
    try { localStorage.setItem('wishlist', JSON.stringify(next)) } catch {}
    return next
}


