import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule.schema";
import { useScheduleData } from "./useScheduleData";

describe("useScheduleData", () => {
	const mockEvents: ScheduleEvent[] = [
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
		{
			id: "event-2",
			resourceId: "resource-2",
			groupId: "group-2",
			title: "Event 2",
			attendee: "Jane Smith",
			startDate: new Date("2025-01-01T12:00:00Z"),
			endDate: new Date("2025-01-01T13:00:00Z"),
			status: "confirmed",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
	];

	const mockResources: Resource[] = [
		{
			id: "resource-1",
			name: "Resource 1",
			order: 1,
			isAvailable: true,
			groupId: "group-1",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
		{
			id: "resource-2",
			name: "Resource 2",
			order: 2,
			isAvailable: true,
			groupId: "group-2",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
	];

	const mockGroups: ResourceGroup[] = [
		{
			id: "group-1",
			name: "Group 1",
			displayMode: "grid",
			dimension: 3,
			resources: [],
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
		{
			id: "group-2",
			name: "Group 2",
			displayMode: "list",
			dimension: 2,
			resources: [],
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
	];

	it("returns all events and resources when no group is selected", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: null,
			}),
		);

		expect(result.current.filteredEvents).toHaveLength(1);
		expect(result.current.filteredResources).toHaveLength(1);
	});

	it("filters events by selected group", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: "group-1",
			}),
		);

		expect(result.current.filteredEvents).toHaveLength(1);
		expect(result.current.filteredEvents[0].id).toBe("event-1");
	});

	it("filters resources by selected group", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: "group-2",
			}),
		);

		expect(result.current.filteredResources).toHaveLength(1);
		expect(result.current.filteredResources[0].id).toBe("resource-2");
	});

	it("uses first group as effective group when no group is selected", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: null,
			}),
		);

		expect(result.current.effectiveGroupId).toBe("group-1");
	});

	it("uses selected group when provided", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: "group-2",
			}),
		);

		expect(result.current.effectiveGroupId).toBe("group-2");
	});

	it("handles empty groups array", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: mockResources,
				groups: [],
				selectedGroupId: null,
			}),
		);

		expect(result.current.effectiveGroupId).toBeNull();
	});

	it("handles empty events array", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: [],
				resources: mockResources,
				groups: mockGroups,
				selectedGroupId: "group-1",
			}),
		);

		expect(result.current.filteredEvents).toHaveLength(0);
	});

	it("handles empty resources array", () => {
		const { result } = renderHook(() =>
			useScheduleData({
				events: mockEvents,
				resources: [],
				groups: mockGroups,
				selectedGroupId: "group-1",
			}),
		);

		expect(result.current.filteredResources).toHaveLength(0);
	});
});
