import { redis } from './lib/redis'

async function computeAndCache() {
  const topProducts = await redis.zrevrange('metrics:products:views', 0, 9, 'WITHSCORES') as unknown as string[]
  const products: Array<{ id: string; views: number }> = []
  for (let i = 0; i < topProducts.length; i += 2) {
    const id = topProducts[i] ?? ''
    const scoreStr = topProducts[i + 1] ?? '0'
    products.push({ id, views: Number(scoreStr) || 0 })
  }

  const topPages = await redis.zrevrange('metrics:pages:views', 0, 9, 'WITHSCORES') as unknown as string[]
  const pages: Array<{ path: string; views: number; avgDwellMs?: number }> = []
  for (let i = 0; i < topPages.length; i += 2) {
    const path = topPages[i] ?? ''
    const scoreStr = topPages[i + 1] ?? '0'
    const views = Number(scoreStr) || 0
    const totalMs = Number((await redis.hget('metrics:pages:dwellMs', path)) ?? '0') || 0
    const count = Number((await redis.hget('metrics:pages:dwellCount', path)) ?? '0') || 0
    const avg = count > 0 ? totalMs / count : undefined
    const item: { path: string; views: number; avgDwellMs?: number } = { path, views }
    if (avg !== undefined) item.avgDwellMs = avg
    pages.push(item)
  }

  await redis.set('metrics:cache:top-products', JSON.stringify({ at: Date.now(), items: products }))
  await redis.set('metrics:cache:top-pages', JSON.stringify({ at: Date.now(), items: pages }))
}

async function main() {
  await new Promise((r) => setTimeout(r, 2000))
  while (true) {
    try { await computeAndCache() } catch {}
    await new Promise((r) => setTimeout(r, 15000))
  }
}

main().catch(() => process.exit(1))
