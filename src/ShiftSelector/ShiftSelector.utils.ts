import { SLOT_ORDER_INDEX } from "./ShiftSelector.constants";
import type { ShiftAssignment, ShiftSlot } from "./ShiftSelector.schema";

export function toMonthStart(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, diff: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + diff);
	return next;
}

export function toMonday(date: Date): Date {
	const day = date.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	return addDays(date, diff);
}

export function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function toCellKey(staffId: string, dateKey: string): string {
	return `${staffId}__${dateKey}`;
}

export function parseCellKey(cellKey: string): {
	staffId: string;
	dateKey: string;
} {
	const splitIndex = cellKey.indexOf("__");
	if (splitIndex < 0) {
		return { staffId: "", dateKey: "" };
	}
	return {
		staffId: cellKey.slice(0, splitIndex),
		dateKey: cellKey.slice(splitIndex + 2),
	};
}

export function normalizeSlots(slots: ShiftSlot[]): ShiftSlot[] {
	return Array.from(new Set(slots)).sort(
		(a, b) => SLOT_ORDER_INDEX[a] - SLOT_ORDER_INDEX[b],
	);
}

export function mapFromAssignments(
	assignments: ShiftAssignment[],
): Map<string, ShiftAssignment> {
	const map = new Map<string, ShiftAssignment>();
	for (const item of assignments) {
		map.set(toCellKey(item.staffId, item.date), {
			...item,
			slots: normalizeSlots(item.slots),
		});
	}
	return map;
}

export function mapToAssignments(
	map: Map<string, ShiftAssignment>,
): ShiftAssignment[] {
	return Array.from(map.values()).sort((a, b) => {
		if (a.date === b.date) {
			return a.staffId.localeCompare(b.staffId);
		}
		return a.date.localeCompare(b.date);
	});
}

function toComparableRows(assignments: ShiftAssignment[]): string[] {
	return assignments
		.map(
			(item) =>
				`${item.staffId}__${item.date}__${normalizeSlots(item.slots).join(",")}`,
		)
		.sort((a, b) => a.localeCompare(b));
}

export function areAssignmentsEqual(
	left: ShiftAssignment[],
	right: ShiftAssignment[],
): boolean {
	if (left.length !== right.length) {
		return false;
	}
	const leftRows = toComparableRows(left);
	const rightRows = toComparableRows(right);
	for (let i = 0; i < leftRows.length; i += 1) {
		if (leftRows[i] !== rightRows[i]) {
			return false;
		}
	}
	return true;
}

export function getMonthGridDates(targetMonth: Date): Date[] {
	const firstDay = toMonthStart(targetMonth);
	const start = toMonday(firstDay);
	return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function getWeekdayLabels(): string[] {
	const start = toMonday(new Date(2026, 1, 2));
	return Array.from({ length: 7 }, (_, index) => {
		return new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(
			addDays(start, index),
		);
	});
}
