import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/healthz',
    {
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
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    }
  );

  app.get(
    '/readyz',
    {
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
    },
    async () => {
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    }
  );
}
