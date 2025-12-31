import { pgTable, text, boolean, jsonb, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
    id: text('id').primaryKey(), // Or uuid('id').primaryKey().defaultRandom()
    name: text('name').notNull(),
    displayMode: text('display_mode').notNull().default('grid'),
    dimension: integer('dimension').notNull().default(1),
});

export const resources = pgTable('resources', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    order: integer('order_index').notNull(),
    isAvailable: boolean('is_available').notNull().default(true), // Native boolean
    groupId: text('group_id').references(() => groups.id),
});

export const events = pgTable('events', {
    id: text('id').primaryKey(),
    resourceId: text('resource_id').references(() => resources.id), // Nullable for notification events
    groupId: text('group_id'),
    title: text('title').notNull(),
    attendee: text('attendee').notNull().default('Anonymous'),
    startDate: timestamp('start_date').notNull(), // Native timestamp
    endDate: timestamp('end_date').notNull(),     // Native timestamp
    status: text('status').notNull().default('booked'),
    note: text('note'),
    isAllDay: boolean('is_all_day').default(false), // Native boolean
    extendedProps: jsonb('extended_props'),         // Native JSONB
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const personnel = pgTable('personnel', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    department: text('department').notNull(),
    email: text('email').notNull(),
    priority: integer('priority').notNull().default(0), // -1=低, 0=通常, 1=高
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

