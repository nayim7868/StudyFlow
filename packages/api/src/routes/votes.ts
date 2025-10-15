import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { votes } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const createVoteSchema = z.object({
  entityType: z.enum(['post', 'answer']),
  entityId: z.string().uuid(),
  value: z.union([z.literal(-1), z.literal(1)]),
});

export async function voteRoutes(fastify: FastifyInstance) {
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

        return { message: 'Vote removed' };
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

    return {
      userId: demoUserId,
      entityType,
      entityId,
      value,
    };
  });
}
