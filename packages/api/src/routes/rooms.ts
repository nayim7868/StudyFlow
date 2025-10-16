import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { rooms, roomMembers, posts, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const createRoomSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
});

const getRoomSchema = z.object({
  slug: z.string(),
});

const roomRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/rooms', {
    schema: {
      description: 'Create a new room',
      tags: ['rooms'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          slug: { type: 'string', minLength: 1, maxLength: 255, pattern: '^[a-z0-9-]+$' },
        },
        required: ['name', 'slug'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { name, slug } = createRoomSchema.parse(request.body);

    // For demo purposes, use a default user ID
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    const [room] = await db.insert(rooms).values({
      name,
      slug,
      createdBy: demoUserId,
    }).returning();

    await db.insert(roomMembers).values({
      userId: demoUserId,
      roomId: room.id,
      role: 'owner',
    });

    reply.status(201);
    return {
      id: room.id,
      name: room.name,
      slug: room.slug,
      createdAt: room.createdAt.toISOString(),
    };
  });

  fastify.get('/rooms/:slug', {
    schema: {
      description: 'Get room info with latest posts',
      tags: ['rooms'],
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            room: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                slug: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
            posts: {
              type: 'array',
              items: {
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
        },
      },
    },
  }, async (request, reply) => {
    const { slug } = getRoomSchema.parse(request.params);

    const room = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1);

    if (room.length === 0) {
      reply.status(404);
      return { error: 'Room not found' };
    }

    const latestPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        status: posts.status,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.roomId, room[0].id))
      .orderBy(desc(posts.createdAt))
      .limit(20);

    return {
      room: {
        id: room[0].id,
        name: room[0].name,
        slug: room[0].slug,
        createdAt: room[0].createdAt.toISOString(),
      },
      posts: latestPosts.map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        createdAt: post.createdAt.toISOString(),
      })),
    };
  });

  fastify.get('/rooms', {
    schema: {
      description: 'List all rooms',
      tags: ['rooms'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const allRooms = await db.select({
      id: rooms.id,
      name: rooms.name,
      slug: rooms.slug,
      createdAt: rooms.createdAt,
    }).from(rooms).orderBy(desc(rooms.createdAt));

    return allRooms.map(room => ({
      id: room.id,
      name: room.name,
      slug: room.slug,
      createdAt: room.createdAt.toISOString(),
    }));
  });
};

export default roomRoutes;
