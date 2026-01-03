/**
 * ScheduleEventCard - Component for displaying an event in the schedule
 * Ported from TreatmentCard.tsx
 */

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ScheduleEvent } from "../../FacilitySchedule.schema";

interface ScheduleEventCardProps {
	event: ScheduleEvent;
	top: number; // px from top
	height: number; // px height
	widthPercent?: number; // % width
	leftPercent?: number; // % left
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	isDragging?: boolean;
}

export function ScheduleEventCard({
	event,
	top,
	height,
	widthPercent = 100,
	leftPercent = 0,
	onClick,
	isDragging = false,
}: ScheduleEventCardProps) {
	const startTime = event.startDate.toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
	});
	const endTime = event.endDate.toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const durationHours =
		Math.round(
			((event.endDate.getTime() - event.startDate.getTime()) /
				(1000 * 60 * 60)) *
				10,
		) / 10;

	// Determine styling
	// Standard background only if no custom color is provided
	const bgColor = event.hasConflict
		? "bg-destructive border-destructive"
		: event.color
			? "border-primary/30" // If custom color, just border (or custom border)
			: "bg-primary border-primary/30";

	// Helper for formatting time
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const displayDuration = `${durationHours}h`;

	// Custom style overrides
	const customStyle: React.CSSProperties = {
		top: `${top}px`,
		height: `${height}px`,
		left: `${leftPercent}%`,
		width: `${widthPercent}%`,
		paddingLeft: leftPercent > 0 ? "2px" : "4px",
		paddingRight: leftPercent + widthPercent < 100 ? "2px" : "4px",
	};

	if (event.color && !event.hasConflict) {
		customStyle.backgroundColor = event.color;
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						className={`
        absolute rounded-md shadow-sm border
        transition-all duration-200 cursor-pointer
        ${isDragging ? "opacity-50 scale-95" : "hover:shadow-md hover:scale-[1.02] hover:z-10"}
        ${bgColor} text-primary-foreground text-left
        ${event.hasConflict ? "ring-2 ring-red-400 ring-offset-1" : ""}
      `}
						style={customStyle}
						onPointerUp={(e) => {
							e.stopPropagation();
						}}
						onClick={onClick}
					>
						<div className="p-[var(--ui-space-2)] h-full flex flex-col items-start justify-start overflow-hidden">
							{/* Conflict Warning */}
							{event.hasConflict && (
								<div className="text-xs font-bold mb-[var(--ui-space-1)]">
									⚠️ Double Booking
								</div>
							)}

							{/* Title */}
							<div className="font-semibold text-sm leading-snug break-words">
								{event.title}
							</div>

							{/* Attendee */}
							{event.attendee && (
								<div className="text-xs text-primary-foreground/90 truncate mt-[var(--ui-space-0-5)]">
									👤 {event.attendee}
								</div>
							)}

							{/* Time/Duration - Hidden for AllDay */}
							{!event.isAllDay && (
								<div className="flex items-center gap-[var(--ui-space-1)] text-[10px] opacity-90 mt-[var(--ui-space-1)]">
									<span className="font-mono tabular-nums tracking-tight">
										{formatTime(event.startDate)}
									</span>
									{durationHours >= 0.5 && (
										<>
											<span>-</span>
											<span className="font-mono tabular-nums tracking-tight">
												{formatTime(event.endDate)}
											</span>
											<span className="ml-[var(--ui-space-0-5)] opacity-75">
												({displayDuration})
											</span>
										</>
									)}
								</div>
							)}
						</div>
					</button>
				</TooltipTrigger>
				<TooltipContent>
					<div className="space-y-[var(--ui-space-1)]">
						{event.hasConflict && (
							<p className="font-bold text-xs text-red-600">⚠️ Double Booking</p>
						)}
						<p className="font-semibold text-xs">{event.title}</p>
						{event.attendee && (
							<p className="text-xs">With: {event.attendee}</p>
						)}
						<p className="text-xs">
							{startTime} - {endTime} ({durationHours}h)
						</p>
						{event.note && (
							<p className="text-[10px] text-muted-foreground max-w-[var(--ui-space-45)] break-words">
								{event.note}
							</p>
						)}
						{event.description && (
							<p className="text-[10px] text-muted-foreground max-w-[var(--ui-space-45)] break-words italic">
								{event.description}
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
