import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db, ensureTables } from './db';
import { events, groups, resources } from './db/schema';
import { eq } from 'drizzle-orm';
import { settings, groups as seedGroups, resources as seedResources, events as seedEvents } from './data';

const app = new Hono();

app.use('/*', cors());

// Initialize DB
ensureTables();

// Seed logic (Simple check)
const groupCount = await db.select().from(groups).limit(1);
if (groupCount.length === 0) {
    console.log('Seeding database...');
    await db.insert(groups).values(seedGroups);
    await db.insert(resources).values(seedResources);
    await db.insert(events).values(seedEvents);
    console.log('Seeding complete.');
}

// --- Config ---

app.get('/api/config', async (c) => {
    const allGroups = await db.select().from(groups).all();
    const allResources = await db.select().from(resources).all();

    return c.json({
        groups: allGroups,
        resources: allResources,
        settings
    });
});

// --- Events CRUD ---

app.get('/api/events', async (c) => {
    const allEvents = await db.select().from(events).all();
    return c.json(allEvents);
});

app.post('/api/events', async (c) => {
    const body = await c.req.json();
    const newEventId = crypto.randomUUID();

    // Infer groupId from resource if not provided
    let groupId = body.groupId;
    if (!groupId && body.resourceId) {
        const resource = await db.select().from(resources).where(eq(resources.id, body.resourceId)).get();
        if (resource) {
            groupId = resource.groupId;
        }
    }

    const toInsert = {
        id: newEventId,
        title: body.title,
        resourceId: body.resourceId,
        groupId: groupId,
        startDate: body.startDate,
        endDate: body.endDate,
        status: body.status || 'booked',
        note: body.note,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(events).values(toInsert);

    // Return the created object
    // Drizzle with SQLite returns result object, not the row by default unless used with returning()
    // But bun-sqlite returning() support might vary, so let's just return what we inserted.
    return c.json(toInsert, 201);
});

app.put('/api/events/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const toUpdate = {
        ...body,
        updatedAt: new Date(),
    };

    // Remove undefined fields if any, generic clean up might be needed but for example we assume full body or partials handled by valid keys
    // For safety, let's explicitly map allowed fields to avoid error if body has extras
    const cleanUpdate: any = {};
    if (body.title !== undefined) cleanUpdate.title = body.title;
    if (body.resourceId !== undefined) cleanUpdate.resourceId = body.resourceId;
    if (body.startDate !== undefined) cleanUpdate.startDate = body.startDate;
    if (body.endDate !== undefined) cleanUpdate.endDate = body.endDate;
    if (body.status !== undefined) cleanUpdate.status = body.status;
    if (body.note !== undefined) cleanUpdate.note = body.note;
    cleanUpdate.updatedAt = new Date();

    await db.update(events)
        .set(cleanUpdate)
        .where(eq(events.id, id));

    const updated = await db.select().from(events).where(eq(events.id, id)).get();
    return c.json(updated);
});

app.delete('/api/events/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(events).where(eq(events.id, id));
    return c.json({ success: true });
});

// --- Groups CRUD ---

app.post('/api/groups', async (c) => {
    const body = await c.req.json();
    const newGroupId = crypto.randomUUID();

    const toInsert = {
        id: newGroupId,
        name: body.name,
        displayMode: body.displayMode || 'grid',
        dimension: body.dimension || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(groups).values(toInsert);
    return c.json({
        ...toInsert,
        resources: [] // Return with empty resources for frontend consistency
    }, 201);
});

app.put('/api/groups/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const cleanUpdate: any = {};
    if (body.name !== undefined) cleanUpdate.name = body.name;
    if (body.displayMode !== undefined) cleanUpdate.displayMode = body.displayMode;
    if (body.dimension !== undefined) cleanUpdate.dimension = body.dimension;
    cleanUpdate.updatedAt = new Date();

    await db.update(groups).set(cleanUpdate).where(eq(groups.id, id));
    const updated = await db.select().from(groups).where(eq(groups.id, id)).get();
    return c.json(updated);
});

app.delete('/api/groups/:id', async (c) => {
    const id = c.req.param('id');
    // Note: In a real app, we should probably check for dependent resources/events or cascade delete.
    // For this example, we'll just delete the group.
    await db.delete(groups).where(eq(groups.id, id));
    return c.json({ success: true });
});

// --- Resources CRUD ---

app.post('/api/resources', async (c) => {
    const body = await c.req.json();
    const newResourceId = crypto.randomUUID();

    const toInsert = {
        id: newResourceId,
        name: body.name,
        groupId: body.groupId,
        order: body.order || 0,
        isAvailable: body.isAvailable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(resources).values(toInsert);
    return c.json(toInsert, 201);
});

app.put('/api/resources/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const cleanUpdate: any = {};
    if (body.name !== undefined) cleanUpdate.name = body.name;
    if (body.groupId !== undefined) cleanUpdate.groupId = body.groupId;
    if (body.order !== undefined) cleanUpdate.order = body.order;
    if (body.isAvailable !== undefined) cleanUpdate.isAvailable = body.isAvailable;
    cleanUpdate.updatedAt = new Date();

    await db.update(resources).set(cleanUpdate).where(eq(resources.id, id));
    const updated = await db.select().from(resources).where(eq(resources.id, id)).get();
    return c.json(updated);
});

app.delete('/api/resources/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(resources).where(eq(resources.id, id));
    return c.json({ success: true });
});

export default {
    port: 3006,
    fetch: app.fetch,
};

console.log('Server running on http://localhost:3006 (SQLite)');
