import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
	FacilityScheduleSettings,
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule/FacilitySchedule.schema";
import type { ScheduleApiClient, ScheduleContextType } from "./types";
import { ScheduleProvider, useScheduleContext } from "./ScheduleContext";

const baseSettings: FacilityScheduleSettings = {
	defaultDuration: 1,
	startTime: "08:00",
	endTime: "18:00",
	closedDays: [],
	weekStartsOn: 0,
	paginationEnabled: false,
	paginationPageSize: 8,
};

const resources: Resource[] = [
	{
		id: "r1",
		name: "Room 1",
		order: 1,
		isAvailable: true,
		groupId: "g1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const groups: ResourceGroup[] = [
	{
		id: "g1",
		name: "Group A",
		displayMode: "grid",
		dimension: 1,
		resources,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const personnel: Personnel[] = [
	{ id: "p1", name: "Alice", priority: 1 },
	{ id: "p2", name: "Bob", priority: 2 },
];

const makeEvent = (overrides: Partial<ScheduleEvent> = {}): ScheduleEvent =>
	({
		id: "e1",
		title: "Event",
		resourceId: "r1",
		groupId: "g1",
		startDate: new Date("2026-01-02T09:00:00"),
		endDate: new Date("2026-01-02T10:00:00"),
		status: "booked",
		attendee: "[]",
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	} as ScheduleEvent);

const baseApiClient = (): ScheduleApiClient => ({
	getConfig: vi.fn().mockResolvedValue({
		groups,
		resources,
		settings: baseSettings,
	}),
	getEvents: vi.fn().mockResolvedValue([
		makeEvent({ id: "e1" }),
		makeEvent({ id: "e2", resourceId: "" }),
	]),
	createEvent: vi.fn().mockResolvedValue(makeEvent({ id: "e3" })),
	updateEvent: vi.fn().mockResolvedValue(makeEvent({ id: "e1", title: "Updated" })),
	deleteEvent: vi.fn().mockResolvedValue(undefined),
	createGroup: vi.fn().mockResolvedValue(groups[0]),
	updateGroup: vi.fn().mockResolvedValue(groups[0]),
	deleteGroup: vi.fn().mockResolvedValue(undefined),
	createResource: vi.fn().mockResolvedValue(resources[0]),
	updateResource: vi.fn().mockResolvedValue(resources[0]),
	deleteResource: vi.fn().mockResolvedValue(undefined),
	getPersonnel: vi.fn().mockResolvedValue(personnel),
	updatePersonnelPriority: vi
		.fn()
		.mockResolvedValue({ id: "p1", name: "Alice", priority: 5 }),
	getResourceAvailability: vi.fn().mockResolvedValue([
		{
			resourceId: "r1",
			resourceName: "Room 1",
			groupId: "g1",
			isAvailable: true,
			bookings: [],
		},
	]),
});

let latestCtx: ScheduleContextType | null = null;

function ContextCapture() {
	const ctx = useScheduleContext();
	latestCtx = ctx;
	return (
		<div>
			<div data-testid="loading">{String(ctx.loading)}</div>
			<div data-testid="events-count">{ctx.events.length}</div>
			<div data-testid="personnel">{ctx.personnel.map((p) => p.id).join(",")}</div>
		</div>
	);
}

describe("ScheduleContext", () => {
	it("loads initial data and filters resource events", async () => {
		const apiClient = baseApiClient();
		render(
			<ScheduleProvider apiClient={apiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);
		expect(screen.getByTestId("events-count")).toHaveTextContent("1");
		expect(screen.getByTestId("personnel")).toHaveTextContent("p1,p2");
	});

	it("handles event mutations and resource availability caching", async () => {
		const apiClient = baseApiClient();
		render(
			<ScheduleProvider apiClient={apiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		await act(async () => {
			await latestCtx?.createEvent({
				title: "New",
				startDate: new Date(),
				endDate: new Date(),
				status: "booked",
			});
		});
		expect(screen.getByTestId("events-count")).toHaveTextContent("2");

		await act(async () => {
			await latestCtx?.updateEvent("e1", { title: "Updated" });
		});
		expect(latestCtx?.events.find((e) => e.id === "e1")?.title).toBe("Updated");

		await act(async () => {
			await latestCtx?.deleteEvent("e1");
		});
		expect(latestCtx?.events.find((e) => e.id === "e1")).toBeUndefined();

		const date = new Date("2026-01-02T00:00:00");
		let first: unknown;
		await act(async () => {
			first = await latestCtx?.fetchResourceAvailability(date, "day");
		});
		await waitFor(() =>
			expect(
				latestCtx?.getResourceAvailabilityFromCache(date, "day"),
			).toBeDefined(),
		);
		const second = await latestCtx?.fetchResourceAvailability(date, "day");
		expect(first).toEqual(second);
		expect(apiClient.getResourceAvailability).toHaveBeenCalledTimes(1);
		expect(latestCtx?.getResourceAvailabilityFromCache(date, "day")).toEqual(
			first,
		);
	});

	it("updates personnel priority and fetches personnel events", async () => {
		const apiClient = baseApiClient();
		render(
			<ScheduleProvider apiClient={apiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		await act(async () => {
			await latestCtx?.updatePersonnelPriority("p1", 5);
		});
		expect(latestCtx?.personnel[0]?.id).toBe("p1");

		(apiClient.getEvents as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
			makeEvent({ id: "p-event-1" }),
		]);
		await act(async () => {
			await latestCtx?.fetchPersonnelEvents(["p1"], false);
		});
		expect(latestCtx?.personnelEvents).toHaveLength(1);

		(apiClient.getEvents as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
			makeEvent({ id: "p-event-2" }),
		]);
		await act(async () => {
			await latestCtx?.fetchPersonnelEvents(["p1"], true);
		});
		expect(latestCtx?.personnelEvents).toHaveLength(2);
	});

	it("handles missing apiClient and availability errors", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { unmount } = render(
			<ScheduleProvider apiClient={undefined as unknown as ScheduleApiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		await act(async () => {
			await latestCtx?.createEvent({
				title: "No API",
				startDate: new Date(),
				endDate: new Date(),
			});
			await latestCtx?.updateEvent("e1", { title: "No API" });
			await latestCtx?.deleteEvent("e1");
		});

		unmount();

		const apiClient = baseApiClient();
		apiClient.getResourceAvailability = vi
			.fn()
			.mockRejectedValue(new Error("availability error"));

		render(
			<ScheduleProvider apiClient={apiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		const result = await latestCtx?.fetchResourceAvailability(
			new Date("2026-01-02T00:00:00"),
			"day",
		);
		expect(result).toEqual([]);
		expect(latestCtx?.getResourceAvailabilityFromCache(new Date(), "day")).toBeUndefined();

		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	it("propagates API errors and clears personnel events", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const onError = vi.fn();
		const apiClient = baseApiClient();
		apiClient.createEvent = vi.fn().mockRejectedValue(new Error("create fail"));
		apiClient.updateEvent = vi.fn().mockRejectedValue(new Error("update fail"));
		apiClient.deleteEvent = vi.fn().mockRejectedValue(new Error("delete fail"));
		apiClient.updatePersonnelPriority = vi
			.fn()
			.mockRejectedValue(new Error("priority fail"));

		render(
			<ScheduleProvider apiClient={apiClient} onError={onError}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		await act(async () => {
			await latestCtx
				?.createEvent({
					title: "Bad",
					startDate: new Date(),
					endDate: new Date(),
				})
				.catch(() => {});
			await latestCtx?.updateEvent("e1", { title: "Bad" }).catch(() => {});
			await latestCtx?.deleteEvent("e1").catch(() => {});
			await latestCtx?.updatePersonnelPriority("p1", 1).catch(() => {});
			await latestCtx?.fetchPersonnelEvents([], false);
		});
		expect(latestCtx?.personnelEvents).toEqual([]);
		expect(onError).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	it("manages groups/resources and skips clearing personnel events when appending empty list", async () => {
		const apiClient = baseApiClient();
		const newGroup = {
			...groups[0],
			id: "g2",
			name: "Group B",
		};
		const updatedGroup = { ...newGroup, name: "Group B Updated" };
		const newResource = {
			...resources[0],
			id: "r2",
			name: "Room 2",
			groupId: "g2",
		};
		const updatedResource = { ...newResource, name: "Room 2 Updated" };

		apiClient.createGroup = vi.fn().mockResolvedValue(newGroup);
		apiClient.updateGroup = vi.fn().mockResolvedValue(updatedGroup);
		apiClient.deleteGroup = vi.fn().mockResolvedValue(undefined);
		apiClient.createResource = vi.fn().mockResolvedValue(newResource);
		apiClient.updateResource = vi.fn().mockResolvedValue(updatedResource);
		apiClient.deleteResource = vi.fn().mockResolvedValue(undefined);

		render(
			<ScheduleProvider apiClient={apiClient}>
				<ContextCapture />
			</ScheduleProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("false"),
		);

		await act(async () => {
			await latestCtx?.createGroup({ name: "Group B" });
		});
		expect(latestCtx?.groups.some((g) => g.id === "g2")).toBe(true);

		await act(async () => {
			await latestCtx?.updateGroup("g2", { name: "Group B Updated" });
		});
		expect(latestCtx?.groups.find((g) => g.id === "g2")?.name).toBe(
			"Group B Updated",
		);

		await act(async () => {
			await latestCtx?.deleteGroup("g2");
		});
		expect(latestCtx?.groups.some((g) => g.id === "g2")).toBe(false);

		await act(async () => {
			await latestCtx?.createResource({ name: "Room 2" });
		});
		expect(latestCtx?.resources.some((r) => r.id === "r2")).toBe(true);

		await act(async () => {
			await latestCtx?.updateResource("r2", { name: "Room 2 Updated" });
		});
		expect(latestCtx?.resources.find((r) => r.id === "r2")?.name).toBe(
			"Room 2 Updated",
		);

		await act(async () => {
			await latestCtx?.deleteResource("r2");
		});
		expect(latestCtx?.resources.some((r) => r.id === "r2")).toBe(false);

		(apiClient.getEvents as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
			makeEvent({ id: "p-event-1" }),
		]);
		await act(async () => {
			await latestCtx?.fetchPersonnelEvents(["p1"], false);
		});
		expect(latestCtx?.personnelEvents).toHaveLength(1);

		await act(async () => {
			await latestCtx?.fetchPersonnelEvents([], true);
		});
		expect(latestCtx?.personnelEvents).toHaveLength(1);
	});
});
