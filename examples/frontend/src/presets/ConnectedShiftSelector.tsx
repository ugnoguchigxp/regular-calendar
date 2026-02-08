import { useEffect, useMemo, useState } from "react";
import {
	ShiftSelector,
	type ShiftAssignment,
	type ShiftSlot,
	type ShiftStaff,
} from "regular-calendar";
import { useScheduleContext } from "./ScheduleContext";

function toMonthStart(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function inferRole(department: string): string {
	const normalized = department.toLowerCase();
	if (normalized.includes("doctor") || normalized.includes("医")) {
		return "Dr";
	}
	if (normalized.includes("engineer") || normalized.includes("技")) {
		return "Tech";
	}
	return "NS";
}

function addDays(baseDate: Date, daysToAdd: number): Date {
	const next = new Date(baseDate);
	next.setDate(next.getDate() + daysToAdd);
	return next;
}

function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getRoleCycle(role: string): Array<ShiftSlot[] | null> {
	if (role === "Dr") {
		return [
			["morning"],
			["afternoon"],
			null,
			["night"],
			null,
			["overnight"],
			["morning", "afternoon"],
			null,
		];
	}
	if (role === "Tech") {
		return [
			["morning"],
			["afternoon"],
			null,
			["morning"],
			null,
			["night"],
			null,
			["overnight"],
		];
	}
	return [
		["morning"],
		["afternoon"],
		["night"],
		null,
		["morning"],
		["afternoon"],
		["overnight"],
		null,
	];
}

function mergeSlots(base: ShiftSlot[], additions: ShiftSlot[]): ShiftSlot[] {
	return Array.from(new Set([...base, ...additions])).sort((a, b) =>
		a.localeCompare(b),
	);
}

function ensure24hCoverage(
	assignments: ShiftAssignment[],
	staff: ShiftStaff[],
	date: string,
	dayIndex: number,
) {
	const dayAssignments = assignments.filter((item) => item.date === date);
	const hasMorning = dayAssignments.some((item) => item.slots.includes("morning"));
	const hasAfternoon = dayAssignments.some((item) =>
		item.slots.includes("afternoon"),
	);
	const hasNight = dayAssignments.some(
		(item) =>
			item.slots.includes("night") || item.slots.includes("overnight"),
	);

	const upsert = (staffId: string, slots: ShiftSlot[]) => {
		const target = assignments.find(
			(item) => item.staffId === staffId && item.date === date,
		);
		if (!target) {
			assignments.push({
				staffId,
				date,
				slots,
				source: "template",
			});
			return;
		}
		target.slots = mergeSlots(target.slots, slots);
	};

	if (!hasMorning && staff[0]) {
		upsert(staff[0].id, ["morning"]);
	}
	if (!hasAfternoon && staff[1]) {
		upsert(staff[1].id, ["afternoon"]);
	}
	if (!hasNight && staff[staff.length - 1]) {
		upsert(staff[staff.length - 1].id, [dayIndex % 2 === 0 ? "night" : "overnight"]);
	}
}

function create24HourMockAssignments(
	staff: ShiftStaff[],
	monthStart: Date,
): ShiftAssignment[] {
	if (staff.length === 0) {
		return [];
	}
	const mockStaff = staff.filter((_, index) => index % 2 === 0);
	const activeStaff = mockStaff.length > 0 ? mockStaff : [staff[0]];

	const result: ShiftAssignment[] = [];
	const month = monthStart.getMonth();
	let cursor = new Date(monthStart);
	let dayIndex = 0;

	while (cursor.getMonth() === month) {
		const dateKey = toDateKey(cursor);

		activeStaff.forEach((member, memberIndex) => {
			const cycle = getRoleCycle(member.role);
			const cycleIndex = (dayIndex + memberIndex) % cycle.length;
			const slots = cycle[cycleIndex];
			if (!slots || slots.length === 0) {
				return;
			}
			result.push({
				staffId: member.id,
				date: dateKey,
				slots,
				source: "template",
			});
		});

		ensure24hCoverage(result, activeStaff, dateKey, dayIndex);
		cursor = addDays(cursor, 1);
		dayIndex += 1;
	}

	return result;
}

interface ConnectedShiftSelectorProps {
	selectedStaffIds?: string[];
}

export function ConnectedShiftSelector({ selectedStaffIds = [] }: ConnectedShiftSelectorProps) {
	const { personnel, loading } = useScheduleContext();
	const monthStart = useMemo(() => toMonthStart(new Date()), []);

	const staff = useMemo<ShiftStaff[]>(() => {
		return personnel.map((member) => ({
			id: member.id,
			name: member.name,
			role: inferRole(member.department),
			department: member.department,
			attributes: {
				department: member.department,
				priority: String(member.priority),
			},
		}));
	}, [personnel]);

	// savedAssignments: represents what's "saved" (initial or after confirm)
	const [savedAssignments, setSavedAssignments] = useState<ShiftAssignment[]>([]);
	// assignments: current working state (may have unsaved changes)
	const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

	// Initialize both savedAssignments and assignments when staff changes
	useEffect(() => {
		const staffIdSet = new Set(staff.map((member) => member.id));
		const updateFn = (prev: ShiftAssignment[]) => {
			const filtered = prev.filter((assignment) =>
				staffIdSet.has(assignment.staffId),
			);
			if (filtered.length > 0) {
				if (filtered.length === prev.length) {
					return prev;
				}
				return filtered;
			}
			if (staff.length === 0) {
				return prev;
			}
			return create24HourMockAssignments(staff, monthStart);
		};
		setSavedAssignments(updateFn);
		setAssignments(updateFn);
	}, [staff, monthStart]);

	return (
		<div className="h-full overflow-hidden bg-background">
			{staff.length === 0 ? (
				<div className="border border-border rounded-md bg-card p-[var(--ui-space-3)] text-sm text-muted-foreground">
					{loading ? "読み込み中..." : "スタッフなし"}
				</div>
			) : (
				<ShiftSelector
					staff={staff}
					selectedStaffIds={selectedStaffIds}
					targetMonth={monthStart}
					initialAssignments={savedAssignments}
					onChange={setAssignments}
					onConfirm={(diff) => {
						// diff contains: added, updated, deleted
						console.log("=== Shift Assignment Diff ===");
						console.log("Added:", JSON.stringify(diff.added, null, 2));
						console.log("Updated:", JSON.stringify(diff.updated, null, 2));
						console.log("Deleted:", JSON.stringify(diff.deleted, null, 2));
						// Here you would typically send to server:
						// await api.saveShiftAssignments(diff);
						// After successful save, update savedAssignments to current
						setSavedAssignments([...assignments]);
					}}
				/>
			)}
		</div>
	);
}
