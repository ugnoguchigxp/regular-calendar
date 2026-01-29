import { useDroppable } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { useAppTranslation } from "@/utils/i18n";
import {
	DEFAULT_VIEW_HOURS,
	TIME_SLOT_HEIGHT,
	TIME_SLOT_WIDTH,
} from "../../constants/calendarConstants";
import type { RegularCalendarComponents } from "../../RegularCalendar";
import type {
	FacilityScheduleSettings,
	Resource,
	ScheduleEvent,
	ViewMode,
} from "../../RegularCalendar.schema";
import {
	calculateEventPosition,
	generateTimeSlots,
	getEventsForDate,
} from "../../utils/calendarHelpers";
import { CurrentTimeLine } from "../Common/CurrentTimeLine";
import { EventItem } from "../Common/EventComponents";

interface DayViewProps {
	currentDate: Date;
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;
	onTimeSlotClick?: (date: Date, timeSlot: string) => void;
	onEventClick?: (event: ScheduleEvent) => void;
	currentUserId?: string;
	resources?: Resource[];
	renderEventContent?: (
		event: ScheduleEvent,
		viewMode: ViewMode,
	) => React.ReactNode;
	components?: RegularCalendarComponents;
}

const DroppableSlot = ({
	date,
	timeSlot,
	onClick,
	orientation = "horizontal",
}: {
	date: Date;
	timeSlot: string;
	onClick?: (date: Date, timeSlot: string) => void;
	orientation?: "horizontal" | "vertical";
}) => {
	// Generate an ID that can be parsed back to a Date
	// Format: YYYY-MM-DDTHH:mm
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const slotId = `${year}-${month}-${day}T${timeSlot}`;

	const { setNodeRef, isOver } = useDroppable({
		id: slotId,
	});

	const isVertical = orientation === "vertical";

	return (
		<button
			ref={setNodeRef}
			type="button"
			onClick={() => onClick?.(date, timeSlot)}
			className={`
        border-border cursor-pointer transition-colors p-0 m-0 block box-border
        ${isVertical ? "border-r h-full flex-shrink-0" : "border-b w-full text-left"}
        ${isOver ? "bg-accent/50" : "hover:bg-muted/30"}
      `}
			style={
				isVertical
					? { width: `${TIME_SLOT_WIDTH}px` }
					: { height: `${TIME_SLOT_HEIGHT}px` }
			}
			aria-label={`Time slot ${timeSlot}`}
		/>
	);
};

