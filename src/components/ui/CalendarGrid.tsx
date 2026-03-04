import * as React from "react";
import { addMonths, startOfMonth } from "@/utils/dateUtils";
import { Calendar, type CalendarProps } from "./Calendar";
import { cn } from "./utils";

type CalendarGridColumnCount = 1 | 2 | 3 | 4 | 5 | 6;

export type CalendarGridColumns = {
	default?: CalendarGridColumnCount;
	sm?: CalendarGridColumnCount;
	md?: CalendarGridColumnCount;
	lg?: CalendarGridColumnCount;
	xl?: CalendarGridColumnCount;
};

export type CalendarGridProps = {
	startDate: Date;
	endDate: Date;
	highlightedDates?: Date[];
	columns?: CalendarGridColumns;
	className?: string;
	locale?: CalendarProps["locale"];
	mode?: CalendarProps["mode"];
	selected?: CalendarProps["selected"];
	onSelect?: CalendarProps["onSelect"];
	disabled?: CalendarProps["disabled"];
};

const GRID_COLS_MAP: Record<CalendarGridColumnCount, string> = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-3",
	4: "grid-cols-4",
	5: "grid-cols-5",
	6: "grid-cols-6",
};

const BREAKPOINT_PREFIX: Record<
	Exclude<keyof CalendarGridColumns, "default">,
	string
> = {
	sm: "sm",
	md: "md",
	lg: "lg",
	xl: "xl",
};

const DEFAULT_COLUMNS: Required<
	Pick<CalendarGridColumns, "default" | "sm" | "lg" | "xl">
> = {
	default: 1,
	sm: 2,
	lg: 3,
	xl: 4,
};

const getGridClass = (columns: CalendarGridColumns | undefined) => {
	const mergedColumns = {
		...DEFAULT_COLUMNS,
		...columns,
	};

	return cn(
		GRID_COLS_MAP[mergedColumns.default],
		mergedColumns.sm &&
			`${BREAKPOINT_PREFIX.sm}:${GRID_COLS_MAP[mergedColumns.sm]}`,
		mergedColumns.md &&
			`${BREAKPOINT_PREFIX.md}:${GRID_COLS_MAP[mergedColumns.md]}`,
		mergedColumns.lg &&
			`${BREAKPOINT_PREFIX.lg}:${GRID_COLS_MAP[mergedColumns.lg]}`,
		mergedColumns.xl &&
			`${BREAKPOINT_PREFIX.xl}:${GRID_COLS_MAP[mergedColumns.xl]}`,
	);
};

export function CalendarGrid({
	startDate,
	endDate,
	highlightedDates,
	columns,
	className,
	locale,
	mode = "single",
	selected,
	onSelect,
	disabled,
}: CalendarGridProps) {
	const months = React.useMemo(() => {
		const firstMonth = startOfMonth(startDate);
		const lastMonth = startOfMonth(endDate);
		const [from, to] =
			firstMonth.getTime() <= lastMonth.getTime()
				? [firstMonth, lastMonth]
				: [lastMonth, firstMonth];

		const monthList: Date[] = [];
		let cursor = new Date(from);
		while (cursor.getTime() <= to.getTime()) {
			monthList.push(new Date(cursor));
			cursor = addMonths(cursor, 1);
		}

		return monthList;
	}, [startDate, endDate]);

	return (
		<div className={cn("grid gap-ui", getGridClass(columns), className)}>
			{months.map((month) => (
				<Calendar
					key={month.toISOString()}
					mode={mode}
					selected={selected}
					onSelect={onSelect}
					disabled={disabled}
					locale={locale}
					defaultMonth={month}
					numberOfMonths={1}
					disableNavigation={true}
					highlightedDates={highlightedDates}
					className="scale-90 origin-top"
				/>
			))}
		</div>
	);
}
