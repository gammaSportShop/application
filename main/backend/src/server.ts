import Fastify from 'fastify'
import authRoutes from './routes/auth'
import catalogRoutes from './routes/catalog'
import cartRoutes from './routes/cart'
import ordersRoutes from './routes/orders'
import { rateLimit } from './plugins/rateLimit'
import { seedDemo } from './seed'
import metricsRoutes from './routes/metrics'

const app = Fastify({ logger: true })

app.addHook('preHandler', rateLimit)

app.get('/api/health', async () => ({ status: 'ok' }))

app.register(authRoutes, { prefix: '/api/auth' })
app.register(catalogRoutes, { prefix: '/api/catalog' })
app.register(cartRoutes, { prefix: '/api/cart' })
app.register(ordersRoutes, { prefix: '/api/orders' })
app.register(metricsRoutes, { prefix: '/api/metrics' })

const port = parseInt(process.env.PORT || '3000')
app.listen({ port, host: '0.0.0.0' }).then(async () => {
  if (process.env.SEED_DEMO === 'true') {
    try { await seedDemo() } catch {}
  }
}).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
