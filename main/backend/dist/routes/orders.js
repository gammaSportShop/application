"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ordersRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../plugins/requireAuth");
async function ordersRoutes(app, _opts) {
    app.addHook('preHandler', requireAuth_1.requireAuth);
    app.get('/', async (req) => {
        const user = req.user;
        const items = await prisma_1.prisma.order.findMany({
            where: { userId: user?.id ?? undefined },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        return { items };
    });
    app.get('/:id', async (req, reply) => {
        const params = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).safeParse(req.params);
        if (!params.success)
            return reply.status(400).send({ error: 'invalid_params' });
        const order = await prisma_1.prisma.order.findUnique({ where: { id: params.data.id }, include: { items: true } });
        if (!order)
            return reply.status(404).send({ error: 'not_found' });
        return { order };
    });
    app.patch('/:id/status', async (req, reply) => {
        const params = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).safeParse(req.params);
        const body = zod_1.z.object({ status: zod_1.z.enum(['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELED']) }).safeParse(req.body);
        if (!params.success || !body.success)
            return reply.status(400).send({ error: 'invalid_input' });
        const order = await prisma_1.prisma.order.update({ where: { id: params.data.id }, data: { status: body.data.status } });
        return { order };
    });
}
//# sourceMappingURL=orders.js.map