import { Hono } from "hono";
import { cors } from "hono/cors";
import { nanoid } from "nanoid";
import { getDb, ensureTables, Bindings } from "./db";
import { events, groups, resources, personnel } from "./db/schema";
import { eq } from "drizzle-orm";
import { settings } from "./data";
import { seed } from "./seed";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

// Initialize DB (Local SQLite only)
// For D1, tables should be created via wrangler migrations, but for simple demo we can skip or assume created.
// Initialize DB (Local SQLite only)
ensureTables();

// Auto-seed for local development (Immediate execution on startup)
(async () => {
	try {
		// Attempt to get DB without env (works for local Bun + SQLite)
		const db = getDb();
		const groupCount = await db.select().from(groups).limit(1);
		if (groupCount.length === 0) {
			console.log("Local DB empty, seeding...");
			await seed(db);
		}
	} catch (e) {
		// Ignore errors that might occur if this is running in a context where
		// local getDb() fails (though ensureTables() implies local context).
		console.log("Skipping local auto-seed (env specific)");
	}
})();

// Legacy Middleware check (Optional: keeping for D1/Env specific cases if needed, though immediate check handles local)
app.use("*", async (c, next) => {
	// We can keep this for D1 environments where immediate execution above fails due to missing env
	const db = getDb(c.env);
	try {
		// Only check if we are in an environment that has DB binding (D1)
		if (c.env && c.env.DB) {
			const groupCount = await db.select().from(groups).limit(1);
			if (groupCount.length === 0) {
				await seed(db);
			}
		}
	} catch (e) {
		// Silent fail or log
	}
	await next();
});

// --- Config ---

app.get("/api/config", async (c) => {
	const db = getDb(c.env);
	const allGroups = await db.select().from(groups).all();
	const allResources = await db.select().from(resources).all();

	return c.json({
		groups: allGroups,
		resources: allResources,
		settings,
	});
});

// --- Events CRUD ---

app.get("/api/events", async (c) => {
	const db = getDb(c.env);
	const personnelIdsParam = c.req.query("personnelIds");
	const allEvents = await db.select().from(events).all();

	let filteredEvents = allEvents;

	// Filter by personnel IDs (Regular Calendar View)
	if (personnelIdsParam) {
		const personnelIds = new Set(personnelIdsParam.split(","));
		filteredEvents = filteredEvents.filter((event: any) => {
			// Check attendee JSON list (Primary)
			try {
				if (event.attendee && event.attendee !== "[]") {
					const attendees = JSON.parse(event.attendee);
					if (Array.isArray(attendees)) {
						// Return true if ANY attendee matches requested IDs
						if (
							attendees.some(
								(a: any) => a.personnelId && personnelIds.has(a.personnelId),
							)
						) {
							return true;
						}
					}
				}
			} catch { }

			// Check extendedProps (Legacy Fallback)
			const extProps = event.extendedProps;
			if (typeof extProps === "string") {
				try {
					const parsed = JSON.parse(extProps);
					return personnelIds.has(parsed.personnelId);
				} catch {
					return false;
				}
			} else if (extProps && typeof extProps === "object") {
				return personnelIds.has(extProps.personnelId);
			}

			return false;
		});
	}

	return c.json(filteredEvents);
});

