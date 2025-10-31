import { prisma } from './lib/prisma'
import { catalogMeta, humanizeType } from './lib/catalogMeta'

export async function seedDemo(): Promise<void> {
  const total = await prisma.product.count()
  const target = 100
  if (total >= target) return
  
  const categories = catalogMeta.categories.map(c => ({ name: c.name, slug: c.slug }))
  
  const createdCats = []
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
    createdCats.push(created)
  }
  
  const brandPrefixes = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Reebok', 'Jordan', 'Converse']
  
  const footwearTypes: string[] = []
  const legwearTypes: string[] = []
  const torsoTypes: string[] = []
  const headwearTypes: string[] = []
  const accessoryTypes: string[] = []

  for (const cat of catalogMeta.categories) {
    const sec = cat.secondary || {}
    for (const [secondaryKey, tertiary] of Object.entries(sec)) {
      for (const t of tertiary.tertiary) {
        const human = humanizeType(cat.name, secondaryKey, t)
        if (cat.name === 'FOOTWEAR') footwearTypes.push(human)
        else if (cat.name === 'LEGWEAR') legwearTypes.push(human)
        else if (cat.name === 'TORSO') torsoTypes.push(human)
        else if (cat.name === 'HEADWEAR') headwearTypes.push(human)
        else if (cat.name === 'ACCESSORIES') accessoryTypes.push(human)
      }
    }
  }
  
  const adjectives = ['Pro', 'Elite', 'Max', 'Ultra', 'Prime', 'Core', 'Essential', 'Performance']
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy', 'Orange']
  const collections = catalogMeta.filters.collections
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const basePrices = [29.99, 49.99, 79.99, 99.99, 129.99, 159.99, 199.99]
  
  const remaining = Math.max(0, target - total)
  for (let i = 0; i < remaining; i++) {
    const brand = brandPrefixes[Math.floor(Math.random() * brandPrefixes.length)]
    const category = createdCats[Math.floor(Math.random() * createdCats.length)]
    
    if (!category || !brand) continue
    
    let type = ''
    if (category.name === 'FOOTWEAR') {
      const selectedType = footwearTypes[Math.floor(Math.random() * footwearTypes.length)]
      if (selectedType) type = selectedType
    } else if (category.name === 'LEGWEAR') {
      const selectedType = legwearTypes[Math.floor(Math.random() * legwearTypes.length)]
      if (selectedType) type = selectedType
    } else if (category.name === 'TORSO') {
      const selectedType = torsoTypes[Math.floor(Math.random() * torsoTypes.length)]
      if (selectedType) type = selectedType
    } else if (category.name === 'HEADWEAR') {
      const selectedType = headwearTypes[Math.floor(Math.random() * headwearTypes.length)]
      if (selectedType) type = selectedType
    } else if (category.name === 'ACCESSORIES') {
      const selectedType = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)]
      if (selectedType) type = selectedType
    }
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    if (!type || !adj || !color) continue
    
    const name = `${brand} ${type} ${adj} ${color}`
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    
    const basePrice = basePrices[Math.floor(Math.random() * basePrices.length)]
    const hasDiscount = Math.random() < 0.6
    const discountPct = hasDiscount ? (Math.floor(Math.random() * 36) + 10) : 0 // 10..45%
    const finalPrice = (basePrice || 0) * (1 - discountPct / 100)
    
    if (!basePrice) continue
    
    const isNew = Math.random() < 0.35
    const isPremium = Math.random() < 0.18
    const collection = Math.random() < 0.6 ? collections[Math.floor(Math.random() * collections.length)] : null
    
    let tagName = ''
    if (isNew) tagName = 'НОВИНКА'
    else if (isPremium) tagName = 'ПРЕМИУМ'
    
    const brandUpper = brand.toUpperCase()
    const featurePool = catalogMeta.filters.features
    const feature = featurePool[Math.floor(Math.random() * featurePool.length)]
    const colorName = catalogMeta.filters.colors[Math.floor(Math.random()*catalogMeta.filters.colors.length)]
    const data: any = {
      name,
      slug,
      description: `Высококачественный ${type.toLowerCase()} с премиальными материалами и передовыми технологиями. Идеально подходит для ${category.name.toLowerCase()}.`,
      price: finalPrice as unknown as any,
      originalPrice: discountPct > 0 ? (basePrice || 0) as unknown as any : null,
      stock: Math.floor(Math.random() * 50) + 5,
      categoryId: category.id,
      tag: tagName || null,
      collection: collection,
      images: { 
        create: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => ({
          url: `/img/products/${slug}-${idx + 1}.jpg`
        }))
      },
      variants: {
        create: sizes.map(size => ({
          name: size,
          value: size,
          stock: Math.floor(Math.random() * 20) + 1
        }))
      },
      attributes: {
        create: [
          { name: 'brand', value: brandUpper },
          { name: 'color', value: colorName },
          { name: 'feature', value: feature },
          { name: 'secondary', value: Object.keys((catalogMeta.categories.find(c=>c.name===category.name)?.secondary)||{})[0] || '' },
          { name: 'tertiary', value: ((catalogMeta.categories.find(c=>c.name===category.name)?.secondary||{})[Object.keys((catalogMeta.categories.find(c=>c.name===category.name)?.secondary)||{})[0]||'']?.tertiary||[])[0] || '' }
        ]
      },
      reviews: {
        create: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, idx) => ({
          rating: Math.floor(Math.random() * 3) + 3,
          title: `Review ${idx + 1}`,
          body: `Отличный товар: ${name}. Качество и цена на высоте.`
        }))
      }
    }
    const product = await prisma.product.create({ data })
  }
}


