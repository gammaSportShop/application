import { useEffect, useMemo, useState } from 'react'
import Breadcrumb from '../components/ui/Breadcrumb'
import { useSearchParams } from 'react-router-dom'
import { apiGet } from '../lib/api'
import ProductCard from '../components/ProductCard.tsx'
import { useMetaTagMap } from '../lib/tags'
import { useMetaUI } from '../lib/meta'
import Chip from '../components/ui/Chip'
import ScrollArea from '../components/ui/ScrollArea'
import { Search, Zap, Eye, Trophy, Target, DollarSign, Palette, Shirt, Footprints, Clock, Award, ChevronDown } from 'lucide-react'
import { getWishlistIds, toggleWishlist } from '../lib/wishlist'

type Product = {
	id: number
	name: string
	slug: string
	price: number
	tag?: string
    tags?: string[]
    originalPrice?: number
    stock?: number
    sku?: string
    collection?: string
	images: { url: string }[]
	category?: { id: number; name: string; slug: string }
}

type CatalogResponse = { items: Product[] }
type CatalogMeta = {
	categories: Array<{
		name: string
		slug: string
		secondary?: Record<string, { tertiary: string[] }>
	}>
}

export default function Catalog() {
	const [items, setItems] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [meta, setMeta] = useState<CatalogMeta | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('ВСЕ')
	const [selectedSecondary, setSelectedSecondary] = useState('')
	const [selectedTertiary, setSelectedTertiary] = useState('')
	const [sortBy, setSortBy] = useState('name')
	const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
	const [selectedBrands, setSelectedBrands] = useState<string[]>([])
	const [selectedColors, setSelectedColors] = useState<string[]>([])
	const [selectedSizes, setSelectedSizes] = useState<string[]>([])
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedCollections, setSelectedCollections] = useState<string[]>([])
	const [showFilters, setShowFilters] = useState(false)
	const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
		categories: false,
		price: false,
		brands: false,
		colors: false,
		sizes: false,
		features: false,
        tags: false,
        collections: false
	})
	const [brandSearch, setBrandSearch] = useState('')
	const [colorSearch, setColorSearch] = useState('')
	const [sizeSearch, setSizeSearch] = useState('')
	const [featureSearch, setFeatureSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [collectionSearch, setCollectionSearch] = useState('')
    const [categorySearch, setCategorySearch] = useState('')
    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState<number | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const [initializedFromUrl, setInitializedFromUrl] = useState(false)
    const [initialCategorySlug, setInitialCategorySlug] = useState<string | null>(null)
    const tagMap = useMetaTagMap()
    const { getFilterButtonClasses } = useMetaUI()
	
	const categoryHierarchy: Record<string, any> = useMemo(() => {
		const base: Record<string, any> = { 'ВСЕ': { icon: <Trophy size={14} />, variant: 'sport' as const } }
		if (!meta || !Array.isArray((meta as any).categories)) return base
		const display = (meta as any).categoriesDisplay || {}
		for (const cat of (meta as any).categories) {
			const d = display[cat.name] || { icon: 'trophy', chipClasses: 'bg-primary/20 text-primary border border-primary/40' }
			const iconEl = d.icon === 'footprints' ? <Footprints size={14} />
				: d.icon === 'target' ? <Target size={14} />
				: d.icon === 'shirt' ? <Shirt size={14} />
				: d.icon === 'eye' ? <Eye size={14} />
				: d.icon === 'award' ? <Award size={14} />
				: <Trophy size={14} />
			const secondary: Record<string, { tertiary: string[] }> = {}
			const sec = cat.secondary || {}
			for (const [k, v] of Object.entries(sec)) secondary[k] = { tertiary: (v as any).tertiary }
			base[cat.name] = { icon: iconEl, chipClasses: (d as any).chipClasses, secondary }
		}
		return base
	}, [meta])

const brands = useMemo(()=>{
    const detailed = (meta as any)?.filtersDetailed?.brands
    const simple = (meta as any)?.filters?.brands
    if (Array.isArray(detailed)) return detailed.map((b:any)=>({ name: b.name, color: b.colorClass }))
    if (Array.isArray(simple)) return simple.map((n:string)=>({ name: n, color: 'bg-gray-500' }))
    return []
}, [meta])

const colors = useMemo(()=>{
    const detailed = (meta as any)?.filtersDetailed?.colors
    const simple = (meta as any)?.filters?.colors
    if (Array.isArray(detailed)) return detailed.map((c:any)=>({ name: c.name, color: c.colorClass }))
    if (Array.isArray(simple)) return simple.map((n:string)=>({ name: n, color: 'bg-gray-500' }))
    return []
}, [meta])

const sizes = useMemo(()=> (Array.isArray((meta as any)?.filters?.sizes) ? (meta as any).filters.sizes : ['XS','S','M','L','XL','XXL']), [meta])

const features = useMemo(()=>{
    const list = (meta as any)?.filters?.features
    if (!Array.isArray(list)) return []
    const iconMap: Record<string, any> = {
        'ВОДОНЕПРОНИЦАЕМЫЕ': <Zap size={14} />,
        'ДЫШАЩИЕ': <Eye size={14} />,
        'АМОРТИЗАЦИЯ': <Target size={14} />,
        'ПОДДЕРЖКА СТОПЫ': <Footprints size={14} />,
        'БЫСТРОСУШИМЫЕ': <Clock size={14} />,
        'ПРЕМИУМ': <Award size={14} />
    }
    return list.map((name:string)=>({ name, icon: iconMap[name] }))
}, [meta])
	
    useEffect(() => {
		apiGet<any>(`/catalog/meta`).then((r) => {
			const m = (r && r.meta) ? r.meta : r
			if (m && Array.isArray(m.categories)) setMeta(m as CatalogMeta)
			else setMeta({ categories: [] })
		}).catch(() => setMeta({ categories: [] }))
	}, [])

	useEffect(() => {
        setWishlistIds(getWishlistIds())
    }, [])

    useEffect(() => {
		const controller = new AbortController()
		async function fetchProducts() {
			setLoading(true)
			try {
				const catSlug = selectedCategory === 'ВСЕ' ? undefined : (Array.isArray(meta?.categories) ? meta?.categories.find(c=>c.name===selectedCategory)?.slug : undefined)
				const params = new URLSearchParams()
				if (searchTerm.trim()) params.set('q', searchTerm.trim())
				if (typeof priceRange.min === 'number') params.set('priceMin', String(priceRange.min))
				if (typeof priceRange.max === 'number') params.set('priceMax', String(priceRange.max))
				if (catSlug) params.set('category', catSlug)
				if (selectedSecondary) params.set('secondary', selectedSecondary)
				if (selectedTertiary) params.set('tertiary', selectedTertiary)
				if (selectedBrands.length) params.set('brands', selectedBrands.join(','))
				if (selectedColors.length) params.set('colors', selectedColors.join(','))
				if (selectedSizes.length) params.set('sizes', selectedSizes.join(','))
				if (selectedFeatures.length) params.set('features', selectedFeatures.join(','))
                if (selectedTags.length) params.set('tags', selectedTags.join(','))
                if (selectedCollections.length) params.set('collections', selectedCollections.join(','))
                params.set('page', String(page))
				if (sortBy === 'price_low') params.set('sort', 'price_asc')
				if (sortBy === 'price_high') params.set('sort', 'price_desc')
				if (sortBy === 'new') params.set('sort', 'new')
                const r = await apiGet<CatalogResponse & { totalPages: number; total?: number }>(`/catalog/products?${params.toString()}`)
				let newItems = r.items
				if (sortBy === 'name') newItems = [...newItems].sort((a,b)=>a.name.localeCompare(b.name))
				setItems(newItems)
                setTotalPages(r.totalPages)
                if (typeof (r as any).total === 'number') setTotalCount((r as any).total)
			} catch {}
			setLoading(false)
		}
		fetchProducts()
		return () => controller.abort()
    }, [searchTerm, page, priceRange.min, priceRange.max, selectedCategory, selectedSecondary, selectedTertiary, selectedBrands, selectedColors, selectedSizes, selectedFeatures, selectedTags, selectedCollections, sortBy, meta])

    useEffect(() => {
        if (initializedFromUrl) return
        const q = searchParams.get('q') || ''
        const priceMin = searchParams.get('priceMin')
        const priceMax = searchParams.get('priceMax')
        const category = searchParams.get('category')
        const secondary = searchParams.get('secondary') || ''
        const tertiary = searchParams.get('tertiary') || ''
        const brands = searchParams.get('brands')
        const colors = searchParams.get('colors')
        const sizes = searchParams.get('sizes')
        const features = searchParams.get('features')
        const tags = searchParams.get('tags')
        const collections = searchParams.get('collections')
        const sort = searchParams.get('sort')
        const pageStr = searchParams.get('page')
        setSearchTerm(q)
        if (priceMin) setPriceRange(prev => ({ ...prev, min: Number(priceMin) }))
        if (priceMax) setPriceRange(prev => ({ ...prev, max: Number(priceMax) }))
        if (brands) setSelectedBrands(brands.split(',').filter(Boolean))
        if (colors) setSelectedColors(colors.split(',').filter(Boolean))
        if (sizes) setSelectedSizes(sizes.split(',').filter(Boolean))
        if (features) setSelectedFeatures(features.split(',').filter(Boolean))
        if (tags) setSelectedTags(tags.split(',').filter(Boolean))
        if (collections) setSelectedCollections(collections.split(',').filter(Boolean))
        if (secondary) setSelectedSecondary(secondary)
        if (tertiary) setSelectedTertiary(tertiary)
        if (sort === 'price_asc') setSortBy('price_low')
        else if (sort === 'price_desc') setSortBy('price_high')
        else if (sort === 'new') setSortBy('new')
        if (pageStr) setPage(Math.max(1, Number(pageStr)))
        if (category) setInitialCategorySlug(category)
        setInitializedFromUrl(true)
    }, [searchParams, initializedFromUrl])

    useEffect(() => {
        if (!initializedFromUrl) return
        const next = new URLSearchParams()
        if (searchTerm.trim()) next.set('q', searchTerm.trim())
        if (typeof priceRange.min === 'number') next.set('priceMin', String(priceRange.min))
        if (typeof priceRange.max === 'number') next.set('priceMax', String(priceRange.max))
        const catSlug = selectedCategory === 'ВСЕ' ? '' : (Array.isArray(meta?.categories) ? (meta?.categories.find(c=>c.name===selectedCategory)?.slug || '') : '')
        if (catSlug) next.set('category', catSlug)
        if (selectedSecondary) next.set('secondary', selectedSecondary)
        if (selectedTertiary) next.set('tertiary', selectedTertiary)
        if (selectedBrands.length) next.set('brands', selectedBrands.join(','))
        if (selectedColors.length) next.set('colors', selectedColors.join(','))
        if (selectedSizes.length) next.set('sizes', selectedSizes.join(','))
        if (selectedFeatures.length) next.set('features', selectedFeatures.join(','))
        if (selectedTags.length) next.set('tags', selectedTags.join(','))
        if (selectedCollections.length) next.set('collections', selectedCollections.join(','))
        if (sortBy === 'price_low') next.set('sort', 'price_asc')
        if (sortBy === 'price_high') next.set('sort', 'price_desc')
        if (sortBy === 'new') next.set('sort', 'new')
        next.set('page', String(page))
        setSearchParams(next)
    }, [searchTerm, priceRange.min, priceRange.max, selectedCategory, selectedSecondary, selectedTertiary, selectedBrands, selectedColors, selectedSizes, selectedFeatures, selectedTags, selectedCollections, sortBy, page, meta, initializedFromUrl, setSearchParams])

    useEffect(() => {
        if (!initialCategorySlug || !meta) return
        const found = Array.isArray(meta.categories) ? meta.categories.find(c=>c.slug===initialCategorySlug) : undefined
        if (found) setSelectedCategory(found.name)
    }, [meta, initialCategorySlug])


	
	const sortedItems = items

	const toggleFilter = (filterType: string, value: string) => {
		switch (filterType) {
			case 'brand':
				setSelectedBrands(prev => 
					prev.includes(value) ? prev.filter(b => b !== value) : [...prev, value]
				)
				break
			case 'color':
				setSelectedColors(prev => 
					prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
				)
				break
			case 'size':
				setSelectedSizes(prev => 
					prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
				)
				break
			case 'feature':
				setSelectedFeatures(prev => 
					prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
				)
				break
            case 'tag':
                setSelectedTags(prev => prev.includes(value) ? prev.filter(t=>t!==value) : [...prev, value])
                break
            case 'collection':
                setSelectedCollections(prev => prev.includes(value) ? prev.filter(c=>c!==value) : [...prev, value])
                break
		}
	}

	const clearAllFilters = () => {
		setSelectedCategory('ВСЕ')
		setSelectedSecondary('')
		setSelectedTertiary('')
		setSelectedBrands([])
		setSelectedColors([])
		setSelectedSizes([])
		setSelectedFeatures([])
        setSelectedTags([])
        setSelectedCollections([])
		setPriceRange({ min: 0, max: 1000 })
		setSearchTerm('')
	}

	const toggleSection = (section: string) => {
		setCollapsedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}))
	}

	
