import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'unauthorized' })
  }
  const token = header.slice(7)
  try {
    const secret = process.env.JWT_SECRET || 'devsecret'
    const payload = jwt.verify(token, secret) as any
    ;(request as any).user = { id: Number(payload.sub), email: payload.email }
  } catch {
    return reply.status(401).send({ error: 'unauthorized' })
  }
}


