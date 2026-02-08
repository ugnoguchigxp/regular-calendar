import { useEffect, useMemo, useState } from "react";
import { navigateDate } from "../utils/dateNavigation";
import { ShiftSelectorFilterBar } from "./components/ShiftSelectorFilterBar";
import { ShiftSelectorHeader } from "./components/ShiftSelectorHeader";
import { ShiftSelectorMonthGrid } from "./components/ShiftSelectorMonthGrid";
import { SLOT_ORDER, SLOT_ORDER_INDEX } from "./ShiftSelector.constants";
import type {
	ShiftAssignment,
	ShiftSlot,
	ShiftStaff,
} from "./ShiftSelector.schema";
import type {
	ShiftDayAssignmentView,
	ShiftDayCellView,
	ShiftSelectorComponents,
} from "./ShiftSelector.types";
import type { ShiftAssignmentDiff } from "./ShiftSelector.utils";
import {
	areAssignmentsEqual,
	calculateAssignmentDiff,
	getMonthGridDates,
	getWeekdayLabels,
	hasDiff,
	mapFromAssignments,
	mapToAssignments,
	normalizeSlots,
	parseCellKey,
	toCellKey,
	toDateKey,
	toMonthStart,
} from "./ShiftSelector.utils";

const EMPTY_ASSIGNMENTS: ShiftAssignment[] = [];

export interface ShiftSelectorProps {
	staff: ShiftStaff[];
	selectedStaffIds?: string[];
	targetMonth?: Date;
	initialAssignments?: ShiftAssignment[];
	onChange?: (assignments: ShiftAssignment[]) => void;
	/** Called when user clicks confirm button with diff data */
	onConfirm?: (diff: ShiftAssignmentDiff) => void;
	className?: string;
	components?: ShiftSelectorComponents;
}

