import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScheduleApiClient } from "./scheduleApiClient";
import type { ScheduleApiClient } from "./types";

describe("createScheduleApiClient", () => {
	let client: ScheduleApiClient;
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetAllMocks();
		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		client = createScheduleApiClient("/api");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates API client with baseUrl", () => {
		expect(client).toBeDefined();
	});

	describe("getConfig", () => {
		it("fetches config from API", async () => {
			const mockConfig = {
				groups: [],
				resources: [],
				settings: {
					defaultDuration: 1,
					startTime: "09:00",
					endTime: "18:00",
					closedDays: [0],
					weekStartsOn: 0,
				},
			};

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockConfig,
			});

			const result = await client.getConfig();

			expect(fetch).toHaveBeenCalledWith(
				"/api/config",
				expect.any(Object),
			);
			expect(result).toEqual(mockConfig);
		});
	});

	describe("getEvents", () => {
		it("fetches events without personnel filter", async () => {
			const mockEvents = [
				{
					id: "event-1",
					title: "Event 1",
					startDate: "2025-01-01T10:00:00Z",
					endDate: "2025-01-01T11:00:00Z",
				},
			];

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockEvents,
			});

			const result = await client.getEvents();

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/events",
				expect.any(Object),
			);
			expect(result[0].startDate).toBeInstanceOf(Date);
		});

		it("fetches events with personnel filter", async () => {
			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => [],
			});

			await client.getEvents(["person-1", "person-2"]);

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/events?personnelIds=person-1,person-2",
				expect.any(Object),
			);
		});
	});

	describe("createEvent", () => {
		it("creates event via API", async () => {
			const mockEvent = {
				id: "event-1",
				title: "New Event",
				startDate: "2025-01-01T10:00:00Z",
				endDate: "2025-01-01T11:00:00Z",
			};

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockEvent,
			});

			const eventData = {
				title: "New Event",
				startDate: new Date("2025-01-01T10:00:00Z"),
				endDate: new Date("2025-01-01T11:00:00Z"),
			};

			const result = await client.createEvent(eventData);

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/events",
				expect.objectContaining({
					method: "POST",
				}),
			);
			expect(result.startDate).toBeInstanceOf(Date);
		});
	});

	describe("updateEvent", () => {
		it("updates event via API", async () => {
			const mockEvent = {
				id: "event-1",
				title: "Updated Event",
				startDate: "2025-01-01T10:00:00Z",
				endDate: "2025-01-01T11:00:00Z",
			};

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockEvent,
			});

			const result = await client.updateEvent("event-1", {
				title: "Updated Event",
			});

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/events/event-1",
				expect.objectContaining({
					method: "PUT",
				}),
			);
			expect(result.startDate).toBeInstanceOf(Date);
		});
	});

	describe("deleteEvent", () => {
		it("deletes event via API", async () => {
			fetchMock.mockResolvedValue({
				ok: true,
			});

			await client.deleteEvent("event-1");

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/events/event-1",
				expect.objectContaining({
					method: "DELETE",
				}),
			);
		});
	});

	describe("getPersonnel", () => {
		it("fetches personnel from API", async () => {
			const mockPersonnel = [
				{
					id: "person-1",
					name: "John Doe",
					department: "Engineering",
					email: "john@example.com",
					priority: 0,
				},
			];

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockPersonnel,
			});

			const result = await client.getPersonnel();

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/personnel",
				expect.any(Object),
			);
			expect(result).toEqual(mockPersonnel);
		});
	});

	describe("updatePersonnelPriority", () => {
		it("updates personnel priority via API", async () => {
			const mockPersonnel = {
				id: "person-1",
				name: "John Doe",
				department: "Engineering",
				email: "john@example.com",
				priority: 1,
			};

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockPersonnel,
			});

			const result = await client.updatePersonnelPriority("person-1", 1);

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				"/api/personnel/person-1",
				expect.objectContaining({
					method: "PUT",
				}),
			);
			expect(result).toEqual(mockPersonnel);
		});
	});

	describe("getResourceAvailability", () => {
		it("fetches resource availability from API", async () => {
			const mockAvailability = [
				{
					date: "2025-01-01",
					resourceId: "resource-1",
					isAvailable: true,
				},
			];

			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => ({ resources: mockAvailability }),
			});

			const date = new Date("2025-01-01T00:00:00Z");
			const result = await client.getResourceAvailability({
				date,
				view: "day",
			});

			expect(vi.mocked(fetch)).toHaveBeenCalledWith(
				expect.stringContaining("/resource-availability?date="),
				expect.any(Object),
			);
			expect(result).toEqual(mockAvailability);
		});
	});

	it("handles API errors", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		await expect(client.getConfig()).rejects.toThrow(
			"API error: 500 Internal Server Error",
		);
	});
});
