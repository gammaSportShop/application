"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(1).optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
function signToken(payload) {
    const secret = process.env.JWT_SECRET || 'devsecret';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
}
async function authRoutes(app, _opts) {
    app.post('/register', async (req, reply) => {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: 'invalid_input' });
        }
        const { email, password, name } = parsed.data;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return reply.status(409).send({ error: 'email_taken' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({ data: { email, passwordHash, name: name ?? null } });
        const token = signToken({ sub: String(user.id), email: user.email });
        return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
    app.post('/login', async (req, reply) => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: 'invalid_input' });
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.status(401).send({ error: 'invalid_credentials' });
        }
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok) {
            return reply.status(401).send({ error: 'invalid_credentials' });
        }
        const token = signToken({ sub: String(user.id), email: user.email });
        return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
}
//# sourceMappingURL=auth.js.map