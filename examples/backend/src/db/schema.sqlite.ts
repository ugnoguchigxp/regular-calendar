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
    resourceId: text('resource_id').references(() => resources.id), // Nullable for notification events
    groupId: text('group_id'), // Optional denormalization or just link via resource
    title: text('title').notNull(),
    attendee: text('attendee').notNull().default('Anonymous'),
    startDate: text('start_date').notNull(), // ISO string
    endDate: text('end_date').notNull(), // ISO string
    status: text('status').notNull().default('booked'),
    note: text('note'),
    isAllDay: integer('is_all_day', { mode: 'boolean' }).default(false), // Explicit column for Core feature
    extendedProps: text('extended_props', { mode: 'json' }), // For custom fields like 'usage'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const personnel = sqliteTable('personnel', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    department: text('department').notNull(),
    email: text('email').notNull(),
    priority: integer('priority').notNull().default(0), // -1=低, 0=通常, 1=高
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

