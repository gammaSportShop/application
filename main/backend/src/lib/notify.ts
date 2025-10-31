import { redis } from './redis'

function notifKey(userId: number) {
  return `user:${userId}:notifications`
}

export type NotificationKind = 'success' | 'error' | 'info'
type NotificationMeta = Record<string, any> | undefined

export async function pushNotification(userId: number, kind: NotificationKind, message: string, title?: string, meta?: NotificationMeta) {
  const id = Date.now()
  const payload = JSON.stringify({ id, kind, message, title, meta })
  const key = notifKey(userId)
  await redis.lpush(key, payload)
  await redis.ltrim(key, 0, 99)
  await redis.expire(key, 60 * 60 * 24 * 7)
}

export async function pullNotifications(userId: number) {
  const key = notifKey(userId)
  const items = await redis.lrange(key, 0, -1)
  await redis.del(key)
  return items.map((x) => {
    try { return JSON.parse(x) } catch { return null }
  }).filter(Boolean)
}

export async function listNotifications(userId: number) {
  const key = notifKey(userId)
  const items = await redis.lrange(key, 0, -1)
  return items.map((x) => {
    try { return JSON.parse(x) } catch { return null }
  }).filter(Boolean)
}


