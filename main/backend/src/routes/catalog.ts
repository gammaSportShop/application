import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { catalogMeta } from '../lib/catalogMeta'
import { requireAuth } from '../plugins/requireAuth'

const listProductsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().min(1).optional(),
  category: z.string().trim().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'new']).optional(),
  brand: z.string().trim().optional(),
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  feature: z.string().trim().optional(),
  secondary: z.string().trim().optional(),
  tertiary: z.string().trim().optional(),
  brands: z.string().trim().optional(),
  colors: z.string().trim().optional(),
  sizes: z.string().trim().optional(),
  features: z.string().trim().optional()
})

export default async function catalogRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.get('/categories', async () => {
    const items = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true }
    })
    return { items }
  })

  app.get('/meta', async () => {
    return { meta: catalogMeta }
  })

  app.get('/products', async (req, reply) => {
    const parsed = listProductsQuery.safeParse(req.query)
    if (!parsed.success) return reply.status(400).send({ error: 'invalid_query' })
    const { page, pageSize, q, category, priceMin, priceMax, sort, brand, color, size, feature, secondary, tertiary, brands, colors, sizes, features } = parsed.data

    const tagsParam = (req.query as any).tags as string | undefined
    const collectionsParam = (req.query as any).collections as string | undefined

    const cacheKey = `products:${page}:${pageSize}:${q || ''}:${category || ''}:${priceMin || ''}:${priceMax || ''}:${sort || ''}:${brand||''}:${color||''}:${size||''}:${feature||''}:${secondary||''}:${tertiary||''}:${brands||''}:${colors||''}:${sizes||''}:${features||''}:${tagsParam||''}:${collectionsParam||''}`
    try {
      const cached = await redis.get(cacheKey)
      if (cached) return reply.send(JSON.parse(cached))
    } catch {}

    const where: any = {}
    const and: any[] = []

    if (q) {
      and.push({ OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]})
    }
    if (category) {
      and.push({ category: { slug: category } })
    }
    if (typeof priceMin === 'number' || typeof priceMax === 'number') {
      const price: any = {}
      if (typeof priceMin === 'number') price.gte = priceMin
      if (typeof priceMax === 'number') price.lte = priceMax
      and.push({ price })
    }
    if (brand) and.push({ attributes: { some: { name: 'brand', value: brand } } })
    if (color) and.push({ attributes: { some: { name: 'color', value: color } } })
    if (size) and.push({ attributes: { some: { name: 'size', value: size } } })
    if (feature) and.push({ attributes: { some: { name: 'feature', value: feature } } })
    const brandsArr = brands ? brands.split(',').map(s=>s.trim()).filter(Boolean) : []
    const colorsArr = colors ? colors.split(',').map(s=>s.trim()).filter(Boolean) : []
    const sizesArr = sizes ? sizes.split(',').map(s=>s.trim()).filter(Boolean) : []
    const featuresArr = features ? features.split(',').map(s=>s.trim()).filter(Boolean) : []
    if (brandsArr.length > 0) and.push({ attributes: { some: { name: 'brand', value: { in: brandsArr } } } })
    if (colorsArr.length > 0) and.push({ attributes: { some: { name: 'color', value: { in: colorsArr } } } })
    if (sizesArr.length > 0) and.push({ attributes: { some: { name: 'size', value: { in: sizesArr } } } })
    if (featuresArr.length > 0) and.push({ attributes: { some: { name: 'feature', value: { in: featuresArr } } } })
    if (secondary) and.push({ attributes: { some: { name: 'secondary', value: secondary } } })
    if (tertiary) and.push({ attributes: { some: { name: 'tertiary', value: tertiary } } })
    const tagsArr = tagsParam ? tagsParam.split(',').map(s=>s.trim()).filter(Boolean) : []
    const collectionsArr = collectionsParam ? collectionsParam.split(',').map(s=>s.trim()).filter(Boolean) : []
    if (tagsArr.length > 0) and.push({ tag: { in: tagsArr } })
    if (collectionsArr.length > 0) and.push({ collection: { in: collectionsArr } })
    if (and.length > 0) where.AND = and

    let orderBy: any = undefined
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    else if (sort === 'price_desc') orderBy = { price: 'desc' }
    else if (sort === 'new') orderBy = { createdAt: 'desc' }

    const skip = (page - 1) * pageSize

    const [total, rawItems] = await Promise.all([
      prisma.product.count({ where }),
      (prisma as any).product.findMany({
        where,
        orderBy: orderBy as any,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          tag: true,
          sku: true,
          stock: true,
          collection: true,
          images: { select: { url: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          attributes: { where: { name: 'feature' }, select: { value: true }, take: 5 }
        }
      })
    ])

    const productIds = (rawItems as Array<any>).map((p: any) => p.id)
    let ratingMap = new Map<number, { avg: number | null, count: number }>()
    if (productIds.length > 0) {
      try {
        const grouped = await (prisma as any).review.groupBy({
          by: ['productId'],
          where: { productId: { in: productIds } },
          _avg: { rating: true },
          _count: { _all: true }
        })
        for (const row of grouped as Array<any>) {
          ratingMap.set(row.productId, { avg: row._avg?.rating || null, count: row._count?._all || 0 })
        }
      } catch {}
    }

    const items = (rawItems as Array<any>).map((p: any) => {
      const priceNum = Number(p.price)
      const originalNum = (p as any).originalPrice == null ? null : (typeof (p as any).originalPrice === 'number' ? (p as any).originalPrice : Number((p as any).originalPrice))
      const originalTag = (p as any).tag as string | null
      let discountTag: string | null = null
      if (originalNum && originalNum > priceNum) {
        const pct = Math.round(((originalNum - priceNum) / originalNum) * 100)
        discountTag = pct >= 25 ? 'СУПЕР СКИДКА' : 'СКИДКА'
      }
      const tags = [originalTag, discountTag].filter((t): t is string => !!t)
      const tag = discountTag || originalTag || null
      const features = Array.isArray((p as any).attributes) ? ((p as any).attributes as Array<{ value: string }>).map(a=>a.value) : []
      const ratingInfo = ratingMap.get(p.id)
      const rating = ratingInfo && ratingInfo.count > 0 ? Number(ratingInfo.avg) : null
      const reviewsCount = ratingInfo ? ratingInfo.count : 0
      return { ...p, price: priceNum, originalPrice: originalNum, tag, tags, features, rating, reviewsCount }
    })

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const payload = { items, page, pageSize, total, totalPages }
    try { await redis.setex(cacheKey, 60, JSON.stringify(payload)) } catch {}
    return payload
  })

  app.get('/products/:slug', async (req, reply) => {
    const params = z.object({ slug: z.string().min(1) }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const productRaw = await (prisma as any).product.findUnique({
      where: { slug: params.data.slug },
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
        attributes: true,
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    })
    if (!productRaw) return reply.status(404).send({ error: 'not_found' })
    const priceNum = Number((productRaw as any).price)
    const originalNum = (productRaw as any).originalPrice == null ? null : (typeof (productRaw as any).originalPrice === 'number' ? (productRaw as any).originalPrice : Number((productRaw as any).originalPrice))
    let tag = (productRaw as any).tag as string | null
    if (originalNum && originalNum > priceNum) {
      const pct = Math.round(((originalNum - priceNum) / originalNum) * 100)
      tag = pct >= 25 ? 'СУПЕР СКИДКА' : 'СКИДКА'
    }
    let rating: number | null = null
    let reviewsCount = 0
    try {
      const grouped = await (prisma as any).review.groupBy({
        by: ['productId'],
        where: { productId: (productRaw as any).id },
        _avg: { rating: true },
        _count: { _all: true }
      })
      if (Array.isArray(grouped) && grouped.length > 0) {
        reviewsCount = grouped[0]._count?._all || 0
        rating = reviewsCount > 0 ? Number(grouped[0]._avg?.rating) : null
      }
    } catch {}
    const product = { ...(productRaw as any), price: priceNum, originalPrice: originalNum, tag, rating, reviewsCount }
    return { product }
  })

  app.post('/products/:slug/reviews', async (req, reply) => {
    const params = z.object({ slug: z.string().min(1) }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const body = z.object({
      rating: z.coerce.number().int().min(1).max(5),
      title: z.string().trim().max(120).optional(),
      body: z.string().trim().min(3).max(2000)
    }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'invalid_body' })

    const product = await prisma.product.findUnique({ where: { slug: params.data.slug }, select: { id: true } })
    if (!product) return reply.status(404).send({ error: 'not_found' })

    let userId: number | null = null
    try {
      const u = (req as any).user as { id: number } | undefined
      if (u && typeof u.id === 'number') userId = u.id
    } catch {}

    const created = await prisma.review.create({
      data: {
        productId: product.id,
        userId: userId,
        rating: body.data.rating,
        title: body.data.title || null,
        body: body.data.body
      }
    })

    return reply.send({ review: created })
  })

  app.get('/collections', async (_req, _reply) => {
    const items = await (prisma as any).product.findMany({
      where: { NOT: { collection: null } },
      distinct: ['collection'],
      select: {
        collection: true,
        images: { select: { url: true }, take: 1 }
      },
      take: 12
    })
    return { items }
  })
}


