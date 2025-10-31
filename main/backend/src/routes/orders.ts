import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { pushNotification } from '../lib/notify'
import jwt from 'jsonwebtoken'
import { requireAuth } from '../plugins/requireAuth'

export default async function ordersRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/demo/checkout', async (req, reply) => {
    const body = z.object({
      cartId: z.string().uuid(),
      info: z.object({
        fullName: z.string().min(2),
        address: z.string().min(5),
        phone: z.string().min(5),
        notes: z.string().optional()
      })
    }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'invalid_body' })
    let userId: number | null = null
    const header = req.headers['authorization'] as string | undefined
    if (header && header.startsWith('Bearer ')) {
      try {
        const token = header.slice(7)
        const secret = process.env.JWT_SECRET || 'devsecret'
        const payload = jwt.verify(token, secret) as any
        userId = Number(payload.sub)
      } catch {}
    }
    const cartKey = `cart:${body.data.cartId}`
    const data = await redis.hgetall(cartKey)
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
        userId: userId,
        total,
        items: { create: entries.map(e => { const p = byId.get(e.productId)!; return { productId: p.id, quantity: e.quantity, price: p.price } }) }
      },
      include: { items: true }
    })
    await redis.del(cartKey)
    const stateKey = `order:${order.id}:state`
    const eventsKey = `order:${order.id}:events`
    await redis.hmset(stateKey, { phase: 'assembling', progress: '0', etaSec: String(0) })
    await redis.expire(stateKey, 60 * 60 * 24)
    await redis.del(eventsKey)
    await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'created', message: `Заказ #${order.id} создан` }))
    await redis.expire(eventsKey, 60 * 60 * 24)
    const jokes = [
      'Курьер увлекся паркуром и пропал на минутку',
      'Почтовый голубь решил перекусить по дороге',
      'Тележка с заказом застряла в песках времени',
      'Тренер отправил заказ на разминку'
    ]
    const scheduleKey = `order:${order.id}:schedule`
    await redis.del(scheduleKey)
    const base = 5 + Math.floor(Math.random() * 15)
    const assemble = base
    const toDist = base + Math.floor(Math.random() * 20)
    const ship = base + Math.floor(Math.random() * 30)
    const teleportFee = Math.max(1, Math.round(total * 0.05))
    await redis.hmset(scheduleKey, { assemble: String(assemble), toDist: String(toDist), ship: String(ship), fee: String(teleportFee) })
    if (userId) {
      try { await pushNotification(userId, 'success', `Заказ #${order.id} создан`, 'Спасибо за заказ', { orderId: order.id }) } catch {}
    }
    setTimeout(async () => {
      try {
        await redis.hmset(stateKey, { phase: 'assembling', progress: '100' })
        await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'assembled', message: 'Сборка завершена' }))
      } catch {}
    }, assemble * 1000)
    setTimeout(async () => {
      try {
        await redis.hmset(stateKey, { phase: 'to_distributor', progress: '50' })
        await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'to_distributor', message: 'Отправлено к дистрибьютору' }))
      } catch {}
    }, (assemble + toDist) * 1000)
    setTimeout(async () => {
      try {
        await redis.hmset(stateKey, { phase: 'distributor_shipping', progress: '50' })
        await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'shipping', message: 'Доставка от дистрибьютора' }))
      } catch {}
    }, (assemble + toDist + ship) * 1000)
    setTimeout(async () => {
      try {
        const unlucky = Math.random() < 0.15
        if (unlucky) {
          const reason = jokes[Math.floor(Math.random() * jokes.length)] || 'Произошла неожиданная задержка'
          await redis.hmset(stateKey, { phase: 'distributor_shipping', progress: '75' })
          await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'delay', message: reason }))
          setTimeout(async () => {
            try {
              await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } })
              await redis.hmset(stateKey, { phase: 'delivered', progress: '100' })
              await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'delivered', message: 'Заказ доставлен' }))
              if (userId) { try { await pushNotification(userId, 'success', `Заказ #${order.id} доставлен`, 'Готово', { orderId: order.id }) } catch {} }
            } catch {}
          }, 7 * 1000)
        } else {
          await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } })
          await redis.hmset(stateKey, { phase: 'delivered', progress: '100' })
          await redis.lpush(eventsKey, JSON.stringify({ ts: Date.now(), type: 'delivered', message: 'Заказ доставлен' }))
          if (userId) { try { await pushNotification(userId, 'success', `Заказ #${order.id} доставлен`, 'Готово', { orderId: order.id }) } catch {} }
        }
      } catch {}
    }, (assemble + toDist + ship + 10) * 1000)
    return { order, tracking: { id: order.id } }
  })

  app.addHook('preHandler', requireAuth)

  app.get('/', async (req) => {
    const user = (req as any).user
    const items = await prisma.order.findMany({
      where: { userId: user?.id ?? undefined },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    })
    return { items }
  })

  app.get('/:id', async (req, reply) => {
    const params = z.object({ id: z.coerce.number().int().positive() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const order = await prisma.order.findUnique({ where: { id: params.data.id }, include: { items: true } })
    if (!order) return reply.status(404).send({ error: 'not_found' })
    return { order }
  })

  app.patch('/:id/status', async (req, reply) => {
    const params = z.object({ id: z.coerce.number().int().positive() }).safeParse(req.params)
    const body = z.object({ status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELED']) }).safeParse(req.body)
    if (!params.success || !body.success) return reply.status(400).send({ error: 'invalid_input' })
    const order = await prisma.order.update({ where: { id: params.data.id }, data: { status: body.data.status } })
    return { order }
  })


  app.get('/:id/tracking', async (req, reply) => {
    const params = z.object({ id: z.coerce.number().int().positive() }).safeParse(req.params)
    if (!params.success) return reply.status(400).send({ error: 'invalid_params' })
    const state = await redis.hgetall(`order:${params.data.id}:state`)
    const schedule = await redis.hgetall(`order:${params.data.id}:schedule`)
    let events: any[] = []
    try {
      const raw = await redis.lrange(`order:${params.data.id}:events`, 0, -1)
      events = raw.map(x=>{ try { return JSON.parse(x) } catch { return null } }).filter(Boolean)
    } catch {}
    return { state, schedule, events }
  })

  app.post('/:id/teleport', async (req, reply) => {
    const params = z.object({ id: z.coerce.number().int().positive() }).safeParse(req.params)
    const body = z.object({ feeConfirmed: z.boolean() }).safeParse(req.body)
    if (!params.success || !body.success) return reply.status(400).send({ error: 'invalid_input' })
    const fee = Number((await redis.hget(`order:${params.data.id}:schedule`, 'fee')) || '0')
    if (!body.data.feeConfirmed) return reply.status(402).send({ error: 'fee_required', fee })
    await prisma.order.update({ where: { id: params.data.id }, data: { status: 'COMPLETED' } })
    await redis.hmset(`order:${params.data.id}:state`, { phase: 'delivered', progress: '100' })
    const user = (req as any).user
    try { await pushNotification(user?.id || 0, 'success', 'Мгновенная доставка выполнена', 'Телепорт') } catch {}
    return { ok: true }
  })
}


