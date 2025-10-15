import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, index } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['owner', 'mod', 'member']);
export const postStatusEnum = pgEnum('post_status', ['open', 'in_progress', 'answered', 'verified']);
export const entityTypeEnum = pgEnum('entity_type', ['post', 'answer']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isSprintMode: boolean('is_sprint_mode').default(false).notNull(),
  sprintEndsAt: timestamp('sprint_ends_at'),
});

export const roomMembers = pgTable('room_members', {
  userId: uuid('user_id').notNull().references(() => users.id),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  role: userRoleEnum('role').notNull(),
}, (table) => ({
  pk: { columns: [table.userId, table.roomId] },
}));

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  bodyMarkdown: text('body_markdown').notNull(),
  bodyText: text('body_text').notNull(),
  status: postStatusEnum('status').default('open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},   (table) => ({
    roomCreatedIdx: index("idx_posts_room_created").on(table.roomId, table.createdAt),
  }));

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  bodyMarkdown: text('body_markdown').notNull(),
  bodyText: text('body_text').notNull(),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const votes = pgTable('votes', {
  userId: uuid('user_id').notNull().references(() => users.id),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  value: integer('value').notNull().$type<-1 | 1>(),
}, (table) => ({
  pk: { columns: [table.userId, table.entityType, table.entityId] },
}));
