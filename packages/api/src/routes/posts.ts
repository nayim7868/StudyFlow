import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { posts, answers, users } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { markdownToText } from '../util/markdown.js';

const createPostSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1).max(500),
  bodyMarkdown: z.string().min(1),
});

const getPostSchema = z.object({
  id: z.string().uuid(),
});

const postRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/posts', {
    schema: {
      description: 'Create a new post',
      tags: ['posts'],
      body: {
        type: 'object',
        properties: {
          roomId: { type: 'string', format: 'uuid' },
          title: { type: 'string', minLength: 1, maxLength: 500 },
          bodyMarkdown: { type: 'string', minLength: 1 },
        },
        required: ['roomId', 'title', 'bodyMarkdown'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { roomId, title, bodyMarkdown } = createPostSchema.parse(request.body);

    // For demo purposes, use a default user ID
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    const bodyText = markdownToText(bodyMarkdown);

    const [post] = await db.insert(posts).values({
      roomId,
      authorId: demoUserId,
      title,
      bodyMarkdown,
      bodyText,
    }).returning();

    reply.status(201);
    return {
      id: post.id,
      title: post.title,
      status: post.status,
      createdAt: post.createdAt.toISOString(),
    };
  });

  fastify.get('/posts/:id', {
    schema: {
      description: 'Get post with answers',
      tags: ['posts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            post: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                bodyMarkdown: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            answers: {
              type: 'array',
              items: {
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
        },
      },
    },
  }, async (request, reply) => {
    const { id } = getPostSchema.parse(request.params);

    const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    if (post.length === 0) {
      reply.status(404);
      return { error: 'Post not found' };
    }

    const postAnswers = await db
      .select({
        id: answers.id,
        bodyMarkdown: answers.bodyMarkdown,
        isAccepted: answers.isAccepted,
        createdAt: answers.createdAt,
      })
      .from(answers)
      .where(eq(answers.postId, id))
      .orderBy(asc(answers.createdAt));

    return {
      post: {
        id: post[0].id,
        title: post[0].title,
        bodyMarkdown: post[0].bodyMarkdown,
        status: post[0].status,
        createdAt: post[0].createdAt.toISOString(),
        updatedAt: post[0].updatedAt.toISOString(),
      },
      answers: postAnswers.map(answer => ({
        id: answer.id,
        bodyMarkdown: answer.bodyMarkdown,
        isAccepted: answer.isAccepted,
        createdAt: answer.createdAt.toISOString(),
      })),
    };
  });
};

export default postRoutes;
