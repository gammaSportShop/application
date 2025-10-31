import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'

function cartKey(cartId: string) {
  return `cart:${cartId}`
}

export default async function cartRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/init', async () => {
    const id = uuidv4()
    return { cartId: id }
  })

  app.get('/:cartId', async (req, reply) => {
    const params = z.object({ cartId: z.string().uuid() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const key = cartKey(params.data.cartId)
    const data = await redis.hgetall(key)
    const items = Object.entries(data).map(([productId, qty]) => ({ productId: Number(productId), quantity: Number(qty) }))
    return { items }
  })

  app.post('/:cartId/items', async (req, reply) => {
    const params = z.object({ cartId: z.string().uuid() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const body = z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1) }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'invalid_body' })
    const key = cartKey(params.data.cartId)
    await redis.hincrby(key, String(body.data.productId), body.data.quantity)
    await redis.expire(key, 60 * 60 * 24 * 7)
    return { ok: true }
  })

  app.patch('/:cartId/items', async (req, reply) => {
    const params = z.object({ cartId: z.string().uuid() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const body = z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(0) }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'invalid_body' })
    const key = cartKey(params.data.cartId)
    if (body.data.quantity === 0) {
      await redis.hdel(key, String(body.data.productId))
    } else {
      await redis.hset(key, String(body.data.productId), String(body.data.quantity))
    }
    await redis.expire(key, 60 * 60 * 24 * 7)
    return { ok: true }
  })

  app.post('/:cartId/checkout', async (req, reply) => {
    const params = z.object({ cartId: z.string().uuid() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const key = cartKey(params.data.cartId)
    const data = await redis.hgetall(key)
    if (Object.keys(data).length === 0) return reply.status(400).send({ error: 'empty_cart' })

    const entries = Object.entries(data).map(([productId, qty]) => ({ productId: Number(productId), quantity: Number(qty) }))
    const ids = entries.map(e => e.productId)
    const products = await prisma.product.findMany({ where: { id: { in: ids } } })
    const byId = new Map(products.map(p => [p.id, p]))

    let total = 0
    for (const e of entries) {
      const p = byId.get(e.productId)
      if (!p) return reply.status(400).send({ error: 'invalid_product', productId: e.productId })
      total += Number(p.price) * e.quantity
    }

    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        total,
        items: {
          create: entries.map(e => {
            const p = byId.get(e.productId)!
            return { productId: p.id, quantity: e.quantity, price: p.price }
          })
        }
      },
      include: { items: true }
    })

    await redis.del(key)
    return { order }
  })
}