export function ShiftSelector({
	staff,
	selectedStaffIds = [],
	targetMonth = new Date(),
	initialAssignments = EMPTY_ASSIGNMENTS,
	onChange,
	onConfirm,
	className = "",
	components,
}: ShiftSelectorProps) {
	const [monthCursor, setMonthCursor] = useState<Date>(() =>
		toMonthStart(targetMonth),
	);
	const [assignmentMap, setAssignmentMap] = useState<
		Map<string, ShiftAssignment>
	>(() => mapFromAssignments(initialAssignments));
	const [selectedSlots, setSelectedSlots] = useState<Set<ShiftSlot>>(
		new Set(["morning"]),
	);
	const [visibleSlots, setVisibleSlots] = useState<Set<ShiftSlot>>(
		new Set(SLOT_ORDER),
	);
	const [eraseMode, setEraseMode] = useState(false);

	useEffect(() => {
		setAssignmentMap((prev) => {
			const prevAssignments = mapToAssignments(prev);
			if (areAssignmentsEqual(prevAssignments, initialAssignments)) {
				return prev;
			}
			return mapFromAssignments(initialAssignments);
		});
	}, [initialAssignments]);

	const allAssignments = useMemo(
		() => mapToAssignments(assignmentMap),
		[assignmentMap],
	);

	useEffect(() => {
		if (!onChange) {
			return;
		}
		onChange(allAssignments);
	}, [allAssignments, onChange]);

	const monthDates = useMemo(
		() => getMonthGridDates(monthCursor),
		[monthCursor],
	);
	const weekLabels = useMemo(() => getWeekdayLabels(), []);

	const assignmentIndexByDate = useMemo(() => {
		const index = new Map<string, ShiftDayAssignmentView[]>();
		const staffNameById = new Map(
			staff.map((member) => [member.id, member.name]),
		);
		for (const assignment of assignmentMap.values()) {
			const name = staffNameById.get(assignment.staffId);
			if (!name) {
				continue;
			}
			const displaySlots = normalizeSlots(
				assignment.slots.filter((slot) => visibleSlots.has(slot)),
			);
			if (displaySlots.length === 0) {
				continue;
			}
			const row = index.get(assignment.date) ?? [];
			row.push({
				staffId: assignment.staffId,
				staffName: name,
				slots: displaySlots,
				sortIndex: SLOT_ORDER_INDEX[displaySlots[0]],
			});
			index.set(assignment.date, row);
		}
		for (const row of index.values()) {
			row.sort((a, b) => {
				if (a.sortIndex !== b.sortIndex) {
					return a.sortIndex - b.sortIndex;
				}
				return a.staffName.localeCompare(b.staffName);
			});
		}
		return index;
	}, [assignmentMap, staff, visibleSlots]);

	const dayCells = useMemo<ShiftDayCellView[]>(() => {
		const todayKey = toDateKey(new Date());
		return monthDates.map((date) => {
			const dateKey = toDateKey(date);
			return {
				date,
				dateKey,
				inCurrentMonth: date.getMonth() === monthCursor.getMonth(),
				isToday: dateKey === todayKey,
				assignments: assignmentIndexByDate.get(dateKey) ?? [],
			};
		});
	}, [monthDates, monthCursor, assignmentIndexByDate]);

	const toggleSlot = (slot: ShiftSlot) => {
		setSelectedSlots((prev) => {
			const next = new Set(prev);
			if (next.has(slot)) {
				next.delete(slot);
			} else {
				next.add(slot);
			}
			return next;
		});
	};

	const toggleVisibleSlot = (slot: ShiftSlot) => {
		setVisibleSlots((prev) => {
			const next = new Set(prev);
			if (next.has(slot)) {
				next.delete(slot);
			} else {
				next.add(slot);
			}
			return next;
		});
	};

	const handleDateClick = (dateKey: string) => {
		if (eraseMode || selectedStaffIds.length === 0) {
			return;
		}

		setAssignmentMap((prev) => {
			const next = new Map(prev);
			const slotList = normalizeSlots(Array.from(selectedSlots));
			if (slotList.length === 0) {
				return prev;
			}

			for (const staffId of selectedStaffIds) {
				const key = toCellKey(staffId, dateKey);
				next.set(key, {
					staffId,
					date: dateKey,
					slots: slotList,
					source: selectedStaffIds.length > 1 ? "bulk" : "manual",
				});
			}

			return next;
		});
	};

	const deleteAssignment = (dateKey: string, staffId: string) => {
		setAssignmentMap((prev) => {
			const next = new Map(prev);
			next.delete(toCellKey(staffId, dateKey));
			return next;
		});
	};

	const clearDateAssignments = (dateKey: string) => {
		setAssignmentMap((prev) => {
			const next = new Map(prev);
			for (const key of next.keys()) {
				const parsed = parseCellKey(key);
				if (parsed.dateKey === dateKey) {
					next.delete(key);
				}
			}
			return next;
		});
	};

	const HeaderComponent = components?.Header ?? ShiftSelectorHeader;
	const FilterBarComponent = components?.FilterBar ?? ShiftSelectorFilterBar;
	const MonthGridComponent = components?.MonthGrid ?? ShiftSelectorMonthGrid;

	return (
		<div className={`flex flex-col h-full bg-background ${className}`}>
			{/* Header - same structure as RegularCalendar */}
			<header className="border-b border-border px-[var(--ui-space-4)] py-[var(--ui-space-3)] flex items-center justify-between gap-[var(--ui-space-4)]">
				<HeaderComponent
					monthCursor={monthCursor}
					onNavigate={(direction) =>
						setMonthCursor((prev) =>
							toMonthStart(navigateDate(prev, "month", direction)),
						)
					}
					onToday={() => setMonthCursor(toMonthStart(new Date()))}
				/>
				<div className="flex items-center gap-[var(--ui-space-3)]">
					<FilterBarComponent
						selectedSlots={selectedSlots}
						visibleSlots={visibleSlots}
						eraseMode={eraseMode}
						onToggleSlot={toggleSlot}
						onToggleVisibleSlot={toggleVisibleSlot}
						onToggleEraseMode={() => setEraseMode((prev) => !prev)}
					/>
					{onConfirm && (
						<button
							type="button"
							onClick={() => {
								const diff = calculateAssignmentDiff(
									initialAssignments,
									allAssignments,
								);
								onConfirm(diff);
							}}
							disabled={!hasDiff(initialAssignments, allAssignments)}
							className="px-[var(--ui-space-4)] py-[var(--ui-space-2)] text-sm font-medium rounded border border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							確定
						</button>
					)}
				</div>
			</header>

			{/* Content */}
			<div className="flex-1 overflow-auto">
				<MonthGridComponent
					weekLabels={weekLabels}
					dayCells={dayCells}
					eraseMode={eraseMode}
					onDateClick={handleDateClick}
					onClearDateAssignments={clearDateAssignments}
					onDeleteAssignment={deleteAssignment}
				/>
			</div>
		</div>
	);
}
