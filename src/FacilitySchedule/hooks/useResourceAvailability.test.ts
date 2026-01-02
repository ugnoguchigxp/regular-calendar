import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule.schema";
import { useResourceAvailability } from "./useResourceAvailability";

describe("useResourceAvailability", () => {
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
			groupId: "group-1",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
		{
			id: "resource-3",
			name: "Resource 3",
			order: 3,
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
			dimension: 2,
			resources: [],
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
		{
			id: "group-2",
			name: "Group 2",
			displayMode: "list",
			dimension: 1,
			resources: [],
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		},
	];

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
	];

	const timeRange = {
		start: new Date("2025-01-01T10:00:00Z"),
		end: new Date("2025-01-01T11:00:00Z"),
	};

	it("calculates availability list", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.availabilityList).toHaveLength(3);
		expect(result.current.availabilityList[0].resourceId).toBe("resource-1");
		expect(result.current.availabilityList[0].isAvailable).toBe(false);
		expect(result.current.availabilityList[1].resourceId).toBe("resource-2");
		expect(result.current.availabilityList[1].isAvailable).toBe(true);
	});

	it("filters available resources", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.availableResources).toHaveLength(2);
		expect(
			result.current.availableResources.every((r) => r.id !== "resource-1"),
		).toBe(true);
	});

	it("generates resource names with group names", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.resourceNames).toHaveLength(2);
		expect(result.current.resourceNames).toContain("Resource 2 (Group 1)");
		expect(result.current.resourceNames).toContain("Resource 3 (Group 2)");
	});

	it("returns display name for resource", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.getDisplayName("resource-1")).toBe(
			"Resource 1 (Group 1)",
		);
		expect(result.current.getDisplayName("resource-2")).toBe(
			"Resource 2 (Group 1)",
		);
		expect(result.current.getDisplayName("resource-3")).toBe(
			"Resource 3 (Group 2)",
		);
	});

	it("returns resource ID as display name if resource not found", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.getDisplayName("resource-999")).toBe("resource-999");
	});

	it("returns resource name without group if group not found", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: [{ ...mockResources[0], groupId: "group-999" }],
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.getDisplayName("resource-1")).toBe("Resource 1");
	});

	it("uses external availability if provided", () => {
		const externalAvailability = [
			{ resourceId: "resource-1", isAvailable: true },
			{ resourceId: "resource-2", isAvailable: false },
			{ resourceId: "resource-3", isAvailable: true },
		];

		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
				externalAvailability,
			}),
		);

		expect(result.current.availabilityList[0].isAvailable).toBe(true);
		expect(result.current.availabilityList[1].isAvailable).toBe(false);
	});

	it("excludes current event from availability check", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: mockGroups,
				events: mockEvents,
				timeRange,
				currentEventId: "event-1",
			}),
		);

		expect(result.current.availableResources).toHaveLength(3);
	});

	it("handles empty resources", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: [],
				groups: mockGroups,
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.availableResources).toHaveLength(0);
		expect(result.current.resourceNames).toHaveLength(0);
	});

	it("handles empty groups", () => {
		const { result } = renderHook(() =>
			useResourceAvailability({
				resources: mockResources,
				groups: [],
				events: mockEvents,
				timeRange,
			}),
		);

		expect(result.current.resourceNames).toHaveLength(2);
		expect(result.current.getDisplayName("resource-1")).toBe("Resource 1");
	});
});
