import type { ComponentType } from "react";
import type { Personnel } from "../PersonnelPanel/PersonnelPanel.schema";
import type { ShiftSlot } from "./ShiftSelector.schema";

export interface ShiftDayAssignmentView {
	staffId: string;
	staffName: string;
	slots: ShiftSlot[];
	sortIndex: number;
}

export interface ShiftDayCellView {
	date: Date;
	dateKey: string;
	inCurrentMonth: boolean;
	isToday: boolean;
	assignments: ShiftDayAssignmentView[];
}

export interface ShiftSelectorHeaderProps {
	monthCursor: Date;
	onNavigate: (direction: "prev" | "next") => void;
	onToday: () => void;
}

export interface ShiftSelectorFilterBarProps {
	selectedSlots: Set<ShiftSlot>;
	visibleSlots: Set<ShiftSlot>;
	eraseMode: boolean;
	onToggleSlot: (slot: ShiftSlot) => void;
	onToggleVisibleSlot: (slot: ShiftSlot) => void;
	onToggleEraseMode: () => void;
}

export interface ShiftSelectorMonthGridProps {
	weekLabels: string[];
	dayCells: ShiftDayCellView[];
	eraseMode: boolean;
	onDateClick: (dateKey: string) => void;
	onClearDateAssignments: (dateKey: string) => void;
	onDeleteAssignment: (dateKey: string, staffId: string) => void;
}

export interface ShiftSelectorStaffPanelProps {
	personnel: Personnel[];
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
}

export interface ShiftSelectorComponents {
	Header?: ComponentType<ShiftSelectorHeaderProps>;
	FilterBar?: ComponentType<ShiftSelectorFilterBarProps>;
	MonthGrid?: ComponentType<ShiftSelectorMonthGridProps>;
	StaffPanel?: ComponentType<ShiftSelectorStaffPanelProps>;
}
