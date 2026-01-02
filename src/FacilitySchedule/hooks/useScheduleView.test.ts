import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultStorage } from "../../utils/StorageAdapter";
import { useScheduleView } from "./useScheduleView";

vi.mock("../../utils/StorageAdapter", () => ({
	defaultStorage: {
		getItem: vi.fn(),
		setItem: vi.fn(),
	},
}));

describe("useScheduleView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("initializes with default values", () => {
		const { result } = renderHook(() => useScheduleView({}));

		expect(result.current.viewMode).toBe("day");
		expect(result.current.selectedGroupId).toBeNull();
		expect(result.current.currentDate).toBeInstanceOf(Date);
	});

	it("initializes with custom default view", () => {
		const { result } = renderHook(() =>
			useScheduleView({
				defaultView: "week",
			}),
		);

		expect(result.current.viewMode).toBe("week");
	});

	it("initializes with custom default date", () => {
		const customDate = new Date("2025-01-15T10:00:00Z");
		const { result } = renderHook(() =>
			useScheduleView({
				defaultDate: customDate,
			}),
		);

		expect(result.current.currentDate).toEqual(customDate);
	});

	it("initializes with custom default group", () => {
		const { result } = renderHook(() =>
			useScheduleView({
				defaultGroupId: "group-1",
			}),
		);

		expect(result.current.selectedGroupId).toBe("group-1");
	});

	it("calls onDateChange when setDate is called", () => {
		const onDateChange = vi.fn();
		const { result } = renderHook(() =>
			useScheduleView({
				onDateChange,
			}),
		);

		const newDate = new Date("2025-02-01T10:00:00Z");

		act(() => {
			result.current.setDate(newDate);
		});

		expect(onDateChange).toHaveBeenCalledWith(newDate);
		expect(result.current.currentDate).toEqual(newDate);
	});

	it("calls onViewChange when setViewMode is called", () => {
		const onViewChange = vi.fn();
		const { result } = renderHook(() =>
			useScheduleView({
				onViewChange,
			}),
		);

		act(() => {
			result.current.setViewMode("week");
		});

		expect(onViewChange).toHaveBeenCalledWith("week");
		expect(result.current.viewMode).toBe("week");
	});

	it("calls onGroupChange when setSelectedGroupId is called", () => {
		const onGroupChange = vi.fn();
		const { result } = renderHook(() =>
			useScheduleView({
				onGroupChange,
			}),
		);

		act(() => {
			result.current.setSelectedGroupId("group-1");
		});

		expect(onGroupChange).toHaveBeenCalledWith("group-1");
		expect(result.current.selectedGroupId).toBe("group-1");
	});

	it("navigates to previous date", () => {
		const { result } = renderHook(() =>
			useScheduleView({
				defaultDate: new Date("2025-01-15T10:00:00Z"),
				defaultView: "day",
			}),
		);

		const initialDate = result.current.currentDate;

		act(() => {
			result.current.navigate("prev");
		});

		expect(result.current.currentDate.getTime()).toBeLessThan(
			initialDate.getTime(),
		);
	});

	it("navigates to next date", () => {
		const { result } = renderHook(() =>
			useScheduleView({
				defaultDate: new Date("2025-01-15T10:00:00Z"),
				defaultView: "day",
			}),
		);

		const initialDate = result.current.currentDate;

		act(() => {
			result.current.navigate("next");
		});

		expect(result.current.currentDate.getTime()).toBeGreaterThan(
			initialDate.getTime(),
		);
	});

	it("goes to today when goToToday is called", () => {
		const pastDate = new Date("2024-01-01T10:00:00Z");
		const { result } = renderHook(() =>
			useScheduleView({
				defaultDate: pastDate,
			}),
		);

		expect(result.current.currentDate.getFullYear()).toBe(2024);

		act(() => {
			result.current.goToToday();
		});

		expect(result.current.currentDate.getFullYear()).toBeGreaterThanOrEqual(
			2025,
		);
	});

	describe("persistence", () => {
		it("loads view mode from storage when persistence is enabled", () => {
			vi.mocked(defaultStorage.getItem).mockReturnValue("week");

			const { result } = renderHook(() =>
				useScheduleView({
					enablePersistence: true,
					storage: defaultStorage,
				}),
			);

			expect(defaultStorage.getItem).toHaveBeenCalledWith(
				"facility-schedule-view",
			);
			expect(result.current.viewMode).toBe("week");
		});

		it("uses default view when storage returns invalid value", () => {
			vi.mocked(defaultStorage.getItem).mockReturnValue("invalid");

			const { result } = renderHook(() =>
				useScheduleView({
					defaultView: "month",
					enablePersistence: true,
					storage: defaultStorage,
				}),
			);

			expect(result.current.viewMode).toBe("month");
		});

		it("saves view mode to storage when it changes", () => {
			const { result } = renderHook(() =>
				useScheduleView({
					enablePersistence: true,
					storage: defaultStorage,
				}),
			);

			act(() => {
				result.current.setViewMode("week");
			});

			expect(defaultStorage.setItem).toHaveBeenCalledWith(
				"facility-schedule-view",
				"week",
			);
		});

		it("does not save to storage when persistence is disabled", () => {
			const { result } = renderHook(() =>
				useScheduleView({
					enablePersistence: false,
					storage: defaultStorage,
				}),
			);

			act(() => {
				result.current.setViewMode("week");
			});

			expect(defaultStorage.setItem).not.toHaveBeenCalled();
		});

		it("uses custom storage key", () => {
			vi.mocked(defaultStorage.getItem).mockReturnValue("month");
			const customKey = "my-custom-key";

			renderHook(() =>
				useScheduleView({
					enablePersistence: true,
					storageKey: customKey,
					storage: defaultStorage,
				}),
			);

			expect(defaultStorage.getItem).toHaveBeenCalledWith(customKey);
		});
	});
});