// --- Resource Availability ---
// 指定日付・期間のリソース予約状況を返す
app.get("/api/resource-availability", async (c) => {
	const db = getDb(c.env);
	const dateParam = c.req.query("date");
	const viewParam = c.req.query("view") || "day"; // day, week, month

	// 基準日
	const targetDate = dateParam ? new Date(dateParam) : new Date();

	// 期間の計算
	let startDate = new Date(targetDate);
	startDate.setHours(0, 0, 0, 0);
	let endDate = new Date(targetDate);
	endDate.setHours(23, 59, 59, 999);

	if (viewParam === "week") {
		const day = startDate.getDay(); // 0 (Sun) - 6 (Sat)
		// Assume week starts on Sunday
		const diff = startDate.getDate() - day;
		startDate.setDate(diff);
		endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 6);
		endDate.setHours(23, 59, 59, 999);
	} else if (viewParam === "month") {
		startDate.setDate(1);
		endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(0); // Last day of previous month
		endDate.setHours(23, 59, 59, 999);
	}

	// 全イベントを取得
	const allEvents = await db.select().from(events).all();

	// リソースに紐づくイベントのみフィルタ
	const resourceEvents = allEvents.filter((e: any) => !!e.resourceId);

	// 指定期間と重なるイベントをフィルタ
	const periodEvents = resourceEvents.filter((e: any) => {
		// 終日イベントの処理
		const isAllDayVal =
			e.isAllDay ??
			(typeof e.extendedProps === "object" ? e.extendedProps?.isAllDay : false);
		const isAllDay =
			isAllDayVal === true ||
			isAllDayVal === "true" ||
			isAllDayVal === 1 ||
			isAllDayVal === "1";

		let eStart = new Date(e.startDate);
		let eEnd = new Date(e.endDate);

		if (isAllDay) {
			eStart.setHours(0, 0, 0, 0);
			if (
				eEnd <= eStart ||
				(eEnd.getDate() === eStart.getDate() &&
					eEnd.getFullYear() === eStart.getFullYear() &&
					eEnd.getMonth() === eStart.getMonth())
			) {
				eEnd = new Date(eStart);
				eEnd.setDate(eEnd.getDate() + 1);
			} else {
				eEnd.setHours(0, 0, 0, 0);
				if (eEnd <= eStart) {
					eEnd = new Date(eStart);
					eEnd.setDate(eEnd.getDate() + 1);
				}
			}
		}

		// 期間と重なるか判定
		return startDate < eEnd && endDate > eStart;
	});

	// 全リソースを取得
	const allResources = await db.select().from(resources).all();

	// 各リソースの空き状況を計算
	const availability = allResources.map((resource: any) => {
		const resourceBookings = periodEvents.filter(
			(e: any) => e.resourceId === resource.id && e.status !== "cancelled",
		);
		return {
			resourceId: resource.id,
			resourceName: resource.name,
			groupId: resource.groupId,
			isAvailable: resourceBookings.length === 0, // 期間中完全に空いているか (FacilityViewではあまり意味がないがModalの単日では有効)
			bookings: resourceBookings.map((e: any) => ({
				id: e.id,
				eventId: e.id,
				title: e.title,
				startDate: e.startDate,
				endDate: e.endDate,
				isAllDay: e.isAllDay,
				attendee: e.attendee,
				resourceId: e.resourceId,
				extendedProps: e.extendedProps,
			})),
		};
	});

	return c.json({
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		view: viewParam,
		resources: availability,
	});
});

app.post("/api/events", async (c) => {
	const db = getDb(c.env);
	const body = await c.req.json();

	// Infer groupId from resource if not provided and resourceId exists
	let groupId = body.groupId;
	if (!groupId && body.resourceId) {
		const resource = await db
			.select()
			.from(resources)
			.where(eq(resources.id, body.resourceId))
			.get();
		if (resource) {
			groupId = resource.groupId;
		}
	}

	const newEvent = {
		id: nanoid(),
		resourceId: body.resourceId,
		groupId: groupId, // Added groupId here
		title: body.title,
		startDate: body.startDate,
		endDate: body.endDate,
		attendee: body.attendee,
		status: body.status || "booked", // Default status if not provided
		note: body.note,
		isAllDay: body.isAllDay ?? body.extendedProps?.isAllDay ?? false, // Handle both root and props during transition
		extendedProps: body.extendedProps, // Drizzle handles JSON stringification
		createdAt: new Date(), // Added createdAt
		updatedAt: new Date(), // Added updatedAt
	};

	const result = await db.insert(events).values(newEvent).returning();
	console.log("Created event:", result[0]);
	return c.json(result[0], 201); // Return the created object with 201 status
});

app.put("/api/events/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	const body = await c.req.json();

	// Explicitly allow extendedProps update
	const cleanUpdate: any = {};
	if (body.title !== undefined) cleanUpdate.title = body.title;
	if (body.attendee !== undefined) cleanUpdate.attendee = body.attendee;
	if (body.resourceId !== undefined) {
		cleanUpdate.resourceId = body.resourceId;
		if (body.resourceId) {
			const resource = await db
				.select()
				.from(resources)
				.where(eq(resources.id, body.resourceId))
				.get();
			if (resource) {
				cleanUpdate.groupId = resource.groupId;
			}
		} else {
			cleanUpdate.groupId = null;
		}
	}
	if (body.startDate !== undefined) cleanUpdate.startDate = body.startDate;
	if (body.endDate !== undefined) cleanUpdate.endDate = body.endDate;
	if (body.status !== undefined) cleanUpdate.status = body.status;
	if (body.note !== undefined) cleanUpdate.note = body.note;
	if (body.isAllDay !== undefined) cleanUpdate.isAllDay = body.isAllDay;
	if (body.extendedProps !== undefined)
		cleanUpdate.extendedProps = body.extendedProps;
	cleanUpdate.updatedAt = new Date();

	await db.update(events).set(cleanUpdate).where(eq(events.id, id));

	const updated = await db.select().from(events).where(eq(events.id, id)).get();
	return c.json(updated);
});

