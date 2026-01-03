import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	isSameDay,
	isSameMonth,
	isWithinInterval,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "@/utils/dateUtils";
import { Icons } from "@/components/ui/Icons";
import * as React from "react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/components/ui/utils";
import { formatCalendarDate } from "@/utils/dateFormats";

export type DateRange = {
	from: Date | undefined;
	to?: Date | undefined;
};

export type CalendarProps = {
	className?: string;
	locale?: string; // IETF BCP 47 language tag (e.g. "ja-JP", "en-US")
	// Single mode
	mode?: "single" | "range";
	selected?: Date | DateRange | undefined;
	onSelect?: (
		date: any, // Relaxing type here to accommodate both signatures for now, but internal logic handles it
	) => void;
	disabled?:
	| boolean
	| Date
	| Date[]
	| ((date: Date) => boolean)
	// react-day-picker style modifiers
	| { before: Date }
	| { after: Date }
	| { before?: Date; after?: Date }[];
	numberOfMonths?: number;
	defaultMonth?: Date;
	showOutsideDays?: boolean; // kept for API compat, always true in this impl
};

export function Calendar({
	className,
	locale,
	mode = "single",
	selected,
	onSelect,
	disabled,
	numberOfMonths: _numberOfMonths = 1, // Unused for now
	defaultMonth,
}: CalendarProps) {
	// --- State ---
	const [currentMonth, setCurrentMonth] = React.useState(
		defaultMonth || new Date(),
	);

	// --- Helpers ---
	const isDisabled = (date: Date) => {
		if (!disabled) return false;
		if (Array.isArray(disabled)) {
			// Check array of modifiers
			return disabled.some((d) => {
				if (d instanceof Date) return isSameDay(date, d);
				// Check for { before: Date }
				if (typeof d === "object" && "before" in d && d.before) {
					return date < d.before;
				}
				// Check for { after: Date }
				if (typeof d === "object" && "after" in d && d.after) {
					return date > d.after;
				}
				return false;
			});
		}
		// Single Date
		if (disabled instanceof Date) return isSameDay(date, disabled);
		// Function
		if (typeof disabled === 'function') return disabled(date);
		return false;
	};

	const isSelected = (date: Date) => {
		if (!selected) return false;
		if (mode === "single" && selected instanceof Date) {
			return isSameDay(date, selected);
		}
		if (mode === "range" && (selected as DateRange).from) {
			const range = selected as DateRange;
			if (range.from && isSameDay(date, range.from)) return true;
			if (range.to && isSameDay(date, range.to)) return true;
			if (range.from && range.to) {
				return isWithinInterval(date, { start: range.from, end: range.to });
			}
		}
		return false;
	};

	const getDayClass = (date: Date) => {
		let isRangeStart = false;
		let isRangeEnd = false;
		let isRangeMiddle = false;

		if (mode === "range" && (selected as DateRange)?.from) {
			const range = selected as DateRange;
			if (range.from && isSameDay(date, range.from)) isRangeStart = true;
			if (range.to && isSameDay(date, range.to)) isRangeEnd = true;
			if (range.from && range.to && isWithinInterval(date, { start: range.from, end: range.to })) {
				isRangeMiddle = true;
			}
		}

		return cn(
			buttonVariants({ variant: "ghost" }),
			"p-ui font-normal aria-selected:opacity-100",
			isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
			isRangeMiddle && !isRangeStart && !isRangeEnd && "bg-accent text-accent-foreground rounded-none",
			isRangeStart && "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
			isRangeEnd && "bg-primary text-primary-foreground rounded-l-none rounded-r-md",
			// Single selection style
			(mode === "single" && isSelected(date)) && "rounded-md",
			!isSameMonth(date, currentMonth) && "text-muted-foreground opacity-50",
			isDisabled(date) && "text-muted-foreground opacity-50 cursor-not-allowed",
		);
	};

	// --- Handlers ---
	const handleDateClick = (date: Date) => {
		if (isDisabled(date)) return;

		if (mode === "single") {
			onSelect?.(date);
		} else if (mode === "range") {
			const currentRange = (selected as DateRange) || {
				from: undefined,
				to: undefined,
			};

			// If no start date, or both start and end exist (reset), start new range
			if (!currentRange.from || (currentRange.from && currentRange.to)) {
				onSelect?.({ from: date, to: undefined });
			} else {
				// We have a start date, decide if this is end date or new start date
				if (date < currentRange.from) {
					// Clicked before start, make it new start
					onSelect?.({ from: date, to: undefined });
				} else {
					// Valid range
					onSelect?.({ from: currentRange.from, to: date });
				}
			}
		}
	};

	const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
	const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

	// --- Render ---
	// Generate grid for currentMonth
	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(monthStart);
	// Start of week: Default to Sunday (0) or use prop if added later (currently just using default)
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);

	const days = eachDayOfInterval({ start: startDate, end: endDate });

	return (
		<div className={cn("p-ui flex flex-col gap-y-ui", className)}>
			{/* Header */}
			<div className="flex items-center justify-between gap-x-ui">
				{/* Previous Button */}
				<button
					type="button"
					onClick={prevMonth}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"bg-transparent p-ui hover:bg-accent hover:text-accent-foreground"
					)}
				>
					<Icons.ChevronLeft className="h-ui-icon w-ui-icon" strokeWidth={3} />
				</button>

				{/* Title */}
				<div className="font-medium text-ui">
					{formatCalendarDate(currentMonth, locale, "header")}
				</div>

				{/* Next Button */}
				<button
					type="button"
					onClick={nextMonth}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"bg-transparent p-ui hover:bg-accent hover:text-accent-foreground"
					)}
				>
					<Icons.ChevronRight className="h-ui-icon w-ui-icon" strokeWidth={3} />
				</button>
			</div>

			{/* Grid */}
			<table className="w-full border-collapse space-y-1">
				<thead>
					<tr>
						{eachDayOfInterval({
							start: startOfWeek(currentMonth),
							end: endOfWeek(startOfWeek(currentMonth)),
						}).map((day, i) => {
							const dayOfWeek = day.getDay();
							const isSunday = dayOfWeek === 0;
							const isSaturday = dayOfWeek === 6;

							return (
								<th
									key={i}
									className={cn(
										"rounded-md font-normal text-[0.8rem]",
										isSunday && "text-red-500",
										isSaturday && "text-blue-500",
										!isSunday && !isSaturday && "text-muted-foreground",
									)}
								>
									<div className="flex justify-center items-center p-ui">
										{formatCalendarDate(day, locale, "weekdayShort")}
									</div>
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{/* Days - split into weeks */}
					{Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
						<tr key={weekIndex} className="w-full">
							{days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
								<td key={dayIndex} className="p-0 text-center relative focus-within:relative">
									<button
										type="button"
										onClick={() => handleDateClick(date)}
										className={getDayClass(date)}
										disabled={isDisabled(date)}
									>
										{formatCalendarDate(date, locale, "day")}
									</button>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
