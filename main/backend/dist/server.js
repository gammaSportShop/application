"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const auth_1 = __importDefault(require("./routes/auth"));
const catalog_1 = __importDefault(require("./routes/catalog"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const rateLimit_1 = require("./plugins/rateLimit");
const seed_1 = require("./seed");
const app = (0, fastify_1.default)({ logger: true });
app.addHook('preHandler', rateLimit_1.rateLimit);
app.get('/api/health', async () => ({ status: 'ok' }));
app.register(auth_1.default, { prefix: '/api/auth' });
app.register(catalog_1.default, { prefix: '/api/catalog' });
app.register(cart_1.default, { prefix: '/api/cart' });
app.register(orders_1.default, { prefix: '/api/orders' });
const port = parseInt(process.env.PORT || '3000');
app.listen({ port, host: '0.0.0.0' }).then(async () => {
    if (process.env.SEED_DEMO === 'true') {
        try {
            await (0, seed_1.seedDemo)();
        }
        catch { }
    }
}).catch((err) => {
    app.log.error(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map