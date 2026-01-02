/**
 * Event Display Components
 */

import { useDraggable } from "@dnd-kit/core";
import type React from "react";
import type { ScheduleEvent } from "../../RegularCalendar.schema";

// Helper to get location string
const getEventLocation = (event: ScheduleEvent): string => {
	// Use extendedProps if available, or description
	if (event.extendedProps?.location) {
		const loc = event.extendedProps.location;
		if (typeof loc === "string") return loc;
		if (typeof loc === "object" && loc !== null) {
			const record = loc as Record<string, unknown>;
			const building =
				typeof record.building === "string" ? record.building : "";
			const room = typeof record.room === "string" ? record.room : "";
			return `${building} ${room}`.trim();
		}
	}
	return event.description || "";
};

// Helper to check if all day
const getEventIsAllDay = (event: ScheduleEvent): boolean => {
	return !!event.extendedProps?.isAllDay;
};

/**
 * Event Item for Day/Week View
 */
interface EventItemProps {
	event: ScheduleEvent;
	position: { top: number; height: number };
	column?: number; // 0-indexed column position for overlapping events
	totalColumns?: number; // Total columns in overlap group
	onEventClick?: (event: ScheduleEvent) => void;
}

// Helper to get display attendee
const getDisplayAttendee = (attendee?: string | null): string => {
	if (!attendee || attendee === "[]" || attendee === "") return "自分のみ";
	try {
		const parsed = JSON.parse(attendee);
		if (Array.isArray(parsed)) {
			const names = parsed
				.map((p) => {
					if (typeof p !== "object" || p === null) return null;
					if (!("name" in p)) return null;
					const name = (p as { name?: unknown }).name;
					return typeof name === "string" ? name : null;
				})
				.filter((name): name is string => Boolean(name));
			if (names.length > 0) return names.join(", ");
		}
	} catch {}
	return attendee;
};

export const EventItem: React.FC<EventItemProps> = ({
	event,
	position,
	column = 0,
	totalColumns = 1,
	onEventClick,
}) => {
	// Note: Drag functionality depends on DndContext being present in parent
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: event.id,
		data: event,
		disabled: false, // Default to true? Logic can be refined.
	});

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEventClick?.(event);
	};

	const title = event.title;
	const locationText = getEventLocation(event);
	// Use helper to allow "自分のみ" display
	const displayAttendee = getDisplayAttendee(event.attendee);

	// Calculate width and left position for overlapping events
	const widthPercent = 100 / totalColumns;
	const leftPercent = column * widthPercent;

	return (
		<button
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			onClick={handleClick}
			type="button"
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					onEventClick?.(event);
				}
			}}
			className={`
        absolute rounded px-1 py-1 text-sm cursor-pointer
        transition-all select-none
        active:scale-95
        ${isDragging ? "opacity-50" : "hover:shadow-md"}
      `}
			style={{
				top: `${position.top}px`,
				height: `${position.height}px`,
				minHeight: "44px",
				left: `calc(${leftPercent}% + 2px)`,
				width: `calc(${widthPercent}% - 4px)`,
				backgroundColor: event.color || "#3b82f6",
				color: "white",
				zIndex: isDragging ? 50 : 10 + column,
			}}
		>
			<div className="font-medium truncate text-xs">{title}</div>
			<div className="text-[10px] opacity-90 truncate">{displayAttendee}</div>
			{position.height > 60 && locationText && (
				<div className="text-[10px] opacity-90 truncate">{locationText}</div>
			)}
		</button>
	);
};

/**
 * Event Item for Month View
 */
interface MonthEventItemProps {
	event: ScheduleEvent;
	onClick?: (event: ScheduleEvent) => void;
}

export const MonthEventItem: React.FC<MonthEventItemProps> = ({
	event,
	onClick,
}) => {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick?.(event);
	};

	const title = event.title;
	const isAllDay = getEventIsAllDay(event);

	const timeStr = isAllDay
		? "All Day"
		: `${event.startDate.getHours()}:${event.startDate.getMinutes().toString().padStart(2, "0")}`;

	return (
		<button
			type="button"
			onClick={handleClick}
			className="w-full text-left text-sm px-2 py-1 mb-0.5 rounded truncate cursor-pointer active:scale-95 transition-transform select-none border-0 min-h-[28px] flex items-center"
			style={{
				backgroundColor: event.color || "#3b82f6",
				color: "white",
			}}
		>
			<span className="font-medium mr-1">{timeStr}</span> {title}
		</button>
	);
};

/**
 * Drag Overlay Component
 */
interface EventDragOverlayProps {
	event: ScheduleEvent;
}

export const EventDragOverlay: React.FC<EventDragOverlayProps> = ({
	event,
}) => {
	const title = event.title;
	const locationText = getEventLocation(event);
	const displayAttendee = getDisplayAttendee(event.attendee);
	const isSelfOnly = displayAttendee === "自分のみ";

	return (
		<div
			className="rounded px-2 py-2 text-sm shadow-lg min-h-[44px] flex flex-col justify-center"
			style={{
				backgroundColor: event.color || "#3b82f6",
				color: "white",
				width: "200px",
			}}
		>
			<div className="font-medium">{title}</div>
			<div className="text-xs opacity-90">
				{isSelfOnly ? displayAttendee : `with ${displayAttendee}`}
			</div>
			{locationText && <div className="text-sm opacity-90">{locationText}</div>}
		</div>
	);
};
