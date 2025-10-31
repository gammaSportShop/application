"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cartRoutes;
const zod_1 = require("zod");
const redis_1 = require("../lib/redis");
const prisma_1 = require("../lib/prisma");
const uuid_1 = require("uuid");
function cartKey(cartId) {
    return `cart:${cartId}`;
}
async function cartRoutes(app, _opts) {
    app.post('/init', async () => {
        const id = (0, uuid_1.v4)();
        return { cartId: id };
    });
    app.get('/:cartId', async (req, reply) => {
        const params = zod_1.z.object({ cartId: zod_1.z.string().uuid() }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const key = cartKey(params.data.cartId);
        const data = await redis_1.redis.hgetall(key);
        const items = Object.entries(data).map(([productId, qty]) => ({ productId: Number(productId), quantity: Number(qty) }));
        return { items };
    });
    app.post('/:cartId/items', async (req, reply) => {
        const params = zod_1.z.object({ cartId: zod_1.z.string().uuid() }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const body = zod_1.z.object({ productId: zod_1.z.number().int().positive(), quantity: zod_1.z.number().int().min(1) }).safeParse(req.body);
        if (!body.success)
            return reply.status(400).send({ error: 'invalid_body' });
        const key = cartKey(params.data.cartId);
        await redis_1.redis.hincrby(key, String(body.data.productId), body.data.quantity);
        await redis_1.redis.expire(key, 60 * 60 * 24 * 7);
        return { ok: true };
    });
    app.patch('/:cartId/items', async (req, reply) => {
        const params = zod_1.z.object({ cartId: zod_1.z.string().uuid() }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const body = zod_1.z.object({ productId: zod_1.z.number().int().positive(), quantity: zod_1.z.number().int().min(0) }).safeParse(req.body);
        if (!body.success)
            return reply.status(400).send({ error: 'invalid_body' });
        const key = cartKey(params.data.cartId);
        if (body.data.quantity === 0) {
            await redis_1.redis.hdel(key, String(body.data.productId));
        }
        else {
            await redis_1.redis.hset(key, String(body.data.productId), String(body.data.quantity));
        }
        await redis_1.redis.expire(key, 60 * 60 * 24 * 7);
        return { ok: true };
    });
    app.post('/:cartId/checkout', async (req, reply) => {
        const params = zod_1.z.object({ cartId: zod_1.z.string().uuid() }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const key = cartKey(params.data.cartId);
        const data = await redis_1.redis.hgetall(key);
        if (Object.keys(data).length === 0)
            return reply.status(400).send({ error: 'empty_cart' });
        const entries = Object.entries(data).map(([productId, qty]) => ({ productId: Number(productId), quantity: Number(qty) }));
        const ids = entries.map(e => e.productId);
        const products = await prisma_1.prisma.product.findMany({ where: { id: { in: ids } } });
        const byId = new Map(products.map(p => [p.id, p]));
        let total = 0;
        for (const e of entries) {
            const p = byId.get(e.productId);
            if (!p)
                return reply.status(400).send({ error: 'invalid_product', productId: e.productId });
            total += Number(p.price) * e.quantity;
        }
        const order = await prisma_1.prisma.order.create({
            data: {
                status: 'PENDING',
                total,
                items: {
                    create: entries.map(e => {
                        const p = byId.get(e.productId);
                        return { productId: p.id, quantity: e.quantity, price: p.price };
                    })
                }
            },
            include: { items: true }
        });
        await redis_1.redis.del(key);
        return { order };
    });
}
//# sourceMappingURL=cart.js.map