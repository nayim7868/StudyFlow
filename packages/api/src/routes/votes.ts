import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { votes } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const createVoteSchema = z.object({
  entityType: z.enum(['post', 'answer']),
  entityId: z.string().uuid(),
  value: z.union([z.literal(-1), z.literal(1)]),
});

const voteRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/votes', {
    schema: {
      description: 'Create or update a vote',
      tags: ['votes'],
      body: {
        type: 'object',
        properties: {
          entityType: { type: 'string', enum: ['post', 'answer'] },
          entityId: { type: 'string', format: 'uuid' },
          value: { type: 'integer', enum: [-1, 1] },
        },
        required: ['entityType', 'entityId', 'value'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            entityType: { type: 'string' },
            entityId: { type: 'string' },
            value: { type: 'integer' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { entityType, entityId, value } = createVoteSchema.parse(request.body);

    // For demo purposes, use a default user ID or from header
    const demoUserId = request.headers['x-demo-user'] as string || '00000000-0000-0000-0000-000000000001';

    // Check if vote already exists
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, demoUserId),
          eq(votes.entityType, entityType),
          eq(votes.entityId, entityId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      // If same value, remove vote (toggle)
      if (existingVote[0].value === value) {
        await db
          .delete(votes)
          .where(
            and(
              eq(votes.userId, demoUserId),
              eq(votes.entityType, entityType),
              eq(votes.entityId, entityId)
            )
          );
      } else {
        // Update to new value
        await db
          .update(votes)
          .set({ value })
          .where(
            and(
              eq(votes.userId, demoUserId),
              eq(votes.entityType, entityType),
              eq(votes.entityId, entityId)
            )
          );
      }
    } else {
      // Create new vote
      await db.insert(votes).values({
        userId: demoUserId,
        entityType,
        entityId,
        value,
      });
    }

    // Get updated score and current user's vote
    const scoreResult = await db
      .select({ score: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
      .from(votes)
      .where(and(
        eq(votes.entityType, entityType),
        eq(votes.entityId, entityId)
      ));

    const currentVoteResult = await db
      .select({ value: votes.value })
      .from(votes)
      .where(and(
        eq(votes.userId, demoUserId),
        eq(votes.entityType, entityType),
        eq(votes.entityId, entityId)
      ))
      .limit(1);

    return {
      score: Number(scoreResult[0]?.score || 0),
      currentUserValue: currentVoteResult[0]?.value || null,
    };
  });
};

export default voteRoutes;
