/**
 * Standard Month View Component
 */

import { useMemo } from "react";
import { useAppTranslation } from "@/utils/i18n";
import type { RegularCalendarComponents } from "../../RegularCalendar";
import type {
	FacilityScheduleSettings,
	ScheduleEvent,
	ViewMode,
} from "../../RegularCalendar.schema";
import {
	getDateClasses,
	getEventsForDate,
	getMonthCalendarGrid,
} from "../../utils/calendarHelpers";
import { MonthEventItem } from "../Common/EventComponents";

interface MonthViewProps {
	currentDate: Date;
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;
	onDateClick?: (date: Date) => void;
	onEventClick?: (event: ScheduleEvent) => void;
	currentUserId?: string;
	renderEventContent?: (
		event: ScheduleEvent,
		viewMode: ViewMode,
	) => React.ReactNode;
	components?: RegularCalendarComponents;
}

export function MonthView({
	currentDate,
	events,
	settings,
	onDateClick,
	onEventClick,
	currentUserId,
	renderEventContent,
	components,
}: MonthViewProps) {
	const { t } = useAppTranslation();
	const weekStart = settings.weekStartsOn ?? 1;

	const calendarGrid = useMemo(
		() => getMonthCalendarGrid(currentDate, weekStart),
		[currentDate, weekStart],
	);

	const dayNames = [
		t("days_short_sun"),
		t("days_short_mon"),
		t("days_short_tue"),
		t("days_short_wed"),
		t("days_short_thu"),
		t("days_short_fri"),
		t("days_short_sat"),
	];
	// Rotate if starts on Monday
	const displayDayNames =
		weekStart === 1 ? [...dayNames.slice(1), dayNames[0]] : dayNames;

	const today = new Date();
	const currentMonth = currentDate.getMonth();

	return (
		<div className="h-full flex flex-col bg-background text-foreground">
			{/* Header */}
			<div className="grid grid-cols-7 border-b border-border bg-muted/40">
				{displayDayNames.map((day) => (
					<div
						key={day}
						className="p-[var(--ui-space-3)] text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
					>
						{day}
					</div>
				))}
			</div>

			{/* Grid */}
			<div
				className="flex-1 grid gap-[var(--ui-space-0)]"
				style={{ gridTemplateRows: `repeat(${calendarGrid.length}, 1fr)` }}
			>
				{calendarGrid.map((week) => (
					<div
						key={week[0]?.toISOString() ?? "empty-week"}
						className="grid grid-cols-7 border-b border-border last:border-b-0 h-full"
					>
						{week.map((date) => {
							const isToday = date.toDateString() === today.toDateString();
							const isCurrentMonth = date.getMonth() === currentMonth;
							const isSelected =
								date.toDateString() === currentDate.toDateString();
							const dayEvents = getEventsForDate(events, date);

							return (
								<div
									key={date.toISOString()}
									className={`
                                        relative border-r border-border last:border-r-0 p-ui-cell cursor-pointer
                                        transition-colors
                                        ${!isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "bg-background"}
                                        ${isSelected ? "bg-primary/5" : ""}
                                        hover:bg-muted/50
                                        flex flex-col
                                     `}
								>
									<button
										type="button"
										className="absolute inset-[var(--ui-space-0)] z-0"
										aria-label={t("day_cell") ?? "Day cell"}
										onClick={() => onDateClick?.(date)}
									/>
									<div
										className={`text-sm font-medium mb-[var(--ui-space-1)] flex justify-between items-center
                                        ${getDateClasses(date, isSelected)}
                                     `}
									>
										<span
											className={`
                                            ${isToday ? "bg-primary text-primary-foreground rounded-full w-[var(--ui-space-6)] h-[var(--ui-space-6)] flex items-center justify-center" : ""}
                                         `}
										>
											{date.getDate()}
										</span>
									</div>

									<div className="space-y-[var(--ui-space-1)] overflow-hidden flex-1 relative z-10">
										{dayEvents.slice(0, 3).map((event) => (
											<MonthEventItem
												key={event.id}
												event={event}
												onClick={onEventClick}
												currentUserId={currentUserId}
												renderEventContent={renderEventContent}
												components={components}
											/>
										))}
										{dayEvents.length > 3 && (
											<div className="text-xs text-muted-foreground text-center">
												+{dayEvents.length - 3} more
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
