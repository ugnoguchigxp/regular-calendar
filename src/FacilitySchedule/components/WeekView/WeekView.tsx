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

	const isVertical = settings.orientation === "vertical";

	return (
		<div className="flex flex-col h-full bg-background overflow-hidden">
			{/* Header (Desktop) - Optional title area */}
			<div className="hidden md:block border-b border-border bg-background px-ui py-ui shrink-0">
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

			{/* Unified Scroll Container */}
			<div className="flex-1 overflow-auto">
				{isVertical ? (
					/* Vertical Orientation: Resources as Rows, Days as Columns */
					<div className="flex flex-col min-w-max">
						{/* Header Row (Days) */}
						<div className="flex border-b border-border bg-background sticky top-0 z-30">
							<div className="bg-background border-r border-border sticky left-0 z-40 flex shrink-0">
								<div className="w-[var(--ui-space-12)] border-r border-border shrink-0" />
								<div className="w-[var(--ui-space-32)] flex-1 shrink-0" />
							</div>
							{weekDays.map((day) => {
								const normalizedDay = new Date(day);
								normalizedDay.setHours(0, 0, 0, 0);
								const isToday = normalizedDay.getTime() === today.getTime();
								return (
									<div
										key={day.toISOString()}
										className={`flex-1 border-r border-border px-[var(--ui-space-2)] py-[var(--ui-space-2)] text-center min-w-[var(--ui-space-32)] ${isToday ? "bg-primary/5" : ""}`}
									>
										<div className="font-semibold text-xs leading-tight">
											<DateDisplay date={day} variant="compact" />
										</div>
									</div>
								);
							})}
						</div>

						{/* Resource Rows */}
						{/* Resource Rows */}
						<div className="flex flex-col">
							{(() => {
								const groupedResources: { group: ResourceGroup | undefined; resources: Resource[] }[] = [];
								let currentGroup: ResourceGroup | undefined;
								let currentChunk: Resource[] = [];

								resources.forEach((resource, i) => {
									const group = groupMap.get(resource.groupId);
									const prevResource = i > 0 ? resources[i - 1] : null;

									if (prevResource && prevResource.groupId !== resource.groupId) {
										groupedResources.push({ group: currentGroup, resources: currentChunk });
										currentChunk = [];
									}
									currentGroup = group;
									currentChunk.push(resource);
								});
								if (currentChunk.length > 0) {
									groupedResources.push({ group: currentGroup, resources: currentChunk });
								}

								return groupedResources.map((chunk, chunkIndex) => (
									<div key={`${chunk.group?.id}-${chunkIndex}`} className="flex border-b border-border relative">
										{/* Group Column (Sticky) */}
										<div className="sticky left-0 z-21 w-[var(--ui-space-12)] flex-shrink-0 bg-background border-r border-border flex items-center justify-center font-bold text-muted-foreground writing-mode-vertical-rl"
											style={{
												left: 0,
											}}>
											<div className="sticky top-0 py-2 max-h-screen">
												{chunk.group?.name || "-"}
											</div>
										</div>

										{/* Resources List for this Group */}
										<div className="flex flex-col flex-1 min-w-0">
											{chunk.resources.map((resource, resIndex) => (
												<div
													key={resource.id}
													className={`flex hover:bg-muted/5 group/row relative ${resIndex < chunk.resources.length - 1 ? "border-b border-border" : ""}`}
												>
													{/* Resource Header (Sticky column) */}
													<div className="w-[var(--ui-space-32)] flex-shrink-0 border-r border-border bg-background sticky left-[var(--ui-space-12)] z-20 px-[var(--ui-space-2)] py-[var(--ui-space-2)] flex flex-col justify-center">
														<div
															className="font-semibold text-xs leading-tight truncate"
															title={resource.name}
														>
															{resource.name}
														</div>
													</div>

													{/* Day Cells */}
													{weekDays.map((day) => {
														const normalizedDay = new Date(day);
														normalizedDay.setHours(0, 0, 0, 0);
														const isToday = normalizedDay.getTime() === today.getTime();
														const isClosed = isClosedDay(day, settings.closedDays);

														const dayKey = getDayKey(day);
														const dayEvents = eventsByDay.get(dayKey) ?? [];
														const cellEvents = filterEventsByResource(
															dayEvents,
															resource.id,
														);

														const bgClass = isClosed
															? "bg-muted"
															: isToday
																? "bg-primary/5"
																: "bg-background";

														return (
															<div
																key={day.toISOString()}
																className={`relative flex-1 border-r border-border p-[var(--ui-space-0-5)] min-w-[var(--ui-space-32)] min-h-[var(--ui-space-24)] ${bgClass} transition-colors overflow-hidden h-[var(--ui-space-24)]`}
															>
																<Button
																	type="button"
																	variant="ghost"
																	className="absolute inset-0 z-0 p-0 hover:bg-accent/30"
																	aria-label={`Add event to ${resource.name}`}
																	disabled={isClosed || !onEmptySlotClick}
																	onClick={() => onEmptySlotClick?.(resource.id, day)}
																/>
																<div className="relative z-10 flex flex-col gap-0.5 h-full overflow-hidden pointer-events-none">
																	{cellEvents
																		.slice(0, 3)
																		.map((event) => (
																			<EventCell
																				key={event.id}
																				event={event}
																				onClick={onEventClick}
																				components={components}
																			/>
																		))}
																	{cellEvents.length > 3 && (
																		<div className="text-[9px] text-muted-foreground text-center">
																			+{cellEvents.length - 3}
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
								));
							})()}
						</div>
					</div>
				) : (
					/* Horizontal Orientation (Default): Resources as Columns, Days as Rows */
					<div className="flex flex-col min-w-max">
						{/* Header Row (Resources) */}
						<div className="flex flex-col sticky top-0 z-30 bg-background border-b border-border">
							{/* Group Headers */}
							<div className="flex bg-background border-b border-border">
								<div
									className="flex-shrink-0 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)] bg-background sticky left-0 z-40"
									style={{ width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px` }}
								/>
								{(() => {
									const headers = [];
									for (let i = 0; i < resources.length; i++) {
										const resource = resources[i];
										const group = groupMap.get(resource.groupId);
										let colSpan = 1;
										// Calculate span
										while (i + colSpan < resources.length && resources[i + colSpan].groupId === resource.groupId) {
											colSpan++;
										}

										headers.push(
											<div
												key={`group-${resource.groupId}-${i}`}
												className="flex-1 flex items-center justify-center border-r border-border text-xs font-semibold bg-muted/20 truncate px-2 py-1"
												style={{ minWidth: `${colSpan * 80}px` }} // Approximate
											>
												{group?.name || "-"}
											</div>
										);
										i += colSpan - 1; // Skip handled resources
									}
									return headers;
								})()}
							</div>

							{/* Resource Headers */}
							<div className="flex">
								<div
									className="flex-shrink-0 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)] bg-background sticky left-0 z-40"
									style={{ width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px` }}
								/>
								{resources.map((resource) => {
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
										</div>
									);
								})}
							</div>
						</div>

						{/* Day Rows */}
						{weekDays.map((day) => {
							const normalizedDay = new Date(day);
							normalizedDay.setHours(0, 0, 0, 0);
							const isToday = normalizedDay.getTime() === today.getTime();
							const isClosed = isClosedDay(day, settings.closedDays);

							const dayKey = getDayKey(day);
							const eventsForDay = eventsByDay.get(dayKey) ?? [];

							return (
								<div key={day.toISOString()} className={`flex border-b border-border ${isToday ? "bg-primary/5" : ""}`}>
									{/* Date Cell (Sticky) */}
									<div
										className={`flex-shrink-0 border-r border-border px-[var(--ui-space-1)] py-[var(--ui-space-2)] flex items-center justify-center sticky left-0 z-20 ${isClosed ? "bg-muted" : "bg-card"}`}
										style={{
											width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px`,
											minHeight: `${WEEK_VIEW.DAY_CELL_HEIGHT}px`,
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
												className={`relative flex-1 border-r border-border p-[var(--ui-space-0-5)] min-w-[var(--ui-space-20)] ${isClosed ? "bg-muted" : "bg-card hover:bg-accent"} transition-colors overflow-hidden`}
												style={{ minHeight: `${WEEK_VIEW.DAY_CELL_HEIGHT}px` }}
											>
												<Button
													type="button"
													variant="ghost"
													className="absolute inset-0 z-0 p-0"
													aria-label={`Add event to ${resource.name}`}
													disabled={isClosed || !onEmptySlotClick}
													onClick={() => onEmptySlotClick?.(resource.id, day)}
												/>
												<div className="relative z-10 flex flex-col gap-0.5 h-full overflow-hidden pointer-events-none">
													{cellEvents
														.slice(0, WEEK_VIEW.MAX_VISIBLE_EVENTS)
														.map((event) => (
															<EventCell
																key={event.id}
																event={event}
																onClick={onEventClick}
																components={components}
															/>
														))}
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
				)}
			</div>
		</div>
	);
}

/**
 * EventCell Component for WeekView
 */
function EventCell({
	event,
	onClick,
	components,
}: {
	event: ScheduleEvent;
	onClick?: (e: ScheduleEvent) => void;
	components?: WeekViewProps["components"];
}) {
	const bgColor = event.hasConflict
		? "bg-destructive"
		: event.color
			? ""
			: "bg-primary";
	const customStyle =
		event.color && !event.hasConflict ? { backgroundColor: event.color } : {};

	const startTime = event.startDate.toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const CardContainer = ({ children }: { children: React.ReactNode }) => (
		<button
			type="button"
			className={`${bgColor} text-primary-foreground px-[var(--ui-space-1-5)] py-[var(--ui-space-0-5)] rounded text-[10px] cursor-pointer hover:brightness-110 transition-colors text-left leading-normal truncate w-full pointer-events-auto`}
			style={customStyle}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(event);
			}}
		>
			{children}
		</button>
	);

	if (components?.EventCard) {
		return (
			<CardContainer>
				<components.EventCard
					event={event}
					viewMode="week"
					isCompact={true}
					onClick={() => onClick?.(event)}
				/>
			</CardContainer>
		);
	}

	return (
		<CardContainer>
			<span className="font-medium">
				{event.hasConflict && "⚠️ "}
				{!event.isAllDay && `${startTime} `}
				{event.title}
			</span>
		</CardContainer>
	);
}
