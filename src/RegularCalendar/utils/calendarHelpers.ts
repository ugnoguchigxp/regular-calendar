/**
 * Standard Calendar Helpers
 */

import { TIME_SLOT_HEIGHT } from "../constants/calendarConstants";
import type { ScheduleEvent } from "../RegularCalendar.schema";

/**
 * Get dates for the week containing the given date
 */
export const getWeekDates = (date: Date, weekStartsOn: 0 | 1): Date[] => {
	const dates: Date[] = [];
	const currentDate = new Date(date);
	currentDate.setHours(0, 0, 0, 0);

	const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...

	let diff: number;
	if (weekStartsOn === 1) {
		// Starts on Monday
		diff = currentDate.getDate() - ((day + 6) % 7);
	} else {
		// Starts on Sunday
		diff = currentDate.getDate() - day;
	}

	currentDate.setDate(diff);

	for (let i = 0; i < 7; i++) {
		const dayDate = new Date(currentDate);
		dayDate.setHours(0, 0, 0, 0);
		dates.push(dayDate);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
};

/**
 * Generate time slots array
 */
export const generateTimeSlots = (
	interval: number, // minutes
	startHour = 8,
	endHour = 20,
): string[] => {
	const slots: string[] = [];
	for (let hour = startHour; hour < endHour; hour++) {
		for (let minute = 0; minute < 60; minute += interval) {
			const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
			slots.push(timeString);
		}
	}
	return slots;
};

/**
 * Get current time position in pixels
 */
export const getCurrentTimePosition = (
	interval = 30,
	startHour = 8,
	timeZone = "Asia/Tokyo",
): number => {
	const now = new Date();
	const { hour, minute } = getTimeInTimeZone(now, timeZone);

	const totalMinutes = hour * 60 + minute;
	const startMinutes = startHour * 60;
	const relativeMinutes = totalMinutes - startMinutes;

	const slotsPerHour = 60 / interval;
	const hourHeight = TIME_SLOT_HEIGHT * slotsPerHour;

	return (relativeMinutes / 60) * hourHeight;
};

export const isCurrentTimeInRange = (
	startHour = 8,
	endHour = 20,
	timeZone = "Asia/Tokyo",
): boolean => {
	const now = new Date();
	const { hour } = getTimeInTimeZone(now, timeZone);
	return hour >= startHour && hour < endHour;
};

export const getEventsForDate = (
	events: ScheduleEvent[],
	date: Date,
): ScheduleEvent[] => {
	return events.filter((event) => {
		const eventDate = new Date(event.startDate);
		return eventDate.toDateString() === date.toDateString();
	});
};

/**
 * Generate month grid
 */
export const getMonthCalendarGrid = (
	date: Date,
	weekStartsOn: 0 | 1,
): Date[][] => {
	const year = date.getFullYear();
	const month = date.getMonth();
	const firstDayOfMonth = new Date(year, month, 1);
	const firstDayWeekday = firstDayOfMonth.getDay();

	const startOffset =
		weekStartsOn === 1 ? (firstDayWeekday + 6) % 7 : firstDayWeekday;

	const gridStartDate = new Date(firstDayOfMonth);
	gridStartDate.setDate(1 - startOffset);

	const weeks: Date[][] = [];
	const currentDate = new Date(gridStartDate);

	for (let week = 0; week < 6; week++) {
		const weekDays: Date[] = [];
		for (let day = 0; day < 7; day++) {
			weekDays.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		weeks.push(weekDays);
	}

	return weeks;
};

/**
 * Get hour and minute in specific timezone
 */
export const getTimeInTimeZone = (
	date: Date,
	timeZone: string = "Asia/Tokyo",
): { hour: number; minute: number } => {
	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone,
		});
		const parts = formatter.formatToParts(date);
		const hour = parseInt(
			parts.find((p) => p.type === "hour")?.value || "0",
			10,
		);
		const minute = parseInt(
			parts.find((p) => p.type === "minute")?.value || "0",
			10,
		);

		// Handle 24:00 edge case if any (Intl usually returns 00:00 for midnight)
		return { hour: hour === 24 ? 0 : hour, minute };
	} catch (e) {
		// Fallback to local time if timezone is invalid
		console.error(`Invalid timezone: ${timeZone}`, e);
		return { hour: date.getHours(), minute: date.getMinutes() };
	}
};

/**
 * Calculate event position and height
 */
export const calculateEventPosition = (
	event: ScheduleEvent,
	timeInterval = 30,
	startHour = 8,
	timeZone = "Asia/Tokyo",
): { top: number; height: number } => {
	const startTime = event.startDate;
	const endTime = event.endDate;

	const start = getTimeInTimeZone(startTime, timeZone);
	const end = getTimeInTimeZone(endTime, timeZone);

	const startTotalMinutes = start.hour * 60 + start.minute;
	let endTotalMinutes = end.hour * 60 + end.minute;

	// Handle day crossing (if end time is smaller than start time, add 24 hours)
	// Note: This is a simple handling. For multi-day events, more complex logic is needed at View component level.
	if (endTotalMinutes < startTotalMinutes) {
		endTotalMinutes += 24 * 60;
	}

	const durationMinutes = endTotalMinutes - startTotalMinutes;

	const slotsPerHour = 60 / timeInterval;
	const hourHeight = TIME_SLOT_HEIGHT * slotsPerHour;

	const baseMinutes = startHour * 60;
	const relativeStartMinutes = startTotalMinutes - baseMinutes;

	const top = (relativeStartMinutes / 60) * hourHeight;
	const height = (durationMinutes / 60) * hourHeight;

	return { top, height };
};

