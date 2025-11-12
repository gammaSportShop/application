import { FastifyInstance } from 'fastify'
import { redis } from '../lib/redis'

export default async function metricsRoutes(app: FastifyInstance) {
  app.post('/track', async (req, res) => {
    try {
      const body = (req.body ?? {}) as any
      const now = Date.now()
      const type = String(body.type || '')

      if (type === 'product_view' && body.productId) {
        const productId = String(body.productId)
        await redis.zincrby('metrics:products:views', 1, productId)
      } else if (type === 'page_view' && body.path) {
        const path = String(body.path)
        await redis.zincrby('metrics:pages:views', 1, path)
      } else if (type === 'dwell' && body.path && body.durationMs) {
        const path = String(body.path)
        const duration = Number(body.durationMs) || 0
        if (duration > 0) {
          await redis.hincrbyfloat('metrics:pages:dwellMs', path, duration)
          await redis.hincrby('metrics:pages:dwellCount', path, 1)
        }
      } else {
        return res.status(400).send({ ok: false })
      }

      await redis.lpush('metrics:events', JSON.stringify({ ...body, t: now }))
      await redis.ltrim('metrics:events', 0, 999)

      return { ok: true }
    } catch (e) {
      return res.status(500).send({ ok: false })
    }
  })

  app.get('/top-products', async (req, res) => {
    const entries = await redis.zrevrange('metrics:products:views', 0, 9, 'WITHSCORES') as unknown as string[]
    const items: Array<{ id: string; views: number }> = []
    for (let i = 0; i < entries.length; i += 2) {
      const id = entries[i] ?? ''
      const scoreStr = entries[i + 1] ?? '0'
      items.push({ id, views: Number(scoreStr) || 0 })
    }
    return { items }
  })

  app.get('/top-pages', async () => {
    const entries = await redis.zrevrange('metrics:pages:views', 0, 9, 'WITHSCORES') as unknown as string[]
    const items: Array<{ path: string; views: number; avgDwellMs?: number }> = []
    for (let i = 0; i < entries.length; i += 2) {
      const path = entries[i] ?? ''
      const scoreStr = entries[i + 1] ?? '0'
      const views = Number(scoreStr) || 0
      const totalMs = Number((await redis.hget('metrics:pages:dwellMs', path)) ?? '0') || 0
      const count = Number((await redis.hget('metrics:pages:dwellCount', path)) ?? '0') || 0
      const avg = count > 0 ? totalMs / count : undefined
      const item: { path: string; views: number; avgDwellMs?: number } = { path, views }
      if (avg !== undefined) item.avgDwellMs = avg
      items.push(item)
    }
    return { items }
  })
}
