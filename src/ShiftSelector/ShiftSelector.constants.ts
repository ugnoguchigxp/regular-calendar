import type { ShiftSlot } from "./ShiftSelector.schema";

export const SLOT_LABELS: Record<ShiftSlot, string> = {
	morning: "午前",
	afternoon: "午後",
	night: "夜間",
	overnight: "オーバーナイト",
};

export const SLOT_ORDER: ShiftSlot[] = [
	"morning",
	"afternoon",
	"night",
	"overnight",
];

export const SLOT_ORDER_INDEX: Record<ShiftSlot, number> = {
	morning: 0,
	afternoon: 1,
	night: 2,
	overnight: 3,
};

export const SLOT_BADGES: Record<ShiftSlot, string> = {
	morning: "bg-sky-100 text-sky-700 border-sky-200",
	afternoon: "bg-amber-100 text-amber-700 border-amber-200",
	night: "bg-indigo-100 text-indigo-700 border-indigo-200",
	overnight: "bg-rose-100 text-rose-700 border-rose-200",
};

export const SLOT_SELECTION_BADGES: Record<ShiftSlot, string> = {
	morning:
		"bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-700",
	afternoon:
		"bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700",
	night:
		"bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700",
	overnight:
		"bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700",
};
