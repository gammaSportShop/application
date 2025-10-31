import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { pullNotifications, listNotifications } from '../lib/notify'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

function signToken(payload: object): string {
  const secret = process.env.JWT_SECRET || 'devsecret'
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export default async function authRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/register', async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'invalid_input' })
    }
    const { email, password, name } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.status(409).send({ error: 'email_taken' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash, name: name ?? null } })
    const token = signToken({ sub: String(user.id), email: user.email })
    return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } })
  })

  app.post('/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'invalid_input' })
    }
    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(401).send({ error: 'invalid_credentials' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return reply.status(401).send({ error: 'invalid_credentials' })
    }
    const token = signToken({ sub: String(user.id), email: user.email })
    return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } })
  })
  app.get('/notifications', async (req, reply) => {
    const header = req.headers['authorization']
    if (!header || !header.startsWith('Bearer ')) return reply.status(401).send({ error: 'unauthorized' })
    const token = header.slice(7)
    let userId = 0
    try {
      const secret = process.env.JWT_SECRET || 'devsecret'
      const payload = jwt.verify(token, secret) as any
      userId = Number(payload.sub)
    } catch {
      return reply.status(401).send({ error: 'unauthorized' })
    }
    const items = await pullNotifications(userId)
    return reply.send({ items })
  })
  app.get('/notifications/list', async (req, reply) => {
    const header = req.headers['authorization']
    if (!header || !header.startsWith('Bearer ')) return reply.status(401).send({ error: 'unauthorized' })
    const token = header.slice(7)
    let userId = 0
    try {
      const secret = process.env.JWT_SECRET || 'devsecret'
      const payload = jwt.verify(token, secret) as any
      userId = Number(payload.sub)
    } catch {
      return reply.status(401).send({ error: 'unauthorized' })
    }
    const items = await listNotifications(userId)
    return reply.send({ items })
  })
}


