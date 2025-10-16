
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { db } from './db/index.js';
import roomRoutes from './routes/rooms.js';
import postRoutes from './routes/posts.js';
import answerRoutes from './routes/answers.js';
import voteRoutes from './routes/votes.js';

dotenv.config();

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

// Register route modules
await fastify.register(roomRoutes);
await fastify.register(postRoutes);
await fastify.register(answerRoutes);
await fastify.register(voteRoutes);

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
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
          ok: { type: 'boolean' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
}, async (request, reply) => {
  try {
    // Test database connection with timeout
    const dbPromise = db.execute('SELECT 1');
    const dbTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB timeout')), 500)
    );
    await Promise.race([dbPromise, dbTimeout]);

    // Test Redis connection with timeout
    const redisPromise = fetch(`${process.env.REDIS_URL || 'redis://localhost:6379'}/ping`)
      .then(res => res.text())
      .then(text => text === 'PONG');
    const redisTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis timeout')), 500)
    );
    await Promise.race([redisPromise, redisTimeout]);

    return {
      ok: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    reply.status(503);
    return {
      ok: false,
      timestamp: new Date().toISOString(),
      error: 'Service not ready',
    };
  }
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`API docs available at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