return (
    <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
            <div className="flex flex-col lg:flex-row gap-8">
			<div className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
				<ScrollArea 
					variant="filters" 
					maxHeight="calc(100vh - 2rem)"
					className="card-panel p-6 lg:sticky lg:top-12"
				>
                <div className="hidden sm:flex items-center justify-between mb-6 p-[0.5rem]">
						<h2 className="text-xl font-bold uppercase tracking-wide">ФИЛЬТРЫ</h2>
                        <button 
                            onClick={clearAllFilters}
                            className="btn btn-ghost btn-sm"
                        >
                            ОЧИСТИТЬ ВСЕ
                        </button>
					</div>
					
					<div className="space-y-6">
						<div>
							<button 
								onClick={() => toggleSection('categories')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<Trophy size={16} />
									КАТЕГОРИИ
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.categories ? 'rotate-180' : ''}`}
								/>
							</button>
                            {!collapsedSections.categories && (
                                <div className="space-y-1">
                                    <div className="mb-2">
                                        <input
                                            className="input-text w-full"
                                            placeholder="Поиск категории"
                                            value={categorySearch}
                                            onChange={(e)=>setCategorySearch(e.target.value)}
                                        />
                                    </div>
                                    {Object.entries(categoryHierarchy).filter(([name]) => name.toLowerCase().includes(categorySearch.toLowerCase())).map(([categoryName, categoryData]) => (
										<div key={categoryName}>
								<Chip
									icon={categoryData.icon}
									isFilter={true}
									classes={categoryData.chipClasses}
									className={`w-full cursor-pointer transition-all mb-2 ${
													selectedCategory === categoryName ? 'ring-2 ring-white ring-opacity-50' : ''
												}`}
												onClick={() => {
													setSelectedCategory(categoryName)
													setSelectedSecondary('')
													setSelectedTertiary('')
												}}
											>
												{categoryName}
											</Chip>
											
											{selectedCategory === categoryName && categoryData.secondary && (
												<div className="ml-4 space-y-1">
													{Object.entries(categoryData.secondary).map(([secondaryName, secondaryData]: [string, any]) => (
														<div key={secondaryName}>
								<Chip
									icon={<Target size={12} />}
									isFilter={true}
									classes={categoryData.chipClasses}
									className={`w-full cursor-pointer transition-all mb-1 ${
																	selectedSecondary === secondaryName ? 'ring-2 ring-white ring-opacity-50' : ''
																}`}
																onClick={() => {
																	setSelectedSecondary(secondaryName)
																	setSelectedTertiary('')
																}}
															>
																{secondaryName}
															</Chip>
															
                                                            {selectedSecondary === secondaryName && secondaryData.tertiary && (
																<div className="ml-4 space-y-1">
                                                                    {secondaryData.tertiary.filter((t:string)=>t.toLowerCase().includes(categorySearch.toLowerCase())).map((tertiaryName: string) => (
												<Chip
													key={tertiaryName}
													icon={<Award size={10} />}
													isFilter={true}
													classes={categoryData.chipClasses}
													className={`w-full cursor-pointer transition-all text-xs ${
																				selectedTertiary === tertiaryName ? 'ring-2 ring-white ring-opacity-50' : ''
																			}`}
																			onClick={() => setSelectedTertiary(tertiaryName)}
																		>
																			{tertiaryName}
																		</Chip>
																	))}
																</div>
															)}
														</div>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>

                        <div data-anim>
							<button 
								onClick={() => toggleSection('price')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<DollarSign size={16} />
									ЦЕНА
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.price ? 'rotate-180' : ''}`}
								/>
							</button>
				{!collapsedSections.price && (
					<div className="inner-panel p-3 space-y-3">
						<div className="grid grid-cols-2 gap-2">
										<input
											type="number"
											placeholder="От"
											className="input-text text-xs"
											value={priceRange.min}
											onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
										/>
										<input
											type="number"
											placeholder="До"
											className="input-text text-xs"
											value={priceRange.max}
											onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
										/>
									</div>
									<div className="text-xs text-text-muted">
										${priceRange.min} - ${priceRange.max}
									</div>
								</div>
							)}
						</div>

                        <div data-anim>
							<button 
								onClick={() => toggleSection('brands')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<Shirt size={16} />
									БРЕНДЫ
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.brands ? 'rotate-180' : ''}`}
								/>
							</button>
				{!collapsedSections.brands && (
					<div className="inner-panel p-3 space-y-2">
						<input
							className="input-text w-full"
							placeholder="Поиск бренда"
							value={brandSearch}
							onChange={(e)=>setBrandSearch(e.target.value)}
						/>
						<ScrollArea className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1" maxHeight="none">
                        {brands.filter(b=>b.name.toLowerCase().includes(brandSearch.toLowerCase())).map(brand => {
                                const active = selectedBrands.includes(brand.name)
								return (
                                    <button
										key={brand.name}
										onClick={() => toggleFilter('brand', brand.name)}
                                            className={`min-h-[44px] w-full px-3 rounded-md text-sm font-medium transition-all border flex items-center justify-start text-left whitespace-normal break-words ${
                                            getFilterButtonClasses(active)
                                        }`}
									>
                                <div className={`w-4 h-4 min-w-4 min-h-4 rounded-md border border-white/20 flex-none shrink-0 mr-2 ${brand.color}`}></div>
                                        <span className="leading-tight">{brand.name}</span>
									</button>
								)
							})}
						</ScrollArea>
					</div>
				)}
						</div>

                        <div data-anim>
							<button 
								onClick={() => toggleSection('colors')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<Palette size={16} />
									ЦВЕТА
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.colors ? 'rotate-180' : ''}`}
								/>
							</button>
				{!collapsedSections.colors && (
					<div className="inner-panel p-3 space-y-2">
						<input
							className="input-text w-full"
							placeholder="Поиск цвета"
							value={colorSearch}
							onChange={(e)=>setColorSearch(e.target.value)}
						/>
						<ScrollArea className="grid grid-cols-3 gap-2 pr-1" maxHeight="none">
                            {colors.filter(c=>c.name.toLowerCase().includes(colorSearch.toLowerCase())).map(color => {
								const active = selectedColors.includes(color.name)
								return (
									<button
										key={color.name}
										onClick={() => toggleFilter('color', color.name)}
                                            className={`h-18 relative p-2 rounded-md text-xs transition-all border flex flex-col items-center justify-center ${
                                            getFilterButtonClasses(active, true)
                                        }`}
									>
                                    <div className={`w-4 h-4 min-w-4 min-h-4 rounded-full border border-white/20 flex-none shrink-0 mb-1 ${color.color}`}></div>
										<div className="text-xs text-center leading-tight">{color.name}</div>
									</button>
								)
							})}
						</ScrollArea>
					</div>
				)}
						</div>

                        <div data-anim>
							<button 
								onClick={() => toggleSection('sizes')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<Footprints size={16} />
									РАЗМЕРЫ
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.sizes ? 'rotate-180' : ''}`}
								/>
							</button>
				{!collapsedSections.sizes && (
					<div className="inner-panel p-3 space-y-2">
						<input
							className="input-text w-full"
							placeholder="Поиск размера"
							value={sizeSearch}
							onChange={(e)=>setSizeSearch(e.target.value)}
						/>
						<div className="grid grid-cols-4 gap-2">
                            {sizes.filter((s: string)=>s.toLowerCase().includes(sizeSearch.toLowerCase())).map((size: string) => {
								const active = selectedSizes.includes(size)
								return (
									<button
										key={size}
										onClick={() => toggleFilter('size', size)}
                                        className={`p-2 rounded-md text-xs font-medium transition-all border ${
                                            getFilterButtonClasses(active)
                                        }`}
									>
										{size}
									</button>
								)
							})}
						</div>
					</div>
				)}
						</div>

                        <div data-anim>
							<button 
								onClick={() => toggleSection('features')}
								className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
							>
								<div className="flex items-center gap-2">
									<Award size={16} />
									ОСОБЕННОСТИ
								</div>
								<ChevronDown 
									size={16} 
									className={`transition-transform ${collapsedSections.features ? 'rotate-180' : ''}`}
								/>
							</button>
				{!collapsedSections.features && (
					<div className="inner-panel p-3 space-y-2">
						<input
							className="input-text w-full"
							placeholder="Поиск особенностей"
							value={featureSearch}
							onChange={(e)=>setFeatureSearch(e.target.value)}
						/>
                        {features.filter(f=>f.name.toLowerCase().includes(featureSearch.toLowerCase())).map(feature => {
							const active = selectedFeatures.includes(feature.name)
							return (
								<button
									key={feature.name}
									onClick={() => toggleFilter('feature', feature.name)}
                                    className={`w-full p-2 rounded-md text-xs font-medium transition-all flex items-center gap-2 border ${
                                        getFilterButtonClasses(active)
                                    }`}
								>
									{feature.icon}
									{feature.name}
								</button>
							)
						})}
					</div>
				)}
						</div>

                        <div data-anim>
                            <button 
                                onClick={() => toggleSection('tags')}
                                className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Award size={16} />
                                    ТЕГИ
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform ${collapsedSections.tags ? 'rotate-180' : ''}`}
                                />
                            </button>
                 {!collapsedSections.tags && (
                     <div className="inner-panel p-3 space-y-2">
                         <input
                             className="input-text w-full"
                             placeholder="Поиск тега"
                             value={tagSearch}
                             onChange={(e) => setTagSearch(e.target.value)}
                         />
                         {tagMap.allNames.filter((n) => n.toLowerCase().includes(tagSearch.toLowerCase())).map(name => {
                             const active = selectedTags.includes(name)
                             return (
                                 <button
                                     key={name}
                                     onClick={() => toggleFilter('tag', name)}
                                     className={`w-full p-2 rounded-md text-xs font-medium transition-all flex items-center gap-2 border ${
                                         active ? 'border-white/40 ring-2 ring-white/50 bg-white/10' : 'border-standard bg-bg-inner hover:bg-bg-alt'
                                     }`}
                                 >
                                     {tagMap.getIcon(name)}
                                     {name}
                                 </button>
                             )
                         })}
                     </div>
                 )}
                        </div>

                        <div data-anim>
                            <button 
                                onClick={() => toggleSection('collections')}
                                className="font-semibold uppercase mb-3 flex items-center justify-between w-full text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Award size={16} />
                                    КОЛЛЕКЦИИ
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform ${collapsedSections.collections ? 'rotate-180' : ''}`}
                                />
                            </button>
                 {!collapsedSections.collections && (
                     <div className="inner-panel p-3 space-y-2">
                         <input
                             className="input-text w-full"
                             placeholder="Поиск коллекции"
                             value={collectionSearch}
                             onChange={(e) => setCollectionSearch(e.target.value)}
                         />
{((meta as any)?.filters?.collections || []).filter((c:string) => c.toLowerCase().includes(collectionSearch.toLowerCase())).map((col:string) => {
                             const active = selectedCollections.includes(col)
                             return (
                                 <button
                                     key={col}
                                     onClick={() => toggleFilter('collection', col)}
                                     className={`w-full p-2 rounded-md text-xs font-medium transition-all flex items-center gap-2 border ${
                                         active ? 'border-white/40 ring-2 ring-white/50 bg-white/10' : 'border-standard bg-bg-inner hover:bg-bg-alt'
                                     }`}
                                 >
                                     <Award size={14} />
                                     {col}
                                 </button>
                             )
                         })}
                     </div>
                 )}
                        </div>
						
						<div>
							<h3 className="font-semibold uppercase mb-3">СОРТИРОВКА</h3>
							<select 
								className="input-text w-full" 
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
							>
								<option value="name">ПО НАЗВАНИЮ</option>
								<option value="price_low">ЦЕНА: НИЖЕ</option>
								<option value="price_high">ЦЕНА: ВЫШЕ</option>
								<option value="new">НОВЫЕ</option>
							</select>
						</div>
					</div>
				</ScrollArea>
			</div>
			
			<div className="flex-1 min-w-0">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 p-[0.5rem]">
					<div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide">КАТАЛОГ</h1>
						<div className="text-sm text-text-muted mt-1">
                            Найдено: {typeof totalCount === 'number' ? totalCount : sortedItems.length} товаров
							{(selectedBrands.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || selectedFeatures.length > 0) && (
								<span className="text-primary ml-2">
									• Активные фильтры: {selectedBrands.length + selectedColors.length + selectedSizes.length + selectedFeatures.length}
								</span>
							)}
						</div>
					</div>
				<div className="flex gap-2 flex-wrap w-full md:w-auto">
						<button 
							onClick={() => setShowFilters(!showFilters)}
							className="btn btn-ghost lg:hidden"
						>
							<Search size={16} className="mr-2" />
							ФИЛЬТРЫ
						</button>
						<div className="relative flex-1 min-w-[180px] md:flex-initial md:w-80">
							<Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input 
								className="input-text pl-10 w-full" 
								placeholder="ПОИСК" 
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<button className="btn btn-primary whitespace-nowrap">
							<Search size={16} className="mr-2" />
							НАЙТИ
						</button>
					</div>
				</div>
				
				<div className="p-2 sm:p-3 pb-0">
					{loading ? (
						<div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg" /></div>
					) : items.length === 0 ? (
						<div className="alert"><span>Пока нет товаров.</span></div>
					) : (
                    <div className="grid-products">
                    {sortedItems.map((p) => {
                        return (
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
                                    collection: p.collection,
                                    rating: (p as any).rating || null,
                                    reviewsCount: Array.isArray((p as any).reviews) ? (p as any).reviews.length : (p as any).reviewsCount || 0
                                }}
                                isWished={wishlistIds.includes(p.id)}
                                onToggleWish={(id: number) => {
                                    if (!localStorage.getItem('auth_token')) { window.location.href = '/profile'; return }
                                    const next = toggleWishlist(id)
                                    setWishlistIds(next)
                                }}
                            />
                        )
                    })}
                    </div>
					)}
					<div className="flex justify-center mt-8 gap-2">
                        <div className="btn-group">
                            <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>«</button>
                            <button className="btn">Страница {page}</button>
                            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>»</button>
                        </div>
                    </div>
				</div>
                <div className="sm:hidden sticky bottom-2 z-10">
                    <div className="card-panel p-2 flex items-center gap-2">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-ghost flex-1"
                        >
                            <Search size={16} className="mr-2" />
                            ФИЛЬТРЫ
                        </button>
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                className="input-text pl-10 w-full" 
                                placeholder="ПОИСК" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
}