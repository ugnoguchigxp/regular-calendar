/**
 * WeekView - Week View Component
 * Horizontal: Resources
 * Vertical: Days (7 days)
 * Max 4 events per cell
 */

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { addDays } from "@/utils/dateUtils";
import { WEEK_VIEW } from "../../constants";
import type {
	EventCardComponentProps,
	FacilityScheduleSettings,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule.schema";
import {
	filterEventsByDateRange,
	filterEventsByResource,
	generateDateRange,
	getWeekEnd,
	getWeekStart,
	normalizeWeekStartsOn,
	sortEventsByTime,
} from "../../utils/scheduleHelpers";
import {
	createEventIndexes,
	getDayKey,
	getEventsByDay,
} from "../../utils/scheduleIndexHelpers";
import { isClosedDay } from "../../utils/timeSlotHelpers";

interface WeekViewProps {
	weekStart: Date;
	resources: Resource[];
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;
	groups?: ResourceGroup[];
	onEventClick?: (event: ScheduleEvent) => void;
	onEmptySlotClick?: (resourceId: string, date: Date) => void;
	components?: {
		EventCard?: React.ComponentType<EventCardComponentProps>;
	};
}

export function WeekView({
	weekStart,
	resources,
	events,
	settings,
	groups = [],
	onEventClick,
	onEmptySlotClick,
	components,
}: WeekViewProps) {
	const weekStartsOn = useMemo(
		() => normalizeWeekStartsOn(settings.weekStartsOn),
		[settings.weekStartsOn],
	);

	const normalizedWeekStart = useMemo(() => {
		return getWeekStart(weekStart, weekStartsOn);
	}, [weekStart, weekStartsOn]);

	const weekEndInclusive = useMemo(() => {
		return getWeekEnd(weekStart, weekStartsOn);
	}, [weekStart, weekStartsOn]);

	// Map groups for lookup
	const groupMap = useMemo(() => {
		const map = new Map<string, ResourceGroup>();
		for (const g of groups) {
			map.set(g.id, g);
		}
		return map;
	}, [groups]);

	const weekDays = useMemo(() => {
		return generateDateRange(normalizedWeekStart, weekEndInclusive);
	}, [normalizedWeekStart, weekEndInclusive]);

	const weekEvents = useMemo(() => {
		const filtered = filterEventsByDateRange(
			events,
			normalizedWeekStart,
			addDays(weekEndInclusive, 1),
		);
		return sortEventsByTime(filtered);
	}, [events, normalizedWeekStart, weekEndInclusive]);

	const eventIndexes = useMemo(() => {
		return createEventIndexes(weekEvents);
	}, [weekEvents]);

	const eventsByDay = useMemo(() => {
		const map = new Map<string, ScheduleEvent[]>();
		for (const day of weekDays) {
			// Sort: AllDay first, then by time
			const dayEvents = getEventsByDay(day, eventIndexes).sort((a, b) => {
				if (a.isAllDay && !b.isAllDay) return -1;
				if (!a.isAllDay && b.isAllDay) return 1;
				return a.startDate.getTime() - b.startDate.getTime();
			});
			const key = getDayKey(day);
			map.set(key, dayEvents);
		}
		return map;
	}, [weekDays, eventIndexes]);

	const today = useMemo(() => {
		const t = new Date();
		t.setHours(0, 0, 0, 0);
		return t;
	}, []);

	return (
		<div className="flex flex-col h-full">
			{/* Header (Desktop) */}
			<div className="hidden md:block border-b border-border bg-background px-ui py-ui">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-bold">
							<DateDisplay date={normalizedWeekStart} variant="date" />
							{" - "}
							{weekDays[6] && (
								<DateDisplay date={weekDays[6]} variant="monthDay" />
							)}
						</h2>
						<div className="text-sm text-muted-foreground mt-[var(--ui-space-1)]">
							Events: {weekEvents.length} / Resources: {resources.length}
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col">
					{/* Header Row (Resources) */}
					<div className="flex border-b border-border bg-background sticky top-[var(--ui-space-0)] z-20">
						<div
							className="flex-shrink-0 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)]"
							style={{ width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px` }}
						>
							{/* Corner */}
						</div>
						{resources.map((resource) => {
							const group = groupMap.get(resource.groupId);
							return (
								<div
									key={resource.id}
									className="flex-1 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)] text-center overflow-hidden min-w-[var(--ui-space-20)]"
								>
									<div
										className="font-semibold text-xs leading-tight truncate"
										title={resource.name}
									>
										{resource.name}
									</div>
									<div className="text-[10px] text-muted-foreground leading-tight truncate">
										{group?.name || "-"}
									</div>
								</div>
							);
						})}
					</div>

					{/* Day Rows */}
					{weekDays.map((day) => {
						const normalizedDay = new Date(day);
						normalizedDay.setHours(0, 0, 0, 0);
						const isToday = normalizedDay.getTime() === today.getTime();
						const isClosed = isClosedDay(day, settings.closedDays);

						const dateCellBgClass = isClosed
							? "bg-muted"
							: isToday
								? "bg-background"
								: "bg-card";
						const scheduleCellBgClass = isClosed
							? "bg-muted"
							: isToday
								? "bg-background"
								: "bg-card";
						const scheduleCellInteractiveClass = isClosed
							? "cursor-not-allowed opacity-60"
							: "cursor-pointer hover:bg-accent";

						const dayKey = getDayKey(day);
						const eventsForDay = eventsByDay.get(dayKey) ?? [];

						return (
							<div
								key={day.toISOString()}
								className="flex border-b border-border"
							>
								{/* Date Cell */}
								<div
									className={`flex-shrink-0 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)] flex items-center justify-center ${dateCellBgClass}`}
									style={{
										width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px`,
										height: `${WEEK_VIEW.DAY_CELL_HEIGHT}px`,
									}}
								>
									<div className="text-center">
										<div className="font-semibold text-xs leading-tight whitespace-pre-line">
											<DateDisplay date={day} variant="compact" />
										</div>
										{isClosed && (
											<div className="text-[10px] text-warning mt-[var(--ui-space-1)]">
												Off
											</div>
										)}
									</div>
								</div>

								{/* Resource Cells */}
								{resources.map((resource) => {
									const cellEvents = filterEventsByResource(
										eventsForDay,
										resource.id,
									);

									return (
										<div
											key={resource.id}
											className={`relative flex-1 border-r border-border p-[var(--ui-space-0-5)] ${scheduleCellBgClass} ${scheduleCellInteractiveClass} transition-colors overflow-hidden min-w-[var(--ui-space-20)]`}
											style={{
												height: `${WEEK_VIEW.DAY_CELL_HEIGHT}px`,
											}}
										>
											<Button
												type="button"
												variant="ghost"
												className="absolute inset-[var(--ui-space-0)] z-0 p-[var(--ui-space-0)]"
												disabled={isClosed || !onEmptySlotClick}
												aria-label={`Add event to ${resource.name}`}
												onClick={() => {
													if (!isClosed) {
														onEmptySlotClick?.(resource.id, day);
													}
												}}
												onKeyDown={(event) => {
													if (isClosed || !onEmptySlotClick) return;
													if (event.key === "Enter" || event.key === " ") {
														event.preventDefault();
														onEmptySlotClick(resource.id, day);
													}
												}}
											>
												<span className="sr-only">Add</span>
											</Button>
											<div className="relative z-10 flex flex-col gap-[var(--ui-space-0)] h-full overflow-hidden">
												{cellEvents
													.slice(0, WEEK_VIEW.MAX_VISIBLE_EVENTS)
													.map((event) => {
														const bgColor = event.hasConflict
															? "bg-destructive"
															: event.color
																? ""
																: "bg-primary";
														const customStyle =
															event.color && !event.hasConflict
																? { backgroundColor: event.color }
																: {};

														const startTime =
															event.startDate.toLocaleTimeString("ja-JP", {
																hour: "2-digit",
																minute: "2-digit",
															});

														const CardContainer = ({
															children,
														}: {
															children: React.ReactNode;
														}) => (
															<button
																key={event.id}
																type="button"
																className={`${bgColor} text-primary-foreground px-[var(--ui-space-1-5)] py-[var(--ui-space-0-5)] rounded text-sm cursor-pointer hover:brightness-110 transition-colors text-left leading-normal truncate w-full mb-[var(--ui-space-0-5)]`}
																style={customStyle}
																onClick={(e) => {
																	e.stopPropagation();
																	onEventClick?.(event);
																}}
															>
																{children}
															</button>
														);

														if (components?.EventCard) {
															return (
																<CardContainer key={event.id}>
																	<components.EventCard
																		event={event}
																		viewMode="week"
																		isCompact={true}
																		onClick={() => onEventClick?.(event)}
																	/>
																</CardContainer>
															);
														}

														return (
															<CardContainer key={event.id}>
																<span className="font-medium">
																	{event.hasConflict && "⚠️ "}
																	{!event.isAllDay && `${startTime} `}
																	{event.title}
																</span>
															</CardContainer>
														);
													})}
												{cellEvents.length > WEEK_VIEW.MAX_VISIBLE_EVENTS && (
													<div className="text-[9px] text-muted-foreground text-center">
														+{cellEvents.length - WEEK_VIEW.MAX_VISIBLE_EVENTS}
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
