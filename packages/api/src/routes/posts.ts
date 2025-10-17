import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { posts, answers, users, votes, rooms } from '../db/schema.js';
import { eq, asc, sql, and } from 'drizzle-orm';
import { markdownToText } from '../util/markdown.js';

const createPostSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  bodyMarkdown: z.string().trim().min(3).max(10000),
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

    // Get post score
    const postScoreResult = await db
      .select({ score: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
      .from(votes)
      .where(and(
        eq(votes.entityType, 'post'),
        eq(votes.entityId, id)
      ));

    const postScore = Number(postScoreResult[0]?.score || 0);

    // Get answers with scores
    const postAnswers = await db
      .select({
        id: answers.id,
        bodyMarkdown: answers.bodyMarkdown,
        bodyText: answers.bodyText,
        isAccepted: answers.isAccepted,
        createdAt: answers.createdAt,
        score: sql<number>`COALESCE(SUM(${votes.value}), 0)`,
      })
      .from(answers)
      .leftJoin(votes, and(
        eq(votes.entityType, 'answer'),
        eq(votes.entityId, answers.id)
      ))
      .where(eq(answers.postId, id))
      .groupBy(answers.id)
      .orderBy(asc(answers.createdAt));

    // Get room info
    const roomInfo = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        slug: rooms.slug,
      })
      .from(rooms)
      .where(eq(rooms.id, post[0].roomId))
      .limit(1);

    return {
      post: {
        id: post[0].id,
        title: post[0].title,
        bodyMarkdown: post[0].bodyMarkdown,
        status: post[0].status,
        createdAt: post[0].createdAt.toISOString(),
        updatedAt: post[0].updatedAt.toISOString(),
        score: postScore,
      },
      answers: postAnswers.map(answer => ({
        id: answer.id,
        bodyMarkdown: answer.bodyMarkdown,
        bodyText: answer.bodyText,
        isAccepted: answer.isAccepted,
        createdAt: answer.createdAt.toISOString(),
        score: Number(answer.score),
      })),
      room: roomInfo[0] ? {
        id: roomInfo[0].id,
        name: roomInfo[0].name,
        slug: roomInfo[0].slug,
      } : null,
    };
  });
};

export default postRoutes;
