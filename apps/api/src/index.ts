import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const app = Fastify({ logger: true });

async function buildServer() {
  await app.register(cors, { origin: true, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'StudyFlow API',
        description: 'API documentation for StudyFlow',
        version: '0.1.0',
      },
      tags: [
        { name: 'health', description: 'Health and readiness checks' }
      ],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/healthz', {
    schema: {
      tags: ['health'],
      response: { 200: { type: 'object', properties: { status: { type: 'string' } } } },
    },
  }, async () => ({ status: 'ok' }));

  app.get('/readyz', {
    schema: {
      tags: ['health'],
      response: { 200: { type: 'object', properties: { status: { type: 'string' } } } },
    },
  }, async () => ({ status: 'ok' }));

  return app;
}

async function start() {
  try {
    await buildServer();
    const port = Number(process.env.PORT || 4000);
    const host = process.env.HOST || '0.0.0.0';
    await app.listen({ port, host });
    app.log.info(`Server listening at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