export function DayView({
	currentDate,
	events,
	settings,
	onTimeSlotClick,
	onEventClick,
	currentUserId,
	resources,
	renderEventContent,
	components,
}: DayViewProps) {
	const { t } = useAppTranslation();
	const timeInterval = settings.slotInterval || settings.defaultDuration || 60;
	const startHour = Number(
		(settings.startTime || settings.businessHoursStart)?.split(":")[0] ||
		DEFAULT_VIEW_HOURS.start,
	);
	const endHour = Number(
		(settings.endTime || settings.businessHoursEnd)?.split(":")[0] ||
		DEFAULT_VIEW_HOURS.end,
	);

	const timeSlots = useMemo(
		() => generateTimeSlots(timeInterval, startHour, endHour),
		[timeInterval, startHour, endHour],
	);

	const dayEvents = useMemo(
		() => getEventsForDate(events, currentDate, startHour, endHour),
		[events, currentDate, startHour, endHour],
	);

	const { allDayEvents, timeEvents } = useMemo(() => {
		const allDay: ScheduleEvent[] = [];
		const time: ScheduleEvent[] = [];
		dayEvents.forEach((e) => {
			if (e.isAllDay) allDay.push(e);
			else time.push(e);
		});
		return { allDayEvents: allDay, timeEvents: time };
	}, [dayEvents]);

	const eventsWithPosition = useMemo(
		() =>
			timeEvents.map((event) => ({
				event,
				position: calculateEventPosition(
					event,
					timeInterval,
					startHour,
					settings.timeZone,
				),
			})),
		[timeEvents, timeInterval, startHour, settings.timeZone],
	);

	const today = new Date();
	const isToday = currentDate.toDateString() === today.toDateString();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [scrollbarPadding, setScrollbarPadding] = useState(0);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const measure = () => {
			const padding = container.offsetWidth - container.clientWidth;
			setScrollbarPadding(padding > 0 ? padding : 0);
		};

		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, []);

	const orientation = settings.orientation || "horizontal";
	const isVertical = orientation === "vertical";

	return (
		<div className="flex flex-col h-full bg-background text-foreground">
			{!isVertical ? (
				/* Standard Vertical Timeline (Hours on Y axis) */
				<>
					{/* Date Header */}
					<div
						className={`border-b border-border p-[var(--ui-space-2)] sticky top-[var(--ui-space-0)] z-30 text-center ${isToday ? "bg-muted/50" : "bg-muted/40"
							}`}
						style={{ paddingRight: scrollbarPadding || undefined }}
					>
						<div className="text-xs font-medium text-muted-foreground">
							<DateDisplay date={currentDate} format="weekday" />
						</div>
						<div
							className={`text-xl font-bold mt-[var(--ui-space-1)] ${isToday ? "text-primary" : ""}`}
						>
							{currentDate.getDate()}
						</div>
					</div>

					{/* All Day Events Row */}
					{allDayEvents.length > 0 && (
						<div
							className="flex border-b border-border bg-muted/20 sticky top-[var(--ui-space-13)] z-30"
							style={{ paddingRight: scrollbarPadding || undefined }}
						>
							<div className="w-[var(--ui-space-16)] flex-shrink-0 border-r border-border bg-background flex items-center justify-end pr-[var(--ui-space-1)]">
								<span className="text-[9px] text-muted-foreground">
									{t("all_day")}
								</span>
							</div>
							<div className="flex-1 p-[var(--ui-space-0-5)] min-w-[var(--ui-space-0)]">
								<div className="flex flex-col gap-[var(--ui-space-0-5)]">
									{allDayEvents.map((event) => (
										<button
											key={event.id}
											type="button"
											className={`
                                        text-[9px] px-[var(--ui-space-1)] py-[var(--ui-space-0-5)] rounded w-full text-left truncate leading-tight
                                        bg-primary text-primary-foreground
                                        hover:brightness-110 transition-colors
                                    `}
											style={
												event.color ? { backgroundColor: event.color } : {}
											}
											onClick={(e) => {
												e.stopPropagation();
												onEventClick?.(event);
											}}
										>
											{components?.EventCard ? (
												<components.EventCard
													event={event}
													viewMode="day"
													isCompact={true}
													onClick={() => onEventClick?.(event)}
												/>
											) : (
												event.title
											)}
										</button>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Grid */}
					<div
						className="flex-1 overflow-y-auto relative"
						ref={scrollContainerRef}
					>
						<div
							className="flex"
							style={{
								minHeight: `${(((endHour - startHour) * 60) / timeInterval) * TIME_SLOT_HEIGHT}px`,
							}}
						>
							<div className="w-[var(--ui-space-16)] flex-shrink-0 bg-background sticky left-[var(--ui-space-0)] z-20">
								{timeSlots.map((timeSlot) => (
									<div
										key={timeSlot}
										className="border-b border-border text-xs text-muted-foreground p-0 flex items-center justify-end pr-[var(--ui-space-2)] box-border"
										style={{ height: `${TIME_SLOT_HEIGHT}px` }}
									>
										{timeSlot}
									</div>
								))}
							</div>
							<div className="flex-1 relative border-l border-border min-w-[var(--ui-space-50)]">
								<CurrentTimeLine
									interval={timeInterval}
									isToday={isToday}
									startHour={startHour}
									endHour={endHour}
									relative={true}
									timeZone={settings.timeZone}
								/>

								{/* Slots Background */}
								{timeSlots.map((timeSlot) => (
									<DroppableSlot
										key={timeSlot}
										date={currentDate}
										timeSlot={timeSlot}
										onClick={onTimeSlotClick}
										orientation="horizontal"
									/>
								))}

								{/* Events */}
								{eventsWithPosition.map(({ event, position }) => (
									<EventItem
										key={event.id}
										event={event}
										position={position}
										onEventClick={onEventClick}
										currentUserId={currentUserId}
										resources={resources}
										renderEventContent={renderEventContent}
										components={components}
										viewMode="day"
										orientation="horizontal"
									/>
								))}
							</div>
						</div>
					</div>
				</>
			) : (
				/* Horizontal Timeline (Hours on X axis) */
				<div className="flex-1 overflow-auto relative">
					<div
						className="flex flex-col min-w-max"
						style={{
							minWidth: `${timeSlots.length * TIME_SLOT_WIDTH + 128}px`,
						}}
					>
						{/* Header - Time Slots Row */}
						<div className="flex border-b border-border bg-muted/40 sticky top-0 z-30">
							<div className="w-[var(--ui-space-32)] flex-shrink-0 border-r border-border bg-background sticky left-0 z-40" />
							<div className="flex">
								{timeSlots.map((timeSlot) => (
									<div
										key={timeSlot}
										className="flex-shrink-0 text-center border-r border-border text-[10px] text-muted-foreground p-1 flex items-center justify-center box-border"
										style={{ width: `${TIME_SLOT_WIDTH}px` }}
									>
										{timeSlot}
									</div>
								))}
							</div>
						</div>

						{/* Grid */}
						<div
							className={`flex border-b border-border relative min-h-[var(--ui-space-20)] ${isToday ? "bg-primary/5" : ""}`}
						>
							{/* Date Label Column */}
							<div className="w-[var(--ui-space-32)] flex-shrink-0 border-r border-border sticky left-0 z-20 bg-background p-2 flex flex-col items-center justify-center">
								<div className="text-xs font-medium text-muted-foreground">
									<DateDisplay date={currentDate} format="weekday" />
								</div>
								<div
									className={`text-xl font-bold mt-[var(--ui-space-1)] ${isToday ? "text-primary" : ""}`}
								>
									{currentDate.getDate()}
								</div>
							</div>

							{/* Time Slots Area */}
							<div className="flex relative">
								{timeSlots.map((timeSlot) => (
									<DroppableSlot
										key={`${currentDate.toISOString()}-${timeSlot}`}
										date={currentDate}
										timeSlot={timeSlot}
										onClick={onTimeSlotClick}
										orientation="vertical"
									/>
								))}

								{/* Events */}
								{eventsWithPosition.map(({ event, position }) => (
									<EventItem
										key={event.id}
										event={event}
										position={{
											top: (position.top / TIME_SLOT_HEIGHT) * TIME_SLOT_WIDTH,
											height: (position.height / TIME_SLOT_HEIGHT) * TIME_SLOT_WIDTH,
										}}
										onEventClick={onEventClick}
										currentUserId={currentUserId}
										resources={resources}
										renderEventContent={renderEventContent}
										components={components}
										viewMode="day"
										orientation="vertical"
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
