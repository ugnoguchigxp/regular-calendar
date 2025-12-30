import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const groups = sqliteTable('groups', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    displayMode: text('display_mode').notNull().default('grid'),
    dimension: integer('dimension').notNull().default(1),
});

export const resources = sqliteTable('resources', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    order: integer('order_index').notNull(),
    isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
    groupId: text('group_id').references(() => groups.id),
});

export const events = sqliteTable('events', {
    id: text('id').primaryKey(),
    resourceId: text('resource_id').notNull().references(() => resources.id),
    groupId: text('group_id'), // Optional denormalization or just link via resource
    title: text('title').notNull(),
    startDate: text('start_date').notNull(), // ISO string
    endDate: text('end_date').notNull(), // ISO string
    status: text('status').notNull().default('booked'),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
