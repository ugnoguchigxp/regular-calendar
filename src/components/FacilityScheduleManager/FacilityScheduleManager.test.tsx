import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ScheduleEvent } from "../../FacilitySchedule/FacilitySchedule.schema";
import { getPersonnelColor } from "../../PersonnelPanel/personnelColors";
import { FacilityScheduleManager } from "./FacilityScheduleManager";

const mockUseScheduleContext = vi.fn();
const schedulePropsSpy = vi.fn();

vi.mock("../../contexts/ScheduleContext", () => ({
	useScheduleContext: () => mockUseScheduleContext(),
}));

vi.mock("../../FacilitySchedule/FacilitySchedule", () => ({
	FacilitySchedule: (props: any) => {
		schedulePropsSpy(props);
		return <div data-testid="facility-schedule" />;
	},
}));

describe("FacilityScheduleManager", () => {
	beforeEach(() => {
		mockUseScheduleContext.mockReset();
		schedulePropsSpy.mockReset();
	});

	it("renders error and loading states", async () => {
		mockUseScheduleContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: null,
			loading: false,
			error: "Boom",
			events: [],
			createEvent: vi.fn(),
			updateEvent: vi.fn(),
			deleteEvent: vi.fn(),
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			personnel: [],
		});

		await act(async () => {
			render(
				<FacilityScheduleManager
					settings={{
						weekStartsOn: 0,
						businessHoursStart: "8",
						businessHoursEnd: "18",
					}}
				/>,
			);
			await Promise.resolve();
		});
		expect(screen.getByText(/Error: Boom/i)).toBeInTheDocument();

		mockUseScheduleContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: null,
			loading: true,
			error: null,
			events: [],
			createEvent: vi.fn(),
			updateEvent: vi.fn(),
			deleteEvent: vi.fn(),
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			personnel: [],
		});

		await act(async () => {
			render(
				<FacilityScheduleManager
					settings={{
						weekStartsOn: 0,
						businessHoursStart: "8",
						businessHoursEnd: "18",
					}}
				/>,
			);
			await Promise.resolve();
		});
		expect(screen.getByText(/Loading schedule data/i)).toBeInTheDocument();
	});

	it("merges settings, pagination, and local events", async () => {
		const fetchResourceAvailability = vi.fn().mockResolvedValue([
			{
				resourceId: "r1",
				resourceName: "Room 1",
				groupId: "g1",
				isAvailable: true,
				bookings: [
					{
						eventId: "e1",
						title: "Meeting",
						startDate: "2026-01-02T09:00:00.000Z",
						endDate: "2026-01-02T10:00:00.000Z",
						isAllDay: false,
						attendee: JSON.stringify([{ name: "Alice", personnelId: "p1" }]),
						extendedProps: JSON.stringify({ ownerId: "p1" }),
					},
				],
			},
		]);

		const contextEvent: ScheduleEvent = {
			id: "e1",
			title: "Meeting",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockUseScheduleContext.mockReturnValue({
			resources: [
				{
					id: "r1",
					name: "Room 1",
					order: 1,
					isAvailable: true,
					groupId: "g1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			groups: [
				{
					id: "g1",
					name: "Group A",
					displayMode: "grid",
					dimension: 1,
					resources: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			settings: {
				defaultDuration: 1,
				startTime: "07:00",
				endTime: "19:00",
				closedDays: [],
				weekStartsOn: 0,
				paginationEnabled: false,
				paginationPageSize: 10,
			},
			loading: false,
			error: null,
			events: [contextEvent],
			createEvent: vi.fn(),
			updateEvent: vi.fn(),
			deleteEvent: vi.fn(),
			fetchResourceAvailability,
			personnel: [{ id: "p1", name: "Alice", priority: 1 }],
		});

		render(
			<FacilityScheduleManager
				settings={{
					weekStartsOn: 1,
					businessHoursStart: "8",
					businessHoursEnd: "17",
					facilityOrientation: "vertical",
					facilitySlotInterval: 30,
					paginationEnabled: true,
					paginationPageSize: 5,
				}}
				pagination={{ enabled: true, pageSize: 5 }}
			/>,
		);

		await waitFor(() => expect(fetchResourceAvailability).toHaveBeenCalled());
		await waitFor(() => {
			const props = schedulePropsSpy.mock.calls.at(-1)?.[0];
			expect(props).toBeTruthy();
			expect(props.settings.startTime).toBe("08:00");
			expect(props.settings.endTime).toBe("17:00");
			expect(props.settings.orientation).toBe("vertical");
			expect(props.settings.slotInterval).toBe(30);
			expect(props.pagination).toEqual({ enabled: true, pageSize: 5 });
			expect(props.events[0].color).toBe(getPersonnelColor(0));
		});
	});

	it("handles event actions and uses fallbacks for settings and pagination", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const createEvent = vi.fn().mockRejectedValue(new Error("create fail"));
		const updateEvent = vi.fn().mockRejectedValue(new Error("update fail"));
		const deleteEvent = vi.fn().mockRejectedValue(new Error("delete fail"));

		const fetchResourceAvailability = vi.fn().mockResolvedValue([
			{
				resourceId: "r1",
				resourceName: "Room 1",
				groupId: "",
				isAvailable: true,
				bookings: [
					{
						eventId: "e1",
						title: "Existing One",
						startDate: "2026-01-02T09:00:00.000Z",
						endDate: "2026-01-02T10:00:00.000Z",
						isAllDay: false,
						attendee: JSON.stringify([{ name: "Someone", personnelId: "px" }]),
						extendedProps: JSON.stringify({ ownerId: "px" }),
					},
				],
			},
			{
				resourceId: "r2",
				resourceName: "Room 2",
				groupId: "g2",
				isAvailable: true,
				bookings: [
					{
						eventId: "e2",
						title: "Existing Two",
						startDate: "2026-01-02T10:00:00.000Z",
						endDate: "2026-01-02T11:00:00.000Z",
						isAllDay: false,
						attendee: JSON.stringify([{ name: "Alice", personnelId: "p1" }]),
						extendedProps: JSON.stringify({ ownerId: "p1" }),
					},
				],
			},
			{
				resourceId: "r3",
				resourceName: "Room 3",
				groupId: "g3",
				isAvailable: true,
				bookings: [
					{
						eventId: "e3",
						title: "Local Only",
						startDate: "2026-01-02T12:00:00.000Z",
						endDate: "2026-01-02T13:00:00.000Z",
						isAllDay: false,
						attendee: "[]",
						extendedProps: "{}",
					},
				],
			},
		]);

		mockUseScheduleContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: {
				defaultDuration: 1,
				startTime: "07:00",
				endTime: "19:00",
				closedDays: [],
				weekStartsOn: 0,
				paginationEnabled: true,
				paginationPageSize: 12,
			},
			loading: false,
			error: null,
			events: [
				{
					id: "e1",
					title: "Existing One",
					resourceId: "r1",
					groupId: "g1",
					startDate: new Date("2026-01-02T09:00:00"),
					endDate: new Date("2026-01-02T10:00:00"),
					status: "booked",
					attendee: "[]",
					color: "red",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "e2",
					title: "Existing Two",
					resourceId: "r2",
					groupId: "g2",
					startDate: new Date("2026-01-02T10:00:00"),
					endDate: new Date("2026-01-02T11:00:00"),
					status: "booked",
					attendee: "[]",
					color: "blue",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			createEvent,
			updateEvent,
			deleteEvent,
			fetchResourceAvailability,
			personnel: [{ id: "p1", name: "Alice", priority: 1 }],
		});

		render(
			<FacilityScheduleManager
				settings={{
					weekStartsOn: undefined as unknown as 0,
					businessHoursStart: undefined as unknown as string,
					businessHoursEnd: undefined as unknown as string,
					facilitySlotInterval: 0,
				}}
			/>,
		);

		await waitFor(() => expect(fetchResourceAvailability).toHaveBeenCalled());

		const props = schedulePropsSpy.mock.calls.at(-1)?.[0];
		expect(props.settings.startTime).toBe("07:00");
		expect(props.settings.endTime).toBe("19:00");
		expect(props.settings.slotInterval).toBe(60);
		expect(props.pagination).toEqual({ enabled: true, pageSize: 12 });

		const event1 = props.events.find((e: ScheduleEvent) => e.id === "e1");
		expect(event1?.color).toBe("red");
		expect(event1?.groupId).toBe("g1");

		const event2 = props.events.find((e: ScheduleEvent) => e.id === "e2");
		expect(event2?.color).toBe(getPersonnelColor(0));
		expect(event2?.groupId).toBe("g2");

		const event3 = props.events.find((e: ScheduleEvent) => e.id === "e3");
		expect(event3).toBeTruthy();

		await act(async () => {
			await props.onEventCreate({
				title: "New",
				attendee: "[]",
				startDate: new Date("2026-01-02T14:00:00"),
				endDate: new Date("2026-01-02T15:00:00"),
				durationHours: 1,
				status: "booked",
				note: "",
				isAllDay: false,
				extendedProps: {},
			});
			await props.onEventUpdate("e1", {
				title: "Update",
				attendee: "[]",
				startDate: new Date("2026-01-02T09:30:00"),
				endDate: new Date("2026-01-02T10:30:00"),
				durationHours: 1,
				status: "booked",
				note: "",
				isAllDay: false,
				extendedProps: {},
			});
			await props.onEventDelete("e1");
		});

		expect(createEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				extendedProps: expect.objectContaining({ ownerId: "p1" }),
				resourceId: undefined,
			}),
		);
		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});
});