app.delete("/api/events/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	await db.delete(events).where(eq(events.id, id));
	return c.json({ success: true });
});

// --- Groups CRUD ---

app.post("/api/groups", async (c) => {
	const db = getDb(c.env);
	const body = await c.req.json();
	const newGroupId = crypto.randomUUID();

	const toInsert = {
		id: newGroupId,
		name: body.name,
		displayMode: body.displayMode || "grid",
		dimension: body.dimension || 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	await db.insert(groups).values(toInsert);
	return c.json(
		{
			...toInsert,
			resources: [], // Return with empty resources for frontend consistency
		},
		201,
	);
});

app.put("/api/groups/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	const body = await c.req.json();

	const cleanUpdate: any = {};
	if (body.name !== undefined) cleanUpdate.name = body.name;
	if (body.displayMode !== undefined)
		cleanUpdate.displayMode = body.displayMode;
	if (body.dimension !== undefined) cleanUpdate.dimension = body.dimension;
	cleanUpdate.updatedAt = new Date();

	await db.update(groups).set(cleanUpdate).where(eq(groups.id, id));
	const updated = await db.select().from(groups).where(eq(groups.id, id)).get();
	return c.json(updated);
});

app.delete("/api/groups/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	// Note: In a real app, we should probably check for dependent resources/events or cascade delete.
	// For this example, we'll just delete the group.
	await db.delete(groups).where(eq(groups.id, id));
	return c.json({ success: true });
});

// --- Resources CRUD ---

app.post("/api/resources", async (c) => {
	const db = getDb(c.env);
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

app.put("/api/resources/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	const body = await c.req.json();

	const cleanUpdate: any = {};
	if (body.name !== undefined) cleanUpdate.name = body.name;
	if (body.groupId !== undefined) cleanUpdate.groupId = body.groupId;
	if (body.order !== undefined) cleanUpdate.order = body.order;
	if (body.isAvailable !== undefined)
		cleanUpdate.isAvailable = body.isAvailable;
	cleanUpdate.updatedAt = new Date();

	await db.update(resources).set(cleanUpdate).where(eq(resources.id, id));
	const updated = await db
		.select()
		.from(resources)
		.where(eq(resources.id, id))
		.get();
	return c.json(updated);
});

app.delete("/api/resources/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	await db.delete(resources).where(eq(resources.id, id));
	return c.json({ success: true });
});

// --- Personnel ---

app.get("/api/personnel", async (c) => {
	const db = getDb(c.env);
	const allPersonnel = await db.select().from(personnel).all();
	// Sort by priority (desc) then name (asc)
	allPersonnel.sort(
		(
			a: { priority: number; name: string },
			b: { priority: number; name: string },
		) => {
			if (b.priority !== a.priority) return b.priority - a.priority;
			return a.name.localeCompare(b.name, "ja");
		},
	);
	return c.json(allPersonnel);
});

app.put("/api/personnel/:id", async (c) => {
	const db = getDb(c.env);
	const id = c.req.param("id");
	const body = await c.req.json();

	const cleanUpdate: any = {};
	if (body.priority !== undefined) cleanUpdate.priority = body.priority;
	cleanUpdate.updatedAt = new Date();

	await db.update(personnel).set(cleanUpdate).where(eq(personnel.id, id));
	const updated = await db
		.select()
		.from(personnel)
		.where(eq(personnel.id, id))
		.get();
	return c.json(updated);
});

// --- Scheduled Reset (Cron) ---

const worker = {
	port: 3006,
	fetch: app.fetch,
	async scheduled(event: any, env: Bindings, ctx: any) {
		console.log("Scheduled reset triggered");
		const db = getDb(env);

		// Delete all data
		await db.delete(events);
		await db.delete(resources);
		await db.delete(groups);
		await db.delete(personnel);

		// Reseed
		await seed(db);
		console.log("Database reset complete");
	},
};

export default worker;

console.log("Server running on http://localhost:3006");
