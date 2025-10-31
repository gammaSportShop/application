"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const redis_1 = require("../lib/redis");
async function rateLimit(request, reply) {
    const ip = request.headers['x-forwarded-for'] || request.ip;
    const key = `ratelimit:${ip}`;
    const limit = Number(process.env.RATE_LIMIT_MAX || 100);
    const ttl = Number(process.env.RATE_LIMIT_TTL || 60);
    const n = await redis_1.redis.incr(key);
    if (n === 1)
        await redis_1.redis.expire(key, ttl);
    if (n > limit)
        return reply.status(429).send({ error: 'rate_limited' });
}
//# sourceMappingURL=rateLimit.js.map