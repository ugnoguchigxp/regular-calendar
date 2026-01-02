import { describe, expect, it } from "vitest";
import {
	DensityDataSchema,
	FacilityScheduleSettingsSchema,
	ResourceGroupSchema,
	ResourceSchema,
	ScheduleEventArraySchema,
	ScheduleEventSchema,
	TimeSlotSchema,
	ViewModeSchema,
} from "./RegularCalendar.schema";

describe("RegularCalendar ViewModeSchema", () => {
	it("validates valid view modes", () => {
		expect(ViewModeSchema.parse("day")).toBe("day");
		expect(ViewModeSchema.parse("week")).toBe("week");
		expect(ViewModeSchema.parse("month")).toBe("month");
	});

	it("rejects invalid view modes", () => {
		expect(() => ViewModeSchema.parse("year")).toThrow();
		expect(() => ViewModeSchema.parse("")).toThrow();
	});
});

describe("RegularCalendar ScheduleEventSchema", () => {
	const baseEvent = {
		id: "event-1",
		resourceId: "resource-1",
		groupId: "group-1",
		title: "Test Event",
		attendee: "John Doe",
		startDate: new Date("2025-01-01T10:00:00Z"),
		endDate: new Date("2025-01-01T11:00:00Z"),
		status: "confirmed",
		createdAt: new Date("2025-01-01T00:00:00Z"),
		updatedAt: new Date("2025-01-01T00:00:00Z"),
	};

	it("validates valid schedule event", () => {
		const result = ScheduleEventSchema.parse(baseEvent);
		expect(result.id).toBe("event-1");
	});

	it("validates with optional fields", () => {
		const result = ScheduleEventSchema.parse({
			...baseEvent,
			description: "Test description",
			note: "Test note",
			color: "#ff0000",
			isAllDay: true,
			hasConflict: false,
			extendedProps: { customField: "value" },
		});
		expect(result.description).toBe("Test description");
	});

	it("requires resourceId", () => {
		expect(() =>
			ScheduleEventSchema.parse({
				...baseEvent,
				resourceId: null,
			}),
		).toThrow();
	});

	it("rejects event without required fields", () => {
		expect(() => ScheduleEventSchema.parse({})).toThrow();
	});
});

describe("RegularCalendar ScheduleEventArraySchema", () => {
	it("validates array of events", () => {
		const events = [
			{
				id: "event-1",
				resourceId: "resource-1",
				groupId: "group-1",
				title: "Event 1",
				attendee: "John Doe",
				startDate: new Date("2025-01-01T10:00:00Z"),
				endDate: new Date("2025-01-01T11:00:00Z"),
				status: "confirmed",
				createdAt: new Date("2025-01-01T00:00:00Z"),
				updatedAt: new Date("2025-01-01T00:00:00Z"),
			},
		];
		const result = ScheduleEventArraySchema.parse(events);
		expect(result).toHaveLength(1);
	});
});

describe("RegularCalendar ResourceSchema", () => {
	const baseResource = {
		id: "resource-1",
		name: "Resource 1",
		order: 1,
		isAvailable: true,
		groupId: "group-1",
		createdAt: new Date("2025-01-01T00:00:00Z"),
		updatedAt: new Date("2025-01-01T00:00:00Z"),
	};

	it("validates valid resource", () => {
		const result = ResourceSchema.parse(baseResource);
		expect(result.id).toBe("resource-1");
	});

	it("validates with deletedAt", () => {
		const result = ResourceSchema.parse({
			...baseResource,
			deletedAt: new Date("2025-01-02T00:00:00Z"),
		});
		expect(result.deletedAt).toBeDefined();
	});
});

describe("RegularCalendar ResourceGroupSchema", () => {
	const baseGroup = {
		id: "group-1",
		name: "Group 1",
		displayMode: "grid" as const,
		dimension: 3,
		resources: [],
		createdAt: new Date("2025-01-01T00:00:00Z"),
		updatedAt: new Date("2025-01-01T00:00:00Z"),
	};

	it("validates valid resource group", () => {
		const result = ResourceGroupSchema.parse(baseGroup);
		expect(result.id).toBe("group-1");
	});

	it("validates with list display mode", () => {
		const result = ResourceGroupSchema.parse({
			...baseGroup,
			displayMode: "list" as const,
		});
		expect(result.displayMode).toBe("list");
	});
});

describe("RegularCalendar TimeSlotSchema", () => {
	const baseSlot = {
		id: "slot-1",
		label: "Morning",
		startTime: "09:00",
		endTime: "12:00",
	};

	it("validates time slot with string id", () => {
		const result = TimeSlotSchema.parse(baseSlot);
		expect(result.id).toBe("slot-1");
	});

	it("validates time slot with number id", () => {
		const result = TimeSlotSchema.parse({
			...baseSlot,
			id: 1,
		});
		expect(result.id).toBe(1);
	});
});

describe("RegularCalendar FacilityScheduleSettingsSchema", () => {
	const baseSettings = {
		defaultDuration: 1,
		startTime: "09:00",
		endTime: "18:00",
		closedDays: [0],
		weekStartsOn: 0,
	};

	it("validates valid settings", () => {
		const result = FacilityScheduleSettingsSchema.parse(baseSettings);
		expect(result.defaultDuration).toBe(1);
	});

	it("validates with weekStartsOn as 1", () => {
		const result = FacilityScheduleSettingsSchema.parse({
			...baseSettings,
			weekStartsOn: 1,
		});
		expect(result.weekStartsOn).toBe(1);
	});

	it("validates with optional fields", () => {
		const result = FacilityScheduleSettingsSchema.parse({
			...baseSettings,
			timeZone: "Asia/Tokyo",
			timeSlots: [
				{
					id: "slot-1",
					label: "Morning",
					startTime: "09:00",
					endTime: "12:00",
				},
			],
		});
		expect(result.timeZone).toBe("Asia/Tokyo");
		expect(result.timeSlots).toHaveLength(1);
	});
});

describe("RegularCalendar DensityDataSchema", () => {
	const baseDensity = {
		date: new Date("2025-01-01T00:00:00Z"),
		bookedCount: 5,
		maxSlots: 10,
		density: 0.5,
		isClosedDay: false,
	};

	it("validates valid density data", () => {
		const result = DensityDataSchema.parse(baseDensity);
		expect(result.bookedCount).toBe(5);
	});

	it("validates with isClosedDay true", () => {
		const result = DensityDataSchema.parse({
			...baseDensity,
			isClosedDay: true,
		});
		expect(result.isClosedDay).toBe(true);
	});
});
