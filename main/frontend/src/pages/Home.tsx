import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import ProductCard from '../components/ProductCard.tsx'
import Breadcrumb from '../components/ui/Breadcrumb'
import { getWishlistIds, toggleWishlist } from '../lib/wishlist'
import DotField from '../components/DotField.tsx'

export default function Home() {
    const [collections, setCollections] = useState<Array<{ collection: string; images?: { url: string }[] }>>([])
    const [saleItems, setSaleItems] = useState<any[]>([])
    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const [meta, setMeta] = useState<{ categories: Array<{ name: string; slug: string }> } | null>(null)

    useEffect(() => {
        apiGet<{ items: Array<{ collection: string; images?: { url: string }[] }> }>(`/catalog/collections`).then(r=>setCollections(r.items)).catch(()=>{})
        apiGet<{ items: any[] }>(`/catalog/products?sort=new`).then(r=>{
            const withDiscount = r.items.filter(p=> typeof p.originalPrice === 'number' && p.originalPrice > p.price).slice(0,8)
            setSaleItems(withDiscount)
        }).catch(()=>{})
        apiGet<any>(`/catalog/meta`).then((r)=>{
            const m = r?.meta || r
            if (m && Array.isArray(m.categories)) setMeta(m)
            else setMeta({ categories: [] })
        }).catch(()=>setMeta({ categories: [] }))
        setWishlistIds(getWishlistIds())
    }, [])

    useMemo(() => {
        return null
    }, [meta])

    return (
        <div className="space-y-10">
            <Breadcrumb items={[{ label: 'Главная' }]} />
            <div className="hero-panel relative overflow-hidden rounded-box">
                <DotField className="absolute inset-0 opacity-20 pointer-events-none" />
                <div className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="hero-title">MUSTARD</h1>
                        <p className="opacity-80 mb-6">Экипировка и одежда с акцентом на качество и стиль.</p>
                        <a href="/catalog" className="btn btn-primary">В КАТАЛОГ</a>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center uppercase tracking-wide">ПОДБОРКИ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collections.map((c, idx) => (
                        <a key={idx} href={`/catalog?collections=${encodeURIComponent(c.collection)}`} className="card-panel p-4 hover:scale-[1.01] transition-transform relative overflow-hidden">
                            <div className="aspect-[3/2] rounded-lg mb-3 overflow-hidden relative bg-bg-inner">
                                <DotField className="absolute inset-0" />
                            </div>
                            <h3 className="font-semibold uppercase relative">{c.collection}</h3>
                        </a>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center uppercase tracking-wide">РАСПРОДАЖА</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {saleItems.map((p)=> (
                        <ProductCard
                            key={p.id}
                            product={{
                                id: p.id,
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                originalPrice: p.originalPrice,
                                tag: p.tag,
                                tags: (p as any).tags,
                                sku: p.sku,
                                imageUrl: p.images?.[0]?.url,
                                categoryName: p.category?.name,
                                collection: p.collection || null,
                                rating: (p as any).rating || null,
                                reviewsCount: Array.isArray((p as any).reviews) ? (p as any).reviews.length : (p as any).reviewsCount || 0
                            }}
                            isWished={wishlistIds.includes(p.id)}
                            onToggleWish={(id:number)=>{
                                if (!localStorage.getItem('auth_token')) { window.location.href = '/profile'; return }
                                const next = toggleWishlist(id)
                                setWishlistIds(next)
                            }}
                        />
                    ))}
                </div>
            </div>

            
        </div>
    )
}


