import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EventFormData } from "../components/EventModal/EventForm";
import type { ScheduleEvent } from "../FacilitySchedule.schema";
import { useScheduleEventHandlers } from "./useScheduleEventHandlers";

describe("useScheduleEventHandlers", () => {
	const mockEvent: ScheduleEvent = {
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

	const formData: EventFormData = {
		title: "New Event",
		attendee: "Jane Smith",
		startDate: new Date("2025-01-01T10:00:00Z"),
		endDate: new Date("2025-01-01T11:00:00Z"),
		durationHours: 1,
	};

	it("initializes with modal closed and no selected event", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		expect(result.current.isModalOpen).toBe(false);
		expect(result.current.selectedEvent).toBeUndefined();
		expect(result.current.newInfo).toEqual({});
	});

	it("opens modal when event is clicked", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		act(() => {
			result.current.handleEventClick(mockEvent);
		});

		expect(result.current.isModalOpen).toBe(true);
		expect(result.current.selectedEvent).toEqual(mockEvent);
		expect(result.current.newInfo).toEqual({});
	});

	it("opens modal when empty slot is clicked", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		const startTime = new Date("2025-01-01T12:00:00Z");

		act(() => {
			result.current.handleEmptySlotClick("resource-2", startTime);
		});

		expect(result.current.isModalOpen).toBe(true);
		expect(result.current.selectedEvent).toBeUndefined();
		expect(result.current.newInfo).toEqual({
			resourceId: "resource-2",
			startTime,
		});
	});

	it("opens modal when empty slot is clicked with null resourceId", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		const startTime = new Date("2025-01-01T12:00:00Z");

		act(() => {
			result.current.handleEmptySlotClick(null, startTime);
		});

		expect(result.current.isModalOpen).toBe(true);
		expect(result.current.newInfo.resourceId).toBeUndefined();
		expect(result.current.newInfo.startTime).toEqual(startTime);
	});

	it("calls onDateChange and onViewChange when day is clicked", () => {
		const onDateChange = vi.fn();
		const onViewChange = vi.fn();
		const { result } = renderHook(() =>
			useScheduleEventHandlers({
				onDateChange,
				onViewChange,
			}),
		);

		const date = new Date("2025-01-01T00:00:00Z");

		act(() => {
			result.current.handleDayClick(date);
		});

		expect(onDateChange).toHaveBeenCalledWith(date);
		expect(onViewChange).toHaveBeenCalledWith("day");
	});

	it("calls onEventCreate when modal is saved without selected event", () => {
		const onEventCreate = vi.fn();
		const { result } = renderHook(() =>
			useScheduleEventHandlers({
				onEventCreate,
			}),
		);

		act(() => {
			result.current.handleModalSave(formData);
		});

		expect(onEventCreate).toHaveBeenCalledWith(formData);
		expect(result.current.isModalOpen).toBe(false);
	});

	it("calls onEventUpdate when modal is saved with selected event", () => {
		const onEventUpdate = vi.fn();
		const { result } = renderHook(() =>
			useScheduleEventHandlers({
				onEventUpdate,
			}),
		);

		act(() => {
			result.current.handleEventClick(mockEvent);
		});

		act(() => {
			result.current.handleModalSave(formData);
		});

		expect(onEventUpdate).toHaveBeenCalledWith(mockEvent.id, formData);
		expect(result.current.isModalOpen).toBe(false);
	});

	it("calls onEventDelete when modal delete is called", () => {
		const onEventDelete = vi.fn();
		const { result } = renderHook(() =>
			useScheduleEventHandlers({
				onEventDelete,
			}),
		);

		act(() => {
			result.current.handleModalDelete("event-1");
		});

		expect(onEventDelete).toHaveBeenCalledWith("event-1");
		expect(result.current.isModalOpen).toBe(false);
	});

	it("closes modal when handleModalClose is called", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		act(() => {
			result.current.handleEventClick(mockEvent);
		});

		expect(result.current.isModalOpen).toBe(true);

		act(() => {
			result.current.handleModalClose();
		});

		expect(result.current.isModalOpen).toBe(false);
	});

	it("does not call callbacks if not provided", () => {
		const { result } = renderHook(() => useScheduleEventHandlers({}));

		act(() => {
			result.current.handleModalSave(formData);
			result.current.handleModalDelete("event-1");
			result.current.handleDayClick(new Date("2025-01-01T00:00:00Z"));
		});

		expect(() =>
			act(() => result.current.handleModalSave(formData)),
		).not.toThrow();
	});
});
