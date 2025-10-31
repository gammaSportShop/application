"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function requireAuth(request, reply) {
    const header = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'unauthorized' });
    }
    const token = header.slice(7);
    try {
        const secret = process.env.JWT_SECRET || 'devsecret';
        const payload = jsonwebtoken_1.default.verify(token, secret);
        request.user = { id: Number(payload.sub), email: payload.email };
    }
    catch {
        return reply.status(401).send({ error: 'unauthorized' });
    }
}
//# sourceMappingURL=requireAuth.js.map