export const getDateClasses = (date: Date, isSelected: boolean): string => {
	const dayOfWeek = date.getDay();
	let classes = "";

	if (isSelected) {
		classes += "font-bold";
	} else {
		classes += "font-normal";
	}

	if (dayOfWeek === 0) {
		classes += " text-red-600";
	} else if (dayOfWeek === 6) {
		classes += " text-blue-600";
	} else {
		classes += " text-foreground";
	}

	return classes;
};

export const getDayNameClasses = (dayOfWeek: number): string => {
	if (dayOfWeek === 0) return "text-red-600";
	if (dayOfWeek === 6) return "text-blue-600";
	return "text-muted-foreground";
};

/**
 * Calculate overlap columns for events
 * Returns events with column position and total columns info
 */
export interface EventWithLayout {
	event: ScheduleEvent;
	position: { top: number; height: number };
	column: number; // 0-indexed column this event is in
	totalColumns: number; // total columns in this overlap group
}

/**
 * Calculate event layout with overlap handling
 * Uses a cluster-based approach to ensure consistent widths for connected events
 */
export const calculateEventsWithLayout = (
	events: ScheduleEvent[],
	timeInterval: number,
	startHour: number,
	timeZone: string = "Asia/Tokyo",
): EventWithLayout[] => {
	if (events.length === 0) return [];

	// Ensure all dates are valid Date objects for comparison
	type NormalizedEvent = ScheduleEvent & { _start: number; _end: number };
	const normalizedEvents: NormalizedEvent[] = events.map((e) => ({
		...e,
		_start: new Date(e.startDate).getTime(),
		_end: new Date(e.endDate).getTime(),
	}));

	// Local overlap check using timestamps
	const checkOverlap = (a: NormalizedEvent, b: NormalizedEvent) => {
		return a._start < b._end && a._end > b._start;
	};

	// 1. Sort events: Start time asc, then duration desc
	const sorted = [...normalizedEvents].sort((a, b) => {
		const startDiff = a._start - b._start;
		if (startDiff !== 0) return startDiff;
		return b._end - b._start - (a._end - a._start);
	});

	// 2. Build adjacency list (graph) for overlaps
	const adjacency: number[][] = Array.from({ length: sorted.length }, () => []);
	for (let i = 0; i < sorted.length; i++) {
		for (let j = i + 1; j < sorted.length; j++) {
			if (checkOverlap(sorted[i], sorted[j])) {
				adjacency[i].push(j);
				adjacency[j].push(i);
			}
		}
	}

	// 3. Find connected components (clusters)
	const visited = new Set<number>();
	const clusters: number[][] = [];

	for (let i = 0; i < sorted.length; i++) {
		if (visited.has(i)) continue;

		const cluster: number[] = [];
		const queue = [i];
		visited.add(i);

		while (queue.length > 0) {
			const current = queue.shift();
			if (current === undefined) continue;
			cluster.push(current);
			for (const neighbor of adjacency[current]) {
				if (!visited.has(neighbor)) {
					visited.add(neighbor);
					queue.push(neighbor);
				}
			}
		}
		clusters.push(cluster);
	}

	// 4. Assign columns within each cluster
	const result: EventWithLayout[] = [];

	clusters.forEach((clusterIndices) => {
		// Sort indices by startTime again just to be safe (though logic works on sorted array)
		clusterIndices.sort((a, b) => sorted[a]._start - sorted[b]._start);

		const columns: number[][] = []; // columns[colIndex] = [eventIndex, eventIndex, ...]
		const eventColumns = new Map<number, number>(); // eventIndex -> colIndex

		clusterIndices.forEach((eventIdx) => {
			const event = sorted[eventIdx];
			let assignedCol = -1;

			// Try to find first column where this event fits
			for (let c = 0; c < columns.length; c++) {
				const lastEventIdxInCol = columns[c][columns[c].length - 1];
				const lastEvent = sorted[lastEventIdxInCol];
				// Check if fits after the last event in this column
				// Strict check: start >= end
				if (event._start >= lastEvent._end) {
					assignedCol = c;
					break;
				}
			}

			if (assignedCol === -1) {
				assignedCol = columns.length;
				columns.push([]);
			}

			columns[assignedCol].push(eventIdx);
			eventColumns.set(eventIdx, assignedCol);
		});

		// 5. Calculate position and finalize
		const maxColumns = columns.length;
		clusterIndices.forEach((eventIdx) => {
			const event = sorted[eventIdx];
			const col = eventColumns.get(eventIdx);
			if (col === undefined) return;
			const position = calculateEventPosition(
				event,
				timeInterval,
				startHour,
				timeZone,
			);
			const originalEvent = events.find((e) => e.id === event.id) ?? event;

			result.push({
				event: originalEvent, // Map back to original event object to avoid type loss
				column: col,
				totalColumns: maxColumns,
				position,
			});
		});
	});

	return result;
};
