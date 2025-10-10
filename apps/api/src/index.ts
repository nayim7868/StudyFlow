import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { swaggerPlugin } from './plugins/swagger.js';
import { healthRoutes } from './routes/health.js';

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

await app.register(cookie);

await app.register(swaggerPlugin);

await app.register(healthRoutes);

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`API running at http://${HOST}:${PORT}`);
  console.log(`Swagger UI at http://${HOST}:${PORT}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
