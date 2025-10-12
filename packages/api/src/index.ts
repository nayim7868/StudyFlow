import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(helmet);
await fastify.register(cors, {
  origin: ['http://localhost:5173'],
  credentials: true,
});
await fastify.register(cookie);
await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'StudyFlow API',
      description: 'StudyFlow API Documentation',
      version: '1.0.0',
    },
    host: 'localhost:4000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});
await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Health check routes
fastify.get('/healthz', {
  schema: {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
}, async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

fastify.get('/readyz', {
  schema: {
    description: 'Readiness check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
}, async (request, reply) => {
  return {
    status: 'ready',
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:4000');
    console.log('API docs available at http://localhost:4000/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
