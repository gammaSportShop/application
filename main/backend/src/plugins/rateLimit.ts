import { FastifyRequest, FastifyReply } from 'fastify'
import { redis } from '../lib/redis'

export async function rateLimit(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (request.method === 'OPTIONS') return
    const ip = (request.headers['x-forwarded-for'] as string) || request.ip
    const key = `ratelimit:${ip}`
    const limit = Number(process.env.RATE_LIMIT_MAX || 2000)
    const ttl = Number(process.env.RATE_LIMIT_TTL || 10)
    const n = await redis.incr(key)
    if (n === 1) await redis.expire(key, ttl)
    if (n > limit) return reply.status(429).send({ error: 'rate_limited' })
  } catch {
    return
  }
}


