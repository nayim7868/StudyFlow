import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'StudyFlow API',
        description: 'API for StudyFlow application',
        version: '0.0.0',
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Development server',
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
}
