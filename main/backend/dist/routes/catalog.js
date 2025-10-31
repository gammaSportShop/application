"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = catalogRoutes;
const zod_1 = require("zod");
const redis_1 = require("../lib/redis");
const prisma_1 = require("../lib/prisma");
const listProductsQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(12),
    q: zod_1.z.string().trim().min(1).optional(),
    category: zod_1.z.string().trim().optional(),
    priceMin: zod_1.z.coerce.number().nonnegative().optional(),
    priceMax: zod_1.z.coerce.number().nonnegative().optional(),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'new']).optional()
});
async function catalogRoutes(app, _opts) {
    app.get('/categories', async () => {
        const items = await prisma_1.prisma.category.findMany({
            select: { id: true, name: true, slug: true, parentId: true }
        });
        return { items };
    });
    app.get('/products', async (req, reply) => {
        const parsed = listProductsQuery.safeParse(req.query);
        if (!parsed.success)
            return reply.status(400).send({ error: 'invalid_query' });
        const { page, pageSize, q, category, priceMin, priceMax, sort } = parsed.data;
        const cacheKey = `products:${page}:${pageSize}:${q || ''}:${category || ''}:${priceMin || ''}:${priceMax || ''}:${sort || ''}`;
        const cached = await redis_1.redis.get(cacheKey);
        if (cached)
            return reply.send(JSON.parse(cached));
        const where = {};
        const and = [];
        if (q) {
            and.push({ OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                ] });
        }
        if (category) {
            and.push({ category: { slug: category } });
        }
        if (typeof priceMin === 'number' || typeof priceMax === 'number') {
            const price = {};
            if (typeof priceMin === 'number')
                price.gte = priceMin;
            if (typeof priceMax === 'number')
                price.lte = priceMax;
            and.push({ price });
        }
        if (and.length > 0)
            where.AND = and;
        let orderBy = undefined;
        if (sort === 'price_asc')
            orderBy = { price: 'asc' };
        else if (sort === 'price_desc')
            orderBy = { price: 'desc' };
        else if (sort === 'new')
            orderBy = { createdAt: 'desc' };
        const skip = (page - 1) * pageSize;
        const [total, items] = await Promise.all([
            prisma_1.prisma.product.count({ where }),
            prisma_1.prisma.product.findMany({
                where,
                orderBy: orderBy,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    sku: true,
                    stock: true,
                    images: { select: { url: true }, take: 1 },
                    category: { select: { id: true, name: true, slug: true } }
                }
            })
        ]);
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const payload = { items, page, pageSize, total, totalPages };
        await redis_1.redis.setex(cacheKey, 60, JSON.stringify(payload));
        return payload;
    });
    app.get('/products/:slug', async (req, reply) => {
        const params = zod_1.z.object({ slug: zod_1.z.string().min(1) }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug: params.data.slug },
            include: {
                images: true,
                category: { select: { id: true, name: true, slug: true } }
            }
        });
        if (!product)
            return reply.status(404).send({ error: 'not_found' });
        return { product };
    });
}
//# sourceMappingURL=catalog.js.map