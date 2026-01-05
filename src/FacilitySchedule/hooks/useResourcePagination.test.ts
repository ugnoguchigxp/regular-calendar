import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Resource } from "../../FacilitySchedule.schema";
import { useResourcePagination } from "./useResourcePagination";

const createMockResources = (count: number): Resource[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `res-${i}`,
		name: `Resource ${i}`,
		order: i,
		isAvailable: true,
		groupId: "group-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	}));
};

describe("useResourcePagination", () => {
	it("should return all resources if pagination is disabled", () => {
		const resources = createMockResources(10);
		const { result } = renderHook(() =>
			useResourcePagination({
				allResources: resources,
				paginationOptions: { enabled: false, pageSize: 8 },
			}),
		);

		expect(result.current.paginatedResources).toHaveLength(10);
		expect(result.current.totalPages).toBe(1);
		expect(result.current.isPaginated).toBe(false);
	});

	it("should handle balanced pagination: 10 items, max 8 -> 5 items per page (2 pages)", () => {
		const resources = createMockResources(10);
		const { result } = renderHook(() =>
			useResourcePagination({
				allResources: resources,
				paginationOptions: { enabled: true, pageSize: 8 },
			}),
		);

		expect(result.current.totalPages).toBe(2);
		expect(result.current.currentPage).toBe(0);
		expect(result.current.paginatedResources).toHaveLength(5); // Page 1: 5 items
		expect(result.current.pageSize).toBe(5);

		act(() => {
			result.current.nextPage();
		});

		expect(result.current.currentPage).toBe(1);
		expect(result.current.paginatedResources).toHaveLength(5); // Page 2: 5 items
	});

	it("should handle balanced pagination: 17 items, max 8 -> 6, 6, 5 items (3 pages)", () => {
		const resources = createMockResources(17);
		const { result } = renderHook(() =>
			useResourcePagination({
				allResources: resources,
				paginationOptions: { enabled: true, pageSize: 8 },
			}),
		);

		expect(result.current.totalPages).toBe(3);

		// Page 0: 6 items
		expect(result.current.paginatedResources).toHaveLength(6);
		const page0Ids = result.current.paginatedResources.map((r) => r.id);
		expect(page0Ids).toContain("res-0");
		expect(page0Ids).toContain("res-5");

		act(() => {
			result.current.nextPage();
		});

		// Page 1: 6 items
		expect(result.current.paginatedResources).toHaveLength(6);
		const page1Ids = result.current.paginatedResources.map((r) => r.id);
		expect(page1Ids).toContain("res-6");
		expect(page1Ids).toContain("res-11");

		act(() => {
			result.current.nextPage();
		});

		// Page 2: 5 items
		expect(result.current.paginatedResources).toHaveLength(5);
		const page2Ids = result.current.paginatedResources.map((r) => r.id);
		expect(page2Ids).toContain("res-12");
		expect(page2Ids).toContain("res-16");
	});

	it("should handle navigation correctly", () => {
		const resources = createMockResources(20);
		const { result } = renderHook(() =>
			useResourcePagination({
				allResources: resources,
				paginationOptions: { enabled: true, pageSize: 5 }, // 4 pages of 5
			}),
		);

		expect(result.current.currentPage).toBe(0);

		act(() => result.current.goToPage(2));
		expect(result.current.currentPage).toBe(2);

		act(() => result.current.nextPage());
		expect(result.current.currentPage).toBe(3);

		act(() => result.current.nextPage()); // Should clamp
		expect(result.current.currentPage).toBe(3);

		act(() => result.current.prevPage());
		expect(result.current.currentPage).toBe(2);

		act(() => result.current.goToPage(-1)); // Should clamp
		expect(result.current.currentPage).toBe(0);
	});

	it("should handle fewer items than page size", () => {
		const resources = createMockResources(5);
		const { result } = renderHook(() =>
			useResourcePagination({
				allResources: resources,
				paginationOptions: { enabled: true, pageSize: 8 },
			}),
		);

		expect(result.current.totalPages).toBe(1);
		expect(result.current.paginatedResources).toHaveLength(5);
	});
});
