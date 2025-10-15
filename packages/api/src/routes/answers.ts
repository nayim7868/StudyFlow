import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { answers } from '../db/schema.js';
import { markdownToText } from '../util/markdown.js';

const createAnswerSchema = z.object({
  postId: z.string().uuid(),
  bodyMarkdown: z.string().min(1),
});

export async function answerRoutes(fastify: FastifyInstance) {
  fastify.post('/answers', {
    schema: {
      description: 'Create a new answer',
      tags: ['answers'],
      body: {
        type: 'object',
        properties: {
          postId: { type: 'string', format: 'uuid' },
          bodyMarkdown: { type: 'string', minLength: 1 },
        },
        required: ['postId', 'bodyMarkdown'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bodyMarkdown: { type: 'string' },
            isAccepted: { type: 'boolean' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { postId, bodyMarkdown } = createAnswerSchema.parse(request.body);

    // For demo purposes, use a default user ID
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    const bodyText = markdownToText(bodyMarkdown);

    const [answer] = await db.insert(answers).values({
      postId,
      authorId: demoUserId,
      bodyMarkdown,
      bodyText,
    }).returning();

    reply.status(201);
    return {
      id: answer.id,
      bodyMarkdown: answer.bodyMarkdown,
      isAccepted: answer.isAccepted,
      createdAt: answer.createdAt.toISOString(),
    };
  });
}
