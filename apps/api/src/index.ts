import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import healthRoutes from './routes/health.js';

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
});

await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(cookie);

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'StudyFlow API',
      description: 'API documentation for StudyFlow',
      version: '0.0.0',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
});

await fastify.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

await fastify.register(healthRoutes);

try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Docs available at http://${HOST}:${PORT}/docs`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
