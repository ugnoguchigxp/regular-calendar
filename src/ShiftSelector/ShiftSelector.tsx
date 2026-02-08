import { useEffect, useMemo, useState } from "react";
import type { Personnel } from "../PersonnelPanel/PersonnelPanel.schema";
import { navigateDate } from "../utils/dateNavigation";
import { ShiftSelectorFilterBar } from "./components/ShiftSelectorFilterBar";
import { ShiftSelectorHeader } from "./components/ShiftSelectorHeader";
import { ShiftSelectorMonthGrid } from "./components/ShiftSelectorMonthGrid";
import { ShiftSelectorStaffPanel } from "./components/ShiftSelectorStaffPanel";
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
import {
	areAssignmentsEqual,
	getMonthGridDates,
	getWeekdayLabels,
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
	targetMonth?: Date;
	initialAssignments?: ShiftAssignment[];
	onChange?: (assignments: ShiftAssignment[]) => void;
	className?: string;
	components?: ShiftSelectorComponents;
}

export function ShiftSelector({
	staff,
	targetMonth = new Date(),
	initialAssignments = EMPTY_ASSIGNMENTS,
	onChange,
	className = "",
	components,
}: ShiftSelectorProps) {
	const [monthCursor, setMonthCursor] = useState<Date>(() =>
		toMonthStart(targetMonth),
	);
	const [assignmentMap, setAssignmentMap] = useState<
		Map<string, ShiftAssignment>
	>(() => mapFromAssignments(initialAssignments));
	const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
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

	const personnelList = useMemo<Personnel[]>(() => {
		return staff.map((member) => ({
			id: member.id,
			name: member.name,
			department:
				member.department ?? member.attributes?.department ?? "未設定",
			email: `${member.id}@shift.local`,
			priority: Number(member.attributes?.priority ?? 0) || 0,
		}));
	}, [staff]);

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
	const StaffPanelComponent = components?.StaffPanel ?? ShiftSelectorStaffPanel;

	return (
		<div className={`h-full flex gap-[var(--ui-space-3)] ${className}`}>
			<aside className="w-[256px] min-w-[180px] max-w-[400px] h-full">
				<StaffPanelComponent
					personnel={personnelList}
					selectedIds={selectedStaffIds}
					onSelectionChange={setSelectedStaffIds}
				/>
			</aside>

			<section className="flex-1 border border-border rounded-md bg-background overflow-auto">
				<div className="sticky top-0 z-20 bg-background border-b border-border">
					<HeaderComponent
						monthCursor={monthCursor}
						onNavigate={(direction) =>
							setMonthCursor((prev) =>
								toMonthStart(navigateDate(prev, "month", direction)),
							)
						}
						onToday={() => setMonthCursor(toMonthStart(new Date()))}
					/>
					<FilterBarComponent
						selectedSlots={selectedSlots}
						visibleSlots={visibleSlots}
						eraseMode={eraseMode}
						onToggleSlot={toggleSlot}
						onToggleVisibleSlot={toggleVisibleSlot}
						onToggleEraseMode={() => setEraseMode((prev) => !prev)}
					/>
				</div>

				<MonthGridComponent
					weekLabels={weekLabels}
					dayCells={dayCells}
					eraseMode={eraseMode}
					onDateClick={handleDateClick}
					onClearDateAssignments={clearDateAssignments}
					onDeleteAssignment={deleteAssignment}
				/>
			</section>
		</div>
	);
}